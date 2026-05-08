"use client";

import { cn } from "@repo/ui";
import { useTranslations } from "next-intl";

export function LoginModeSwitch({
	activeMode,
	onChange,
	className,
}: {
	activeMode: "password" | "magic-link";
	onChange: (mode: string) => void;
	className?: string;
}) {
	const t = useTranslations();
	return (
		<div
			className={cn(
				"text-sm inline-flex w-full items-center justify-center border-b-2 text-card-foreground/80",
				className,
			)}
			role="tablist"
		>
			{(["password", "magic-link"] as const).map((mode) => (
				<button
					key={mode}
					type="button"
					role="tab"
					aria-selected={activeMode === mode}
					onClick={() => onChange(mode)}
					className={cn(
						"-mb-0.5 flex-1 px-3 py-2 font-medium text-sm inline-flex items-center justify-center border-b-2 border-transparent whitespace-nowrap text-foreground/60 ring-offset-background transition-all hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
						activeMode === mode && "border-primary text-card-foreground",
					)}
				>
					{mode === "password"
						? t("auth.login.modes.password")
						: t("auth.login.modes.magicLink")}
				</button>
			))}
		</div>
	);
}
