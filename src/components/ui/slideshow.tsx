"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";
import { Media } from "./media";

export interface SlideshowImage {
	src: string;
	alt: string;
	width?: number;
	height?: number;
}

export interface SlideshowProps {
	images: SlideshowImage[];
	/** Milliseconds between slides. Autoplay is off when undefined. */
	interval?: number;
	ratio?: "square" | "portrait" | "landscape" | "wide";
	sizes?: string;
	className?: string;
	priority?: boolean;
	/** Bypass the image optimiser. For SVG and other already-optimal assets. */
	unoptimized?: boolean;
}

const SWIPE_THRESHOLD = 44;

/**
 * Accessible image carousel.
 *
 * The previous site's version cut between images every 1.5 seconds with no
 * controls and no way to stop it — unusable for anyone reading at their own
 * pace. This one crossfades, pauses on hover and focus, exposes real controls,
 * announces position, and does not autoplay at all under reduced motion.
 */
export function Slideshow({
	images,
	interval = 5000,
	ratio = "landscape",
	sizes = "100vw",
	className,
	priority = false,
	unoptimized = false,
}: SlideshowProps) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [autoplayAllowed, setAutoplayAllowed] = useState(false);
	const pointerStart = useRef<number | null>(null);

	const count = images.length;
	const multiple = count > 1;

	const go = useCallback(
		(next: number) => setIndex(((next % count) + count) % count),
		[count],
	);
	const next = useCallback(() => go(index + 1), [go, index]);
	const previous = useCallback(() => go(index - 1), [go, index]);

	/*
	 * The motion tokens can collapse a CSS transition but cannot stop a
	 * setInterval, so autoplay needs its own reduced-motion check. This is the
	 * one component allowed to call matchMedia directly.
	 */
	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setAutoplayAllowed(!query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		if (!multiple || !autoplayAllowed || paused || !interval) return;
		const timer = window.setTimeout(next, interval);
		return () => window.clearTimeout(timer);
	}, [multiple, autoplayAllowed, paused, interval, next, index]);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			next();
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			previous();
		}
	};

	if (count === 0) return null;

	const first = images[0];
	if (!multiple && first) {
		return (
			<Media
				src={first.src}
				alt={first.alt}
				ratio={ratio}
				sizes={sizes}
				priority={priority}
				unoptimized={unoptimized}
				className={className}
			/>
		);
	}

	return (
		<div
			role="group"
			aria-roledescription="carousel"
			aria-label="Photographs"
			onKeyDown={handleKeyDown}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
			onPointerDown={(event) => {
				pointerStart.current = event.clientX;
			}}
			onPointerUp={(event) => {
				const start = pointerStart.current;
				pointerStart.current = null;
				if (start === null) return;
				const delta = event.clientX - start;
				if (Math.abs(delta) < SWIPE_THRESHOLD) return;
				if (delta < 0) next();
				else previous();
			}}
			className={cn("group relative", className)}
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-lg bg-surface-sunken",
					ratio === "square" && "aspect-square",
					ratio === "portrait" && "aspect-[3/4]",
					ratio === "landscape" && "aspect-[4/3]",
					ratio === "wide" && "aspect-[16/9]",
				)}
			>
				{images.map((image, i) => (
					<div
						key={image.src}
						/* Inert rather than removed: keeping every slide mounted
						   is what makes the crossfade possible, but a hidden
						   slide must not be reachable by tab or screen reader. */
						aria-hidden={i !== index}
						inert={i !== index}
						className={cn(
							"absolute inset-0 transition-opacity ease-standard",
							"duration-slow",
							i === index ? "opacity-100" : "opacity-0",
						)}
					>
						<Media
							src={image.src}
							alt={image.alt}
							ratio={ratio}
							sizes={sizes}
							priority={priority && i === 0}
							unoptimized={unoptimized}
							rounded={false}
							className="h-full"
						/>
					</div>
				))}
			</div>

			{/* Controls fade in on hover, but are always present for keyboard
			    users the moment they receive focus. */}
			<div
				className={cn(
					"pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2",
					"justify-between opacity-0 transition-opacity duration-base ease-standard",
					"group-hover:opacity-100 group-focus-within:opacity-100",
				)}
			>
				<CarouselButton label="Previous image" onClick={previous}>
					<Icon name="chevron-left" className="size-5" />
				</CarouselButton>
				<CarouselButton label="Next image" onClick={next}>
					<Icon name="chevron-right" className="size-5" />
				</CarouselButton>
			</div>

			<div className="mt-4 flex items-center justify-center gap-2">
				{images.map((image, i) => (
					<button
						key={image.src}
						type="button"
						onClick={() => go(i)}
						aria-label={`Show image ${i + 1} of ${count}`}
						aria-current={i === index}
						className={cn(
							"h-1.5 rounded-pill transition-all duration-base ease-standard",
							i === index
								? "w-6 bg-accent"
								: "w-1.5 bg-line-strong hover:bg-ink-muted",
						)}
					/>
				))}
			</div>

			<p aria-live="polite" className="sr-only">
				{`Image ${index + 1} of ${count}`}
			</p>
		</div>
	);
}

function CarouselButton({
	label,
	onClick,
	children,
}: {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className={cn(
				"pointer-events-auto grid size-9 place-items-center rounded-pill",
				"bg-surface-raised/90 text-ink shadow-overlay backdrop-blur-sm",
				"transition-colors duration-fast ease-standard hover:bg-surface-raised",
			)}
		>
			{children}
		</button>
	);
}
