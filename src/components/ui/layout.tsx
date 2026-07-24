import { type VariantProps, cva } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Container                                                                   */
/* -------------------------------------------------------------------------- */

const container = cva("mx-auto w-full gutter", {
	variants: {
		size: {
			narrow: "max-w-narrow",
			text: "max-w-text",
			default: "max-w-default",
			wide: "max-w-wide",
			full: "max-w-none",
		},
		flush: {
			true: "px-0",
			false: "",
		},
	},
	defaultVariants: { size: "default", flush: false },
});

export interface ContainerProps
	extends VariantProps<typeof container> {
	as?: ElementType;
	className?: string;
	children?: ReactNode;
}

/**
 * The page frame. Owns the horizontal gutter — no other component should set
 * page-level left/right padding.
 */
export function Container({
	as: Tag = "div",
	size,
	flush,
	className,
	children,
}: ContainerProps) {
	return (
		<Tag className={cn(container({ size, flush }), className)}>{children}</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

const section = cva("", {
	variants: {
		spacing: {
			none: "",
			sm: "section-y-sm",
			md: "section-y",
			lg: "section-y-lg",
			/* A page's opening band — see section-t-lg in utilities.css. */
			header: "section-t-lg",
		},
		tone: {
			default: "",
			sunken: "bg-surface-sunken",
			inverse: "bg-surface-inverse text-ink-inverse",
		},
	},
	defaultVariants: { spacing: "md", tone: "default" },
});

export interface SectionProps extends VariantProps<typeof section> {
	as?: ElementType;
	id?: string;
	className?: string;
	children?: ReactNode;
}

/** A band of the page. Owns vertical rhythm and background tone. */
export function Section({
	as: Tag = "section",
	spacing,
	tone,
	id,
	className,
	children,
}: SectionProps) {
	return (
		<Tag id={id} className={cn(section({ spacing, tone }), className)}>
			{children}
		</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Stack                                                                       */
/* -------------------------------------------------------------------------- */

const stack = cva("flex", {
	variants: {
		direction: {
			column: "flex-col",
			row: "flex-row flex-wrap",
		},
		gap: {
			none: "gap-0",
			xs: "gap-2",
			sm: "gap-3",
			md: "gap-5",
			lg: "gap-8",
			xl: "gap-12",
			"2xl": "gap-16",
		},
		align: {
			start: "items-start",
			center: "items-center",
			end: "items-end",
			stretch: "items-stretch",
			baseline: "items-baseline",
		},
		justify: {
			start: "justify-start",
			center: "justify-center",
			end: "justify-end",
			between: "justify-between",
		},
	},
	defaultVariants: {
		direction: "column",
		gap: "md",
		align: "stretch",
		justify: "start",
	},
});

export interface StackProps extends VariantProps<typeof stack> {
	as?: ElementType;
	className?: string;
	children?: ReactNode;
}

export function Stack({
	as: Tag = "div",
	direction,
	gap,
	align,
	justify,
	className,
	children,
}: StackProps) {
	return (
		<Tag
			className={cn(stack({ direction, gap, align, justify }), className)}
		>
			{children}
		</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Grid                                                                        */
/* -------------------------------------------------------------------------- */

const grid = cva("grid", {
	variants: {
		cols: {
			1: "grid-cols-1",
			2: "grid-cols-1 sm:grid-cols-2",
			3: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3",
			4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-4",
			12: "grid-cols-12",
		},
		gap: {
			none: "gap-0",
			sm: "gap-4",
			md: "gap-6 sm:gap-8",
			lg: "gap-8 sm:gap-12",
		},
	},
	defaultVariants: { cols: 12, gap: "md" },
});

export interface GridProps extends VariantProps<typeof grid> {
	as?: ElementType;
	className?: string;
	children?: ReactNode;
}

export function Grid({
	as: Tag = "div",
	cols,
	gap,
	className,
	children,
}: GridProps) {
	return <Tag className={cn(grid({ cols, gap }), className)}>{children}</Tag>;
}
