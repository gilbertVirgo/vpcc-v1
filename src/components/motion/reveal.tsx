"use client";

import {
	Children,
	type CSSProperties,
	type ElementType,
	type ReactNode,
	isValidElement,
} from "react";

import { cn } from "@/lib/cn";

import { useInView } from "./use-in-view";

export interface RevealProps {
	as?: ElementType;
	/** Position in a stagger sequence. Multiplies --reveal-stagger. */
	index?: number;
	once?: boolean;
	className?: string;
	children?: ReactNode;
}

/**
 * Fades and lifts its children into view.
 *
 * Everything visual lives in CSS (see src/styles/utilities.css) — this only
 * flips `data-reveal-state`. Distance, duration, easing and the reduced-motion
 * behaviour all come from the motion tokens, so the effect can be retuned
 * site-wide from one file.
 */
export function Reveal({
	as: Tag = "div",
	index = 0,
	once = true,
	className,
	children,
}: RevealProps) {
	const { ref, inView } = useInView<HTMLDivElement>({ once });

	return (
		<Tag
			ref={ref}
			data-reveal=""
			data-reveal-state={inView ? "visible" : "hidden"}
			style={{ "--reveal-index": index } as CSSProperties}
			className={className}
		>
			{children}
		</Tag>
	);
}

export interface StaggerProps {
	as?: ElementType;
	/** Index of the first child, for continuing a sequence across containers. */
	start?: number;
	once?: boolean;
	className?: string;
	/**
	 * Applied to each generated wrapper. Inside a grid or flex container the
	 * wrapper — not the child — is the layout item, so equal-height cards need
	 * `h-full` here.
	 */
	itemClassName?: string;
	children?: ReactNode;
}

/**
 * Reveals its children in sequence.
 *
 * One observer per child rather than one for the group: a long list that
 * spans more than a screen otherwise starts its whole cascade the moment the
 * top edge appears, and the last items finish animating far below the fold.
 */
export function Stagger({
	as: Tag = "div",
	start = 0,
	once = true,
	className,
	itemClassName,
	children,
}: StaggerProps) {
	const items = Children.toArray(children).filter(isValidElement);

	return (
		<Tag className={cn(className)}>
			{items.map((child, i) => (
				<Reveal
					key={child.key ?? i}
					index={start + i}
					once={once}
					className={itemClassName}
				>
					{child}
				</Reveal>
			))}
		</Tag>
	);
}
