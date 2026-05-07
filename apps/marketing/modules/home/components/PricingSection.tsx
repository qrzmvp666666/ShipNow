"use client";

import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { config as paymentsConfig } from "@repo/payments/config";
import type { PaidPlan } from "@repo/payments/types";
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

type PaymentMethod = "card" | "wechat_person" | "alipay_person";

function WechatPayIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M9.5 4C5.36 4 2 6.91 2 10.5c0 2.02 1.07 3.82 2.75 5.03L4 18l2.5-1.25c.97.27 2 .42 3 .42.23 0 .46-.01.69-.03C10.07 16.64 10 16.08 10 15.5c0-3.31 3.13-6 7-6 .23 0 .46.01.69.03C17.07 7.23 13.6 4 9.5 4zm-2 4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM17 11c-3.31 0-6 2.24-6 5s2.69 5 6 5c.76 0 1.5-.13 2.18-.36L22 22l-.73-2.55C22.36 18.45 23 17.28 23 16c0-2.76-2.69-5-6-5zm-1.5 3.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm3 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
		</svg>
	);
}

function AlipayIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M21.422 15.358c-3.83-1.153-6.055-1.84-6.743-2.063a10.947 10.947 0 0 0 1.321-5.295C16 4.477 13.523 2 11 2H8C5.477 2 3 4.477 3 7v10c0 2.523 2.477 5 5 5h8c2.523 0 5-2.477 5-5v-.927c0-.308-.213-.578-.578-.715zM11 4c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm7 13c0 1.657-1.343 3-3 3H8c-1.657 0-3-1.343-3-3v-4.354c1.674.913 3.696 1.805 5.96 2.463.24.069.487.104.734.104C13.247 19.213 15 17.46 15 15.307c0-.4-.073-.782-.205-1.139C16.238 14.552 17.7 15.013 18 15.1V17z" />
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

			// Point directly to /choose-plan on the saas app with planId+interval.
			// The saas app redirects to /login if not authenticated, preserving the query params.
			const planUrl = saasUrl
				? `${saasUrl}/choose-plan?planId=${planId}&interval=${interval}`
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
	}, [t, saasUrl, interval]);

	const hasSubscriptions = plans.some((p) =>
		p.prices?.some((price) => price.type === "subscription"),
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

					<div className="mb-6 gap-2 flex flex-wrap items-center justify-center">
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
					<div
						className={cn(
							"gap-4 grid grid-cols-1",
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
										(p) => p.type === "one-time" || p.interval === interval,
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
