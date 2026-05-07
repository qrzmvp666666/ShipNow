"use client";

import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { config as paymentsConfig } from "@repo/payments/config";
import type { PaidPlan, PaymentMethod } from "@repo/payments/types";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
	ArrowRightIcon,
	BadgePercentIcon,
	CheckIcon,
	CreditCardIcon,
	StarIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

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
			<rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="#1677FF" />
			<path
				fill="#FFFFFF"
				d="M15.47 7.25h-2.1l-.63 1.73H8.3v1.88h3.76l-.47 1.28H8.02v1.88h2.89l-1.27 3.48h2.12l1.27-3.48h3.9v-1.88H13.7l.46-1.28h3.18V8.98h-2.5l.63-1.73Z"
			/>
		</svg>
	);
}

export function PricingSection() {
	const t = useTranslations();
	const format = useFormatter();
	const [interval, setBillingInterval] = useState<"month" | "year">("month");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

	const saasUrl = useMemo(
		() => config.saasUrl && `${String(config.saasUrl).replace(/\/$/, "")}`,
		[],
	);
	const isChinesePayment = paymentMethod === "wechat_person" || paymentMethod === "alipay_person";

	const plans = useMemo(() => {
		const result: Array<{
			id: string;
			title: string;
			description: string;
			features: string[];
			cta: string;
			recommended?: boolean;
			isEnterprise?: boolean;
			prices?: PaidPlan["prices"];
			to: string;
		}> = [];

		if (!paymentsConfig.requireActiveSubscription) {
			result.push({
				id: "free",
				title: t("pricing.products.free.title") ?? "",
				description: t("pricing.products.free.description") ?? "",
				features: Object.values(
					(t.raw("pricing.products.free.features") as Record<string, string>) ?? {},
				),
				cta: t("pricing.getStarted") ?? "",
				to: saasUrl ? `${saasUrl}/signup` : "#",
			});
		}

		for (const [planId, plan] of Object.entries(paymentsConfig.plans)) {
			const isEnterprise = "isEnterprise" in plan;
			if (isEnterprise) continue;
			const prices = "prices" in plan ? (plan as PaidPlan).prices : undefined;
			const hasSelectedPaymentMethod = prices?.some(
				(price) => (price.paymentMethod ?? "card") === paymentMethod,
			);

			if (isChinesePayment && !hasSelectedPaymentMethod) {
				continue;
			}

			// Point directly to /choose-plan on the saas app with planId+interval.
			// The saas app redirects to /login if not authenticated, preserving the query params.
			const planUrl = saasUrl
				? `${saasUrl}/choose-plan?planId=${planId}&interval=${interval}&paymentMethod=${paymentMethod}`
				: "#";

			result.push({
				id: planId,
				title: t(`pricing.products.${planId}.title`) ?? "",
				description: t(`pricing.products.${planId}.description`) ?? "",
				features: Object.values(
					(t.raw(`pricing.products.${planId}.features`) as Record<string, string>) ?? {},
				),
				cta: isEnterprise
					? (t("pricing.contactSales") ?? "")
					: (t("pricing.getStarted") ?? ""),
				recommended: plan.recommended,
				isEnterprise,
				prices,
				to: isEnterprise ? (saasUrl ? `${saasUrl}/signup` : "#") : planUrl,
			});
		}

		return result;
	}, [t, saasUrl, interval, paymentMethod, isChinesePayment]);

	const hasSubscriptions =
		!isChinesePayment &&
		Object.values(paymentsConfig.plans).some((plan) =>
			"prices" in plan
				? (plan as PaidPlan).prices.some((price) => price.type === "subscription")
				: false,
		);

	return (
		<section id="pricing" className="scroll-mt-16 py-12 lg:py-16 border-y">
			<div className="container">
				<div className="mb-6 max-w-3xl mx-auto text-center">
					<h1 className="font-medium text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight text-foreground">
						{t("pricing.title")}
					</h1>
					<p className="mt-2 text-sm sm:text-lg text-foreground/60">
						{t("pricing.description")}
					</p>
				</div>

				<div className="@container">
					<div className="mb-4 gap-2 flex flex-wrap items-center justify-center">
						<span className="text-sm text-foreground/50">
							{t("pricing.paymentMethod")}:
						</span>
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
								onValueChange={(value) =>
									setBillingInterval(value as "month" | "year")
								}
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
							plans.length <= 2 ? "max-w-4xl" : "max-w-7xl",
							plans.length >= 2 && "@xl:grid-cols-2",
							plans.length >= 3 && "@3xl:grid-cols-3",
							plans.length >= 4 && "@4xl:grid-cols-4",
						)}
					>
						{plans.map((plan) => {
							const isFree = !plan.prices && !plan.isEnterprise;
							const price = isFree
								? undefined
								: plan.prices?.find(
										(p) =>
											(p.type === "one-time" || p.interval === interval) &&
											(p.paymentMethod ?? "card") === paymentMethod,
									);
							const trialPeriodDays =
								price && "trialPeriodDays" in price && price.trialPeriodDays
									? price.trialPeriodDays
									: undefined;

							return (
								<div
									key={plan.id}
									className={cn(
										"p-6 relative rounded-3xl border bg-card",
										plan.recommended ? "border-primary" : "border-primary/20",
									)}
									data-test="price-table-plan"
								>
									{plan.recommended && (
										<div className="-top-3 px-2 py-1 font-semibold text-xs absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-primary text-center text-primary-foreground">
											<StarIcon className="mr-1.5 size-3 inline-block" />
											{t("pricing.recommended")}
										</div>
									)}
									<div className="gap-4 flex h-full flex-col justify-between">
										<div>
											<h3 className="my-0 font-semibold text-2xl">
												{plan.title}
											</h3>
											{plan.description && (
												<div className="prose mt-2 text-sm text-foreground/60">
													{plan.description}
												</div>
											)}

											{!!plan.features?.length && (
												<ul className="mt-4 gap-2 text-sm grid list-none">
													{plan.features.map((feature, key) => (
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

											{trialPeriodDays !== undefined &&
												trialPeriodDays > 0 && (
													<div className="mt-4 font-medium text-sm flex items-center justify-start text-primary opacity-80">
														<BadgePercentIcon className="mr-2 size-4" />
														{t("pricing.trialPeriod", {
															days: trialPeriodDays,
														})}
													</div>
												)}
										</div>

										<div>
											{isFree && (
												<strong
													className="font-medium text-2xl lg:text-3xl block"
													data-test="price-table-plan-price"
												>
													{format.number(0, {
														style: "currency",
														currency: "USD",
													})}
												</strong>
											)}

											{price && (
												<strong
													className="font-medium text-2xl lg:text-3xl block"
													data-test="price-table-plan-price"
												>
													{format.number(price.amount, {
														style: "currency",
														currency: price.currency,
													})}
													{price.type === "subscription" && (
														<span className="font-normal text-xs opacity-60">
															/
															{price.interval === "year"
																? t("pricing.year", {
																		count: 1,
																	})
																: t("pricing.month", {
																		count: 1,
																	})}
														</span>
													)}
												</strong>
											)}

											{plan.to.startsWith("/") ? (
												<Button
													className="mt-4 w-full"
													variant={
														plan.recommended ? "primary" : "secondary"
													}
													asChild
												>
													<LocaleLink href={plan.to}>
														{plan.cta}
														<ArrowRightIcon className="ml-2 size-4" />
													</LocaleLink>
												</Button>
											) : (
												<Button
													className="mt-4 w-full"
													variant={
														plan.recommended ? "primary" : "secondary"
													}
													asChild
												>
													<a href={plan.to}>
														{plan.cta}
														<ArrowRightIcon className="ml-2 size-4" />
													</a>
												</Button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
