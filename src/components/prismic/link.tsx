import { asLink, type LinkField } from "@prismicio/client";

import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Resolves a Prismic link field to an href.
 *
 * The client is configured with route resolution, so document links come back
 * with a URL already attached. Returns undefined for an empty field, which is
 * what callers use to decide whether to render anything at all.
 */
export function linkHref(field: LinkField | null | undefined): string | undefined {
	if (!field) return undefined;
	return asLink(field) ?? undefined;
}

export interface PrismicButtonGroupProps {
	buttons: readonly {
		label: string | null;
		link: LinkField;
	}[];
	/** The first button is the primary action; the rest are secondary. */
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
}

/**
 * Renders a group of Prismic-authored buttons.
 *
 * A row with no label or no link is skipped rather than rendered as a dead
 * control — editors routinely leave a half-filled row behind.
 */
export function PrismicButtonGroup({
	buttons,
	variant,
	size = "md",
}: PrismicButtonGroupProps) {
	const usable = buttons
		.map((button) => ({ label: button.label, href: linkHref(button.link) }))
		.filter(
			(button): button is { label: string; href: string } =>
				Boolean(button.label?.trim()) && Boolean(button.href),
		);

	if (usable.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-3">
			{usable.map((button, index) => (
				<Button
					key={`${button.href}-${index}`}
					href={button.href}
					size={size}
					variant={variant ?? (index === 0 ? "primary" : "secondary")}
				>
					{button.label}
				</Button>
			))}
		</div>
	);
}
