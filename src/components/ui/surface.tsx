import { type VariantProps, cva } from "class-variance-authority";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

const card = cva("rounded-lg", {
	variants: {
		tone: {
			/* Depth via hairline, not shadow — the house default. */
			outlined: "border border-line bg-transparent",
			raised: "bg-surface-raised border border-line",
			sunken: "bg-surface-sunken",
			plain: "",
		},
		padding: {
			none: "",
			sm: "p-5",
			md: "p-6 sm:p-8",
			lg: "p-8 sm:p-10",
		},
		interactive: {
			true: [
				"transition-[border-color,background-color,translate]",
				"duration-base ease-standard",
				"hover:border-line-strong hover:-translate-y-0.5",
			],
			false: "",
		},
	},
	defaultVariants: { tone: "outlined", padding: "md", interactive: false },
});

export interface CardProps extends VariantProps<typeof card> {
	as?: ElementType;
	className?: string;
	children?: ReactNode;
}

export function Card({
	as: Tag = "div",
	tone,
	padding,
	interactive,
	className,
	children,
}: CardProps) {
	return (
		<Tag className={cn(card({ tone, padding, interactive }), className)}>
			{children}
		</Tag>
	);
}

/* -------------------------------------------------------------------------- */
/* Divider                                                                     */
/* -------------------------------------------------------------------------- */

export function Divider({
	className,
	tone = "default",
}: {
	className?: string;
	tone?: "default" | "inverse";
}) {
	return (
		<hr
			className={cn(
				"border-0 border-t",
				tone === "inverse" ? "border-line-inverse" : "border-line",
				className,
			)}
		/>
	);
}

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

const badge = cva(
	"inline-flex items-center rounded-pill px-3 py-1 text-overline uppercase",
	{
		variants: {
			tone: {
				accent: "bg-accent-subtle text-ink-accent",
				neutral: "bg-surface-sunken text-ink-secondary",
				outline: "border border-line text-ink-secondary",
			},
		},
		defaultVariants: { tone: "accent" },
	},
);

export interface BadgeProps extends VariantProps<typeof badge> {
	className?: string;
	children?: ReactNode;
}

export function Badge({ tone, className, children }: BadgeProps) {
	return <span className={cn(badge({ tone }), className)}>{children}</span>;
}
