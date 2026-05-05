"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

import { getTypewriterData } from "../lib/typewriter-features";

const TYPE_SPEED = 80;
const DELETE_SPEED = 40;
const PAUSE_AFTER_TYPE = 5000;
const PAUSE_AFTER_DELETE = 300;

export function TypewriterTitle() {
	const locale = useLocale();
	const { prefix, features } = getTypewriterData(locale);

	const [displayed, setDisplayed] = useState("");
	const [featureIndex, setFeatureIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);
	const [subtitleVisible, setSubtitleVisible] = useState(true);

	const target = features[featureIndex]?.title ?? "";
	const subtitle = features[featureIndex]?.subtitle ?? "";

	useEffect(() => {
		if (!isDeleting && displayed === target) {
			const pause = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE);
			return () => clearTimeout(pause);
		}

		if (isDeleting && displayed === "") {
			setSubtitleVisible(false);
			const pause = setTimeout(() => {
				setIsDeleting(false);
				setFeatureIndex((i) => (i + 1) % features.length);
				setSubtitleVisible(true);
			}, PAUSE_AFTER_DELETE);
			return () => clearTimeout(pause);
		}

		const delay = isDeleting ? DELETE_SPEED : TYPE_SPEED;
		const timer = setTimeout(() => {
			setDisplayed(
				isDeleting ? target.slice(0, displayed.length - 1) : target.slice(0, displayed.length + 1),
			);
		}, delay);
		return () => clearTimeout(timer);
	}, [displayed, featureIndex, isDeleting, target, features.length]);

	return (
		<>
			<span className="block">{prefix}</span>
			<span className="block text-primary">
				{displayed}
				<span className="inline-block w-[2px] h-[0.85em] ml-0.5 align-middle bg-primary animate-pulse" />
			</span>
			<p
				className={`mt-2 text-sm sm:text-lg max-w-3xl mx-auto text-balance text-foreground/60 transition-opacity duration-300 ${subtitleVisible ? "opacity-100" : "opacity-0"}`}
			>
				{subtitle}
			</p>
		</>
	);
}

