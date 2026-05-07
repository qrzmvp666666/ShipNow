import { config } from "../config";
import type { PaidPlan, PaymentMethod, PlanPrice } from "../types";

export type PlanId = keyof typeof config.plans;
export type RecurringInterval = Extract<PlanPrice, { type: "subscription" }>["interval"];

export function getPaidPlan(planId: PlanId) {
	const plan = config.plans[planId];

	if (!plan || !("prices" in plan)) {
		return null;
	}

	return plan as PaidPlan;
}

export function findPriceByPlanId(
	planId: PlanId,
	selection: {
		type: PlanPrice["type"];
		interval?: RecurringInterval;
		/**
		 * When provided, the lookup first tries to find an exact payment-method
		 * match, then falls back to the "card" variant. Defaults to "card".
		 */
		paymentMethod?: PaymentMethod;
	},
) {
	const plan = getPaidPlan(planId);

	if (!plan) {
		return null;
	}

	const method = selection.paymentMethod ?? "card";

	const matchesTypeAndInterval = (price: PlanPrice) => {
		if (price.type !== selection.type) return false;
		if (price.type === "subscription") return price.interval === selection.interval;
		return true;
	};

	// Prefer exact payment-method match
	const exactMatch = plan.prices.find(
		(price) => matchesTypeAndInterval(price) && (price.paymentMethod ?? "card") === method,
	);

	if (exactMatch) return exactMatch;

	// Fall back to card price
	return (
		plan.prices.find(
			(price) => matchesTypeAndInterval(price) && (price.paymentMethod ?? "card") === "card",
		) ?? null
	);
}
