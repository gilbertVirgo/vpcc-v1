import { cn } from "@/lib/cn";

/*
 * Inline SVG paths, drawn on a 24×24 grid with a 1.75 stroke to sit alongside
 * Area Inktrap without looking heavier than the type.
 *
 * Brand marks are stroked outlines like the rest of the set, not their official
 * solid forms. Mixed here, solid marks broke down at the 16px the footer uses
 * them at: filled Facebook read as a dark disc while stroked Instagram and mail
 * beside it were hairlines, so the row had three different weights and the
 * Instagram frame closed up into a smudge. One stroke weight across every icon
 * keeps them legible small and consistent with each other.
 */
const PATHS = {
	"arrow-right": "M5 12h14M13 6l6 6-6 6",
	"arrow-left": "M19 12H5M11 18l-6-6 6-6",
	"chevron-left": "M15 5l-7 7 7 7",
	"chevron-right": "M9 5l7 7-7 7",
	"chevron-down": "M5 9l7 7 7-7",
	close: "M6 6l12 12M18 6L6 18",
	menu: "M3 7h18M3 17h18",
	mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
	phone: "M8.5 3.5 10.5 8l-2 1.5a11 11 0 0 0 6 6L16 13.5l4.5 2v3.5a1.5 1.5 0 0 1-1.7 1.5A17 17 0 0 1 3.5 5.2 1.5 1.5 0 0 1 5 3.5z",
	pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
	calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
	external:
		"M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
	instagram:
		"M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM18.2 6.5a.7.7 0 1 1-1.4 0 .7.7 0 0 1 1.4 0z",
	facebook:
		"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps {
	name: IconName;
	/** Give a label only when the icon is the sole content of a control. */
	label?: string;
	className?: string;
}

export function Icon({ name, label, className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			role={label ? "img" : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			focusable="false"
			className={cn("size-6 shrink-0", className)}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={PATHS[name]} />
		</svg>
	);
}
