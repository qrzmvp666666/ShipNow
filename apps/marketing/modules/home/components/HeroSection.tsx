"use client";

import { config } from "@config";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import heroImageDark from "../../../public/images/hero-image-dark.png";
import heroImage from "../../../public/images/hero-image.png";
import { AVATAR_PHOTO_IDS, TESTIMONIAL_KEYS } from "../lib/testimonials";
import { HeroTabs } from "./HeroTabs";
import { TypewriterTitle } from "./TypewriterTitle";

export function HeroSection() {
	const t = useTranslations();

	return (
		<div className="relative max-w-full overflow-x-hidden bg-linear-to-t from-background via-primary/5 to-background">
			<div className="py-8 md:py-16 relative z-20 container text-center">
				<div className="mb-4 flex justify-center">
					<div className="px-3 py-1 font-normal text-sm flex flex-wrap items-center justify-center rounded-full bg-muted p-px text-foreground">
						<span className="gap-2 font-semibold flex items-center rounded-full">
							{t("home.hero.new")}
						</span>
						<span className="ml-1 font-medium block">
							{t("home.hero.featureBadge")}
						</span>
					</div>
				</div>

				<h1 className="font-medium text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight max-w-3xl mx-auto text-foreground min-h-[2.5em] md:min-h-[2.4em]">
					<TypewriterTitle />
				</h1>

							<div className="mt-4 gap-2 flex items-center justify-center">
					<Button size="lg" variant="primary" asChild>
						<a href={config.saasUrl}>
							{t("home.hero.getStarted")}
							<ArrowRightIcon className="ml-2 size-4" />
						</a>
					</Button>
					{config.docsUrl && (
						<Button variant="ghost" size="lg" asChild>
							<a href={config.docsUrl}>{t("home.hero.documentation")}</a>
						</Button>
					)}
				</div>

				{/* Social proof */}
				<div className="mt-6 flex items-center justify-center gap-3">
					<div className="flex items-center">
						{TESTIMONIAL_KEYS.map((key, i) => (
							<div
								key={key}
								className={`size-9 rounded-full border-2 border-background overflow-hidden ${i > 0 ? "-ml-3" : ""}`}
							>
								<Image
									src={`https://i.pravatar.cc/72?img=${AVATAR_PHOTO_IDS[key]}`}
									alt={key}
									width={36}
									height={36}
									className="size-full object-cover"
									unoptimized
								/>
							</div>
						))}
					</div>
					<div className="text-left">
						<div className="flex items-center gap-0.5">
							{Array.from({ length: 5 }).map((_, i) => (
								<StarIcon key={i} className="size-4 fill-yellow-400 text-yellow-400" />
							))}
						</div>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{t("home.hero.socialProof")}
						</p>
					</div>
				</div>

				<div className="mt-8 lg:mt-10 max-w-6xl mx-auto">
					<HeroTabs />
				</div>

				<div className="mt-4 p-2 mx-auto rounded-4xl border border-primary/10 bg-primary/5 max-w-6xl">
					<Image
						src={heroImage}
						alt={t("home.hero.imageAlt")}
						className="block rounded-xl dark:hidden w-full"
						priority
					/>
					<Image
						src={heroImageDark}
						alt={t("home.hero.imageAlt")}
						className="hidden rounded-xl dark:block w-full"
						priority
					/>
				</div>
			</div>
		</div>
	);
}
