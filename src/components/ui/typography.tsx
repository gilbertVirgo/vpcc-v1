import { type VariantProps, cva } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Heading                                                                     */
/* -------------------------------------------------------------------------- */

const heading = cva("text-balance", {
	variants: {
		size: {
			display: "text-display",
			h1: "text-h1",
			h2: "text-h2",
			h3: "text-h3",
			h4: "text-h4",
		},
		tone: {
			primary: "text-ink",
			secondary: "text-ink-secondary",
			muted: "text-ink-muted",
			inverse: "text-ink-inverse",
			accent: "text-ink-accent",
		},
	},
	defaultVariants: { size: "h2", tone: "primary" },
});

export interface HeadingProps extends VariantProps<typeof heading> {
	/** Semantic level. Choose for document outline, not for appearance. */
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
	id?: string;
	className?: string;
	children?: ReactNode;
}

/**
 * Heading level and heading size are separate on purpose: the outline should
 * be driven by document structure, the scale by layout.
 */
export function Heading({
	as: Tag = "h2",
	size,
	tone,
	id,
	className,
	children,
}: HeadingProps) {
	return (
		<Tag id={id} className={cn(heading({ size, tone }), className)}>
			{children}
		</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Text                                                                        */
/* -------------------------------------------------------------------------- */

const text = cva("", {
	variants: {
		size: {
			lg: "text-body-lg",
			md: "text-body",
			sm: "text-body-sm",
			caption: "text-caption",
			overline: "text-overline uppercase",
		},
		tone: {
			primary: "text-ink",
			secondary: "text-ink-secondary",
			muted: "text-ink-muted",
			inverse: "text-ink-inverse",
			accent: "text-ink-accent",
		},
		weight: {
			medium: "font-medium",
			bold: "font-bold",
		},
		measure: {
			true: "measure",
			false: "",
		},
	},
	defaultVariants: {
		size: "md",
		tone: "primary",
		weight: "medium",
		measure: false,
	},
});

export interface TextProps extends VariantProps<typeof text> {
	as?: ElementType;
	id?: string;
	className?: string;
	children?: ReactNode;
}

export function Text({
	as: Tag = "p",
	size,
	tone,
	weight,
	measure,
	id,
	className,
	children,
}: TextProps) {
	return (
		<Tag
			id={id}
			className={cn(text({ size, tone, weight, measure }), className)}
		>
			{children}
		</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Accent                                                                      */
/* -------------------------------------------------------------------------- */

export interface AccentProps {
	className?: string;
	children?: ReactNode;
}

/**
 * Ivyora Text set inside an Area Inktrap line. Carries over the old site's
 * treatment of heading fragments — "Hot Cross Buns", "(in brief)".
 *
 * Use it on a fragment, never on a whole heading, and never on body copy.
 */
export function Accent({ className, children }: AccentProps) {
	return <span className={cn("font-accent", className)}>{children}</span>;
}

/* -------------------------------------------------------------------------- */
/* Prose                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper for CMS-authored rich text, where the markup is out of our hands.
 * Everything here targets bare elements, so it must stay scoped to this class.
 */
export function Prose({
	className,
	children,
}: {
	className?: string;
	children?: ReactNode;
}) {
	return (
		<div
			className={cn(
				"measure text-body text-ink-secondary",
				"[&_p]:mt-4 [&_p:first-child]:mt-0",
				"[&_h2]:text-h3 [&_h2]:text-ink [&_h2]:mt-10",
				"[&_h3]:text-h4 [&_h3]:text-ink [&_h3]:mt-8",
				"[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6",
				"[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6",
				"[&_li]:mt-1",
				"[&_strong]:font-bold [&_strong]:text-ink",
				"[&_em]:italic",
				"[&_a]:text-ink-accent [&_a]:underline [&_a]:underline-offset-4",
				"[&_a]:decoration-line-strong hover:[&_a]:decoration-current",
				"[&_a]:transition-colors [&_a]:duration-fast [&_a]:ease-standard",
				className,
			)}
		>
			{children}
		</div>
	);
}
