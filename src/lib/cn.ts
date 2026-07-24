import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge only knows Tailwind's stock scales. This design system
 * replaces the colour palette, the type scale and the weight scale wholesale,
 * so the merger has to be taught them — otherwise `cn("text-h1", "text-h2")`
 * keeps both and the last one in the stylesheet wins by accident rather than
 * by intent.
 *
 * Keep these lists in sync with src/styles/tokens.*.css.
 */

const TEXT_SIZES = [
	"display",
	"h1",
	"h2",
	"h3",
	"h4",
	"body-lg",
	"body",
	"body-sm",
	"caption",
	"overline",
];

const COLORS = [
	"transparent",
	"current",
	// semantic
	"surface",
	"surface-raised",
	"surface-sunken",
	"surface-inverse",
	"ink",
	"ink-secondary",
	"ink-muted",
	"ink-inverse",
	"ink-accent",
	"line",
	"line-strong",
	"line-inverse",
	"accent",
	"accent-hover",
	"accent-pressed",
	"accent-contrast",
	"accent-subtle",
	"focus-ring",
	"success",
	"success-surface",
	"danger",
	"danger-surface",
	// ramps
	...["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
		(step) => `neutral-${step}`,
	),
	...["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map(
		(step) => `primary-${step}`,
	),
];

const twMerge = extendTailwindMerge({
	override: {
		classGroups: {
			"font-size": [{ text: TEXT_SIZES }],
			"font-weight": [{ font: ["regular", "medium", "bold"] }],
			"text-color": [{ text: COLORS }],
			"bg-color": [{ bg: COLORS }],
			"border-color": [{ border: COLORS }],
			rounded: [{ rounded: ["none", "sm", "md", "lg", "pill", "full"] }],
			shadow: [{ shadow: ["none", "overlay", "popover"] }],
		},
	},
	extend: {
		classGroups: {
			"max-w": [{ "max-w": ["narrow", "text", "default", "wide"] }],
			"font-family": [{ font: ["sans", "serif"] }],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
