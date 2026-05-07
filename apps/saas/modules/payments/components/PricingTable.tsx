"use client";

import { usePlanData } from "@payments/hooks/plan-data";
import type { PlanId } from "@payments/types";
import { config as paymentsConfig } from "@repo/payments/config";
import type { PaidPlan, PaymentMethod } from "@repo/payments/types";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { toastError } from "@repo/ui/components/toast";
import { useRouter } from "@shared/hooks/router";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import {
	ArrowRightIcon,
	BadgePercentIcon,
	CheckIcon,
	CreditCardIcon,
	StarIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

function WechatPayIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="#07C160"
				d="M9.2 3.5C5.22 3.5 2 6.18 2 9.5c0 1.88 1.03 3.54 2.63 4.64L4 17l2.37-1.18c.9.24 1.85.36 2.83.36 3.98 0 7.2-2.68 7.2-5.98S13.18 3.5 9.2 3.5Z"
			/>
			<path
				fill="#07C160"
				d="M16.8 9.85c-2.87 0-5.2 1.94-5.2 4.34 0 2.42 2.33 4.37 5.2 4.37.63 0 1.24-.1 1.8-.28L21 19.5l-.6-2.03c1-.8 1.6-1.95 1.6-3.28 0-2.4-2.33-4.34-5.2-4.34Z"
			/>
			<circle cx="7.2" cy="8.9" r="0.9" fill="#FFFFFF" />
			<circle cx="11.1" cy="8.9" r="0.9" fill="#FFFFFF" />
			<circle cx="15.2" cy="13.9" r="0.8" fill="#FFFFFF" />
			<circle cx="18.3" cy="13.9" r="0.8" fill="#FFFFFF" />
		</svg>
	);
}

function AlipayIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="#1677FF" />
			<path
				fill="#FFFFFF"
				d="M6 6.1h12v1.9H6zM10.9 3.9h2.2v7.2h-2.2zM6.2 11.2c1.6-.8 3.4-1.2 5.4-1.2 1.8 0 3.8.4 6 1.3l-.8 1.9c-1.4-.5-2.6-.8-3.7-1 .9 1 2 1.9 3.4 2.8l-1.5 1.7c-1.7-1-3.2-2.3-4.4-3.8-.9 1.7-2.5 3.3-5 4.8L4.4 16c2.8-1.5 4.4-3.1 5-4.8-1.3 0-2.4.2-3.4.7z"
			/>
		</svg>
	);
}

const plans = paymentsConfig.plans;

interface PlanSelection {
	type: "one-time" | "subscription";
	interval?: "month" | "year";
}

export function PricingTable({
	className,
	userId,
	organizationId,
	activePlanId,
}: {
	className?: string;
	userId?: string;
	organizationId?: string;
	activePlanId?: string;
}) {
	const t = useTranslations();
	const format = useFormatter();
	const router = useRouter();
	const [loading, setLoading] = useState<PlanId | false>(false);
	const [interval, setInterval] = useState<"month" | "year">("month");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

	const { planData } = usePlanData();

	const createCheckoutLinkMutation = useMutation(
		orpc.payments.createCheckoutLink.mutationOptions(),
	);

	const onSelectPlan = async (planId: PlanId, selection?: PlanSelection) => {
		if (!(userId || organizationId)) {
			router.push("/signup");
			return;
		}

		if (!selection) {
			return;
		}

		setLoading(planId);

		try {
			const { checkoutLink } = await createCheckoutLinkMutation.mutateAsync({
				planId,
				type: selection.type,
				interval: selection.interval,
				organizationId,
				paymentMethod,
				redirectUrl: organizationId
					? `${window.location.origin}/checkout-return?organizationId=${organizationId}`
					: `${window.location.origin}/checkout-return`,
			});

			window.location.href = checkoutLink;
		} catch (error) {
			console.error(error);
			toastError("支付失败", error instanceof Error ? error.message : "发起支付时出错，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	const isChinesePayment = paymentMethod === "wechat_person" || paymentMethod === "alipay_person";

	// Filter plans: exclude current plan, and hide subscription-only plans when using Chinese payment
	const filteredPlans = Object.entries(plans).filter(([planId, plan]) => {
		if (planId === activePlanId) return false;
		if (!isChinesePayment) return true;
		if ("isEnterprise" in plan) return true;
		return (plan as PaidPlan).prices.some((p) => (p.paymentMethod ?? "card") === paymentMethod);
	});

	const hasSubscriptions =
		!isChinesePayment &&
		Object.values(plans).some((plan) =>
			"prices" in plan
				? (plan as PaidPlan).prices.some((price) => price.type === "subscription")
				: false,
		);

	return (
		<div className={cn("@container", className)}>
			<div className="mb-4 gap-2 flex flex-wrap items-center justify-center">
				<span className="text-sm text-foreground/50">{t("pricing.paymentMethod")}:</span>
				<button
					type="button"
					onClick={() => setPaymentMethod("card")}
					className={cn(
						"gap-1.5 px-3 py-1.5 text-xs font-medium flex items-center rounded-full border transition-all",
						paymentMethod === "card"
							? "border-foreground/30 bg-foreground/10 text-foreground"
							: "border-border text-foreground/50 hover:border-foreground/30 hover:text-foreground/80",
					)}
				>
					<CreditCardIcon className="size-3.5" />
					{t("pricing.paymentMethods.card")}
				</button>
				<button
					type="button"
					onClick={() => setPaymentMethod("wechat_person")}
					className={cn(
						"gap-1.5 px-3 py-1.5 text-xs font-medium flex items-center rounded-full border transition-all",
						paymentMethod === "wechat_person"
							? "border-[#07c160] bg-[#07c160]/10 text-[#07c160]"
							: "border-border text-foreground/50 hover:border-[#07c160]/50 hover:text-[#07c160]/80",
					)}
				>
					<WechatPayIcon className="size-3.5" />
					{t("pricing.paymentMethods.wechat_person")}
				</button>
				<button
					type="button"
					onClick={() => setPaymentMethod("alipay_person")}
					className={cn(
						"gap-1.5 px-3 py-1.5 text-xs font-medium flex items-center rounded-full border transition-all",
						paymentMethod === "alipay_person"
							? "border-[#1677ff] bg-[#1677ff]/10 text-[#1677ff]"
							: "border-border text-foreground/50 hover:border-[#1677ff]/50 hover:text-[#1677ff]/80",
					)}
				>
					<AlipayIcon className="size-3.5" />
					{t("pricing.paymentMethods.alipay_person")}
				</button>
			</div>

			{hasSubscriptions && (
				<div className="mb-6 flex justify-center">
					<Tabs
						value={interval}
						onValueChange={(value) => setInterval(value as typeof interval)}
						data-test="price-table-interval-tabs"
					>
						<TabsList className="border-foreground/10">
							<TabsTrigger value="month">{t("pricing.monthly")}</TabsTrigger>
							<TabsTrigger value="year">{t("pricing.yearly")}</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			)}

			<div
				className={cn(
					"gap-4 grid grid-cols-1 mx-auto",
					filteredPlans.length <= 2
						? "max-w-4xl md:grid-cols-2"
						: "max-w-6xl md:grid-cols-2 lg:grid-cols-3",
				)}
			>
				{filteredPlans.map(([planId, plan]) => {
					const isEnterprise = "isEnterprise" in plan ? plan.isEnterprise : false;
					const prices = "prices" in plan ? (plan as PaidPlan).prices : undefined;
					const recommended = plan.recommended ?? false;
					const hidden = plan.hidden ?? false;

					const planDataEntry = planData[planId as keyof typeof planData];

					if (!planDataEntry) {
						return null;
					}

					const { title, description, features } = planDataEntry;

					const price = prices?.find(
						(price) =>
							!hidden &&
							(price.type === "one-time" || price.interval === interval) &&
							(price.paymentMethod ?? "card") === paymentMethod,
					);

					if (!price && !isEnterprise) {
						return null;
					}

					return (
						<div
							key={planId}
							className={cn("p-6 rounded-3xl border bg-card", {
								"border-primary": recommended,
							})}
							data-test="price-table-plan"
						>
							<div className="gap-4 flex h-full flex-col justify-between">
								<div>
									{recommended && (
										<div className="-mt-9 flex justify-center">
											<div className="mb-2 h-6 gap-1.5 px-2 py-1 font-semibold text-xs flex w-auto items-center rounded-full bg-primary text-primary-foreground">
												<StarIcon className="size-3" />
												{t("pricing.recommended")}
											</div>
										</div>
									)}
									<h3
										className={cn("my-0 font-semibold text-2xl", {
											"font-bold text-primary": recommended,
										})}
									>
										{title}
									</h3>
									{description && (
										<div className="prose mt-2 text-sm text-foreground/60">
											{description}
										</div>
									)}

									{!!features?.length && (
										<ul className="mt-4 gap-2 text-sm grid list-none">
											{features.map((feature, key) => (
												<li
													key={key}
													className="flex items-center justify-start"
												>
													<CheckIcon className="mr-2 size-4 text-primary" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
									)}

									{price &&
										"trialPeriodDays" in price &&
										price.trialPeriodDays && (
											<div className="mt-4 font-medium text-sm flex items-center justify-start text-primary opacity-80">
												<BadgePercentIcon className="mr-2 size-4" />
												{t("pricing.trialPeriod", {
													days: price.trialPeriodDays,
												})}
											</div>
										)}
								</div>

								<div>
									{price && (
										<strong
											className="font-medium text-2xl lg:text-3xl block"
											data-test="price-table-plan-price"
										>
											{format.number(price.amount, {
												style: "currency",
												currency: price.currency,
											})}
											{"interval" in price && (
												<span className="font-normal text-xs opacity-60">
													{" / "}
													{interval === "month"
														? t("pricing.month", {
																count: 1,
															})
														: t("pricing.year", {
																count: 1,
															})}
												</span>
											)}
											{organizationId &&
												"seatBased" in price &&
												price.seatBased && (
													<span className="font-normal text-xs opacity-60">
														{" / "}
														{t("pricing.perSeat")}
													</span>
												)}
										</strong>
									)}

									<Button
										className="mt-4 w-full"
										variant={recommended ? "primary" : "secondary"}
										onClick={() =>
											onSelectPlan(
												planId as PlanId,
												price
													? {
															type:
																price.type === "one-time"
																	? "one-time"
																	: "subscription",
															interval:
																price.type === "subscription"
																	? price.interval
																	: undefined,
														}
													: undefined,
											)
										}
										loading={loading === planId}
									>
										{userId || organizationId
											? t("pricing.choosePlan")
											: t("pricing.getStarted")}
										<ArrowRightIcon className="ml-2 size-4" />
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
