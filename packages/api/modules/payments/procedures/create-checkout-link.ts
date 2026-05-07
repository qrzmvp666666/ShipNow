import { ORPCError } from "@orpc/client";
import { getOrganizationById } from "@repo/database";
import { logger } from "@repo/logs";
import {
	createCheckoutLink as createCheckoutLinkFn,
	createQiXiangCheckoutLink,
	findPriceByPlanId,
	getCustomerIdFromEntity,
	getProviderPriceIdByPlanId,
	type PlanId,
} from "@repo/payments";
import { getBaseUrl } from "@repo/utils";
import { z } from "zod";

import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { protectedProcedure } from "../../../orpc/procedures";

export const createCheckoutLink = protectedProcedure
	.use(localeMiddleware)
	.route({
		method: "POST",
		path: "/payments/create-checkout-link",
		tags: ["Payments"],
		summary: "Create checkout link",
		description: "Creates a checkout link for a one-time or subscription product",
	})
	.input(
		z.object({
			planId: z.string(),
			type: z.enum(["one-time", "subscription"]),
			interval: z.enum(["month", "year"]).optional(),
			redirectUrl: z.string().optional(),
			organizationId: z.string().optional(),
			/**
			 * Payment method selected by the user.  WeChat and Alipay are routed
			 * to the QiXiang provider; card payments use Stripe.
			 */
			paymentMethod: z
				.enum(["card", "wechat_person", "alipay_person"])
				.optional()
				.default("card"),
		}),
	)
	.handler(
		async ({
			input: { planId, redirectUrl, type, interval, organizationId, paymentMethod },
			context: { user },
		}) => {
			const normalizedType = type === "subscription" ? "subscription" : "one-time";
			const price = findPriceByPlanId(planId as PlanId, {
				type: normalizedType,
				interval,
				paymentMethod,
			});
			const priceId = getProviderPriceIdByPlanId(planId as PlanId, {
				type: normalizedType,
				interval,
				paymentMethod,
			});

			if (!price || !priceId) {
				throw new ORPCError("NOT_FOUND");
			}

			// ── QiXiang (WeChat / Alipay) ─────────────────────────────────────
			if (paymentMethod === "wechat_person" || paymentMethod === "alipay_person") {
				const qixiangType = paymentMethod === "wechat_person" ? "wxpay" : "alipay";
				const baseUrl = getBaseUrl(process.env.NEXT_PUBLIC_SAAS_URL, 3000);

				const param = JSON.stringify({
					...(organizationId ? { organizationId } : { userId: user.id }),
					priceId,
				});

				try {
					const { checkoutLink } = await createQiXiangCheckoutLink({
						type: qixiangType,
						amount: price.amount,
						productName: planId,
						notifyUrl: `${baseUrl}/api/webhooks/payments/qixiang`,
						returnUrl: redirectUrl ?? `${baseUrl}/checkout-return`,
						param,
					});

					return { checkoutLink };
				} catch (e) {
					logger.error(e);
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}
			}

			// ── Stripe (card) ─────────────────────────────────────────────────
			const customerId = await getCustomerIdFromEntity(
				organizationId ? { organizationId } : { userId: user.id },
			);

			const trialPeriodDays =
				price && "trialPeriodDays" in price ? price.trialPeriodDays : undefined;

			const organization = organizationId
				? await getOrganizationById(organizationId)
				: undefined;

			if (organization === null) {
				throw new ORPCError("NOT_FOUND");
			}

			const seats =
				organization && price && "seatBased" in price && price.seatBased
					? organization.members.length
					: undefined;

			try {
				const checkoutLink = await createCheckoutLinkFn({
					type,
					priceId,
					email: user.email,
					name: user.name ?? "",
					redirectUrl,
					...(organizationId ? { organizationId } : { userId: user.id }),
					trialPeriodDays,
					seats,
					customerId: customerId ?? undefined,
				});

				if (!checkoutLink) {
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}

				return { checkoutLink };
			} catch (e) {
				logger.error(e);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		},
	);
