import { type VariantProps, cva } from "class-variance-authority";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { isExternalHref } from "@/lib/links";

const link = cva(
	[
		"transition-[color,text-decoration-color] duration-fast ease-standard",
		"underline-offset-4",
	],
	{
		variants: {
			variant: {
				/* Inline in a paragraph: underlined by default, because colour
				   alone is not an accessible affordance. */
				inline: [
					"text-ink-accent underline decoration-line-strong",
					"hover:decoration-current",
				],
				/* Standalone in a list or nav: underline appears on interaction. */
				standalone: [
					"text-ink no-underline",
					"hover:text-ink-accent hover:underline",
				],
				inverse: [
					"text-ink-inverse no-underline",
					"hover:underline hover:decoration-current",
				],
				muted: [
					"text-ink-muted no-underline",
					"hover:text-ink hover:underline",
				],
			},
		},
		defaultVariants: { variant: "inline" },
	},
);

export interface LinkProps extends VariantProps<typeof link> {
	href: string;
	target?: string;
	rel?: string;
	title?: string;
	className?: string;
	children?: ReactNode;
}

/**
 * Text link. External hrefs get `target`/`rel` applied automatically so no
 * caller has to remember `noopener`.
 */
export function Link({
	href,
	variant,
	target,
	rel,
	title,
	className,
	children,
}: LinkProps) {
	const classes = cn(link({ variant }), className);
	const external = isExternalHref(href);

	if (external) {
		return (
			<a
				href={href}
				title={title}
				target={target ?? "_blank"}
				rel={rel ?? "noopener noreferrer"}
				className={classes}
			>
				{children}
			</a>
		);
	}

	return (
		<NextLink href={href} title={title} className={classes}>
			{children}
		</NextLink>
	);
}
