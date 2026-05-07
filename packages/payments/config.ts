import type { PaymentsConfig } from "./types";

export const config: PaymentsConfig = {
	billingAttachedTo: "user",
	requireActiveSubscription: false,
	plans: {
		pro: {
			recommended: true,
			prices: [
				// ── Pro Monthly (card only — WeChat/Alipay are lifetime-only) ─
				{
					type: "subscription",
					paymentMethod: "card",
					priceId: (process.env.PRICE_ID_PRO_MONTHLY_CARD ??
						process.env.PRICE_ID_PRO_MONTHLY) as string,
					interval: "month",
					amount: Number(process.env.NEXT_PUBLIC_PRICE_AMOUNT_PRO_MONTHLY_CARD ?? 29),
					currency: process.env.NEXT_PUBLIC_PRICE_CURRENCY_PRO_MONTHLY_CARD ?? "USD",
					seatBased: true,
					trialPeriodDays: 7,
				},
				// ── Pro Yearly (card only) ────────────────────────────────────
				{
					type: "subscription",
					paymentMethod: "card",
					priceId: (process.env.PRICE_ID_PRO_YEARLY_CARD ??
						process.env.PRICE_ID_PRO_YEARLY) as string,
					interval: "year",
					amount: Number(process.env.NEXT_PUBLIC_PRICE_AMOUNT_PRO_YEARLY_CARD ?? 290),
					currency: process.env.NEXT_PUBLIC_PRICE_CURRENCY_PRO_YEARLY_CARD ?? "USD",
					seatBased: true,
					trialPeriodDays: 7,
				},
			],
		},
		lifetime: {
			prices: [
				// ── Lifetime Card (Stripe) ────────────────────────────────────
				{
					type: "one-time",
					paymentMethod: "card",
					priceId: (process.env.PRICE_ID_LIFETIME_CARD ??
						process.env.PRICE_ID_LIFETIME) as string,
					amount: Number(process.env.NEXT_PUBLIC_PRICE_AMOUNT_LIFETIME_CARD ?? 799),
					currency: process.env.NEXT_PUBLIC_PRICE_CURRENCY_LIFETIME_CARD ?? "USD",
				},
				// ── Lifetime WeChat (QiXiang) ─────────────────────────────────
				// priceId is a synthetic internal identifier, not a Stripe price ID.
				// Set PRICE_ID_LIFETIME_WECHAT to e.g. "qixiang_lifetime_wechat".
				{
					type: "one-time",
					paymentMethod: "wechat_person",
					priceId: process.env.PRICE_ID_LIFETIME_WECHAT as string,
					amount: Number(process.env.NEXT_PUBLIC_PRICE_AMOUNT_LIFETIME_WECHAT ?? 5999),
					currency: process.env.NEXT_PUBLIC_PRICE_CURRENCY_LIFETIME_WECHAT ?? "CNY",
				},
				// ── Lifetime Alipay (QiXiang) ─────────────────────────────────
				// priceId is a synthetic internal identifier, not a Stripe price ID.
				// Set PRICE_ID_LIFETIME_ALIPAY to e.g. "qixiang_lifetime_alipay".
				{
					type: "one-time",
					paymentMethod: "alipay_person",
					priceId: process.env.PRICE_ID_LIFETIME_ALIPAY as string,
					amount: Number(process.env.NEXT_PUBLIC_PRICE_AMOUNT_LIFETIME_ALIPAY ?? 5999),
					currency: process.env.NEXT_PUBLIC_PRICE_CURRENCY_LIFETIME_ALIPAY ?? "CNY",
				},
			],
		},
		enterprise: {
			isEnterprise: true,
		},
	},
};
