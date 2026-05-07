import { getOrganizationList, getSession } from "@auth/lib/server";
import { PricingTable } from "@payments/components/PricingTable";
import { listPurchases } from "@payments/lib/server";
import { config as authConfig } from "@repo/auth/config";
import {
	createCheckoutLink,
	createQiXiangCheckoutLink,
	findPriceByPlanId,
	getCustomerIdFromEntity,
	getProviderPriceIdByPlanId,
	type PlanId,
} from "@repo/payments";
import { config as paymentsConfig } from "@repo/payments/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
	const t = await getTranslations("choosePlan");

	return {
		title: t("title"),
	};
}

export default async function ChoosePlanPage({
	searchParams,
}: {
	searchParams: Promise<{ planId?: string; interval?: string; paymentMethod?: string }>;
}) {
	const t = await getTranslations("choosePlan");
	const { planId, interval, paymentMethod } = await searchParams;
	const session = await getSession();
	const selectedPaymentMethod =
		paymentMethod === "wechat_person" || paymentMethod === "alipay_person"
			? paymentMethod
			: "card";

	if (!session) {
		const loginPath = planId
			? `/login?redirectTo=${encodeURIComponent(`/choose-plan?planId=${planId}${interval ? `&interval=${interval}` : ""}&paymentMethod=${selectedPaymentMethod}`)}`
			: "/login";
		redirect(loginPath);
	}

	let organizationId: string | undefined;
	if (authConfig.organizations.enable && paymentsConfig.billingAttachedTo === "organization") {
		const organization = (await getOrganizationList()).at(0);

		if (!organization) {
			redirect("/new-organization");
		}

		organizationId = organization.id;
	}

	const purchases = await listPurchases(organizationId);

	const { activePlan } = createPurchasesHelper(purchases);

	if (activePlan && activePlan.id !== "free") {
		redirect("/");
	}

	// If planId is provided, skip the plan selection page and go directly to checkout
	if (planId) {
		const normalizedInterval = interval === "year" ? "year" : "month";
		const price =
			findPriceByPlanId(planId as PlanId, {
				type: "subscription",
				interval: normalizedInterval,
				paymentMethod: selectedPaymentMethod,
			}) ??
			findPriceByPlanId(planId as PlanId, {
				type: "one-time",
				paymentMethod: selectedPaymentMethod,
			});

		const priceId = price
			? getProviderPriceIdByPlanId(planId as PlanId, {
					type: price.type,
					interval: price.type === "subscription" ? price.interval : undefined,
					paymentMethod: selectedPaymentMethod,
				})
			: null;

		if (price && priceId) {
			const appUrl =
				process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
			const redirectUrl = organizationId
				? `${appUrl}/checkout-return?organizationId=${organizationId}`
				: `${appUrl}/checkout-return`;

			if (
				selectedPaymentMethod === "wechat_person" ||
				selectedPaymentMethod === "alipay_person"
			) {
				const { checkoutLink } = await createQiXiangCheckoutLink({
					type: selectedPaymentMethod === "wechat_person" ? "wxpay" : "alipay",
					amount: price.amount,
					productName: planId,
					notifyUrl: `${appUrl}/api/webhooks/payments/qixiang`,
					returnUrl: redirectUrl,
					param: JSON.stringify({
						...(organizationId ? { organizationId } : { userId: session.user.id }),
						priceId,
					}),
				});

				redirect(checkoutLink);
			}

			const customerId = await getCustomerIdFromEntity(
				organizationId ? { organizationId } : { userId: session.user.id },
			);

			const checkoutLink = await createCheckoutLink({
				type: price.type,
				priceId,
				email: session.user.email,
				name: session.user.name ?? "",
				redirectUrl,
				...(organizationId ? { organizationId } : { userId: session.user.id }),
				trialPeriodDays: "trialPeriodDays" in price ? price.trialPeriodDays : undefined,
				customerId: customerId ?? undefined,
			});

			if (checkoutLink) {
				redirect(checkoutLink);
			}
		}
	}

	return (
		<AuthWrapper contentClass="max-w-5xl">
			<div className="mb-4 text-center">
				<h1 className="font-bold text-2xl lg:text-3xl text-center">{t("title")}</h1>
				<p className="text-sm lg:text-base text-muted-foreground">{t("description")}</p>
			</div>

			<div>
				<PricingTable
					{...(organizationId
						? {
								organizationId,
							}
						: {
								userId: session.user.id,
							})}
				/>
			</div>
		</AuthWrapper>
	);
}
