import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Available to screen readers, absent from the visual layout. */
export function VisuallyHidden({
	as: Tag = "span",
	children,
}: {
	as?: "span" | "div" | "h1" | "h2" | "legend";
	children?: ReactNode;
}) {
	return <Tag className="sr-only">{children}</Tag>;
}

/**
 * First tab stop on every page. Hidden until focused, then slides into the top
 * left. Requires a `<main id="main">` on the page it serves.
 */
export function SkipLink({
	href = "#main",
	className,
	children = "Skip to content",
}: {
	href?: string;
	className?: string;
	children?: ReactNode;
}) {
	return (
		<a
			href={href}
			className={cn(
				"sr-only focus:not-sr-only",
				"focus:z-toast focus:fixed focus:top-4 focus:left-4",
				"focus:rounded-pill focus:bg-accent focus:text-accent-contrast",
				"focus:px-6 focus:py-3 focus:text-body-sm focus:font-bold",
				className,
			)}
		>
			{children}
		</a>
	);
}
