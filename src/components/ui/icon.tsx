import { cn } from "@/lib/cn";

/*
 * Inline SVG paths, drawn on a 24×24 grid with a 1.75 stroke to sit alongside
 * Area Inktrap without looking heavier than the type.
 *
 * Brand marks (Instagram, Facebook) are filled rather than stroked, since
 * their official forms are solid.
 */
const PATHS = {
	"arrow-right": "M5 12h14M13 6l6 6-6 6",
	"arrow-left": "M19 12H5M11 18l-6-6 6-6",
	"chevron-left": "M15 5l-7 7 7 7",
	"chevron-right": "M9 5l7 7-7 7",
	"chevron-down": "M5 9l7 7 7-7",
	close: "M6 6l12 12M18 6L6 18",
	menu: "M3 7h18M3 17h18",
	mail: "M3 6.5h18v11H3zM3 7l9 6.5L21 7",
	phone:
		"M8.5 3.5 10.5 8l-2 1.5a11 11 0 0 0 6 6L16 13.5l4.5 2v3.5a1.5 1.5 0 0 1-1.7 1.5A17 17 0 0 1 3.5 5.2 1.5 1.5 0 0 1 5 3.5z",
	pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
	calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
	external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
} as const;

const FILLED = {
	instagram:
		"M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.62.07 4.81s0 3.56-.07 4.81c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.62.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.16 15.56 2.15 15.19 2.15 12s0-3.56.07-4.81c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17C2.4 10.11 2.39 10.47 2.39 12s.01 1.89.07 3.13c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.6.07-3.13s-.01-1.89-.07-3.13c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4C15.5 4.01 15.14 4 12 4zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88zm0 8.14a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.29-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z",
	facebook:
		"M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z",
} as const;

export type IconName = keyof typeof PATHS | keyof typeof FILLED;

export interface IconProps {
	name: IconName;
	/** Give a label only when the icon is the sole content of a control. */
	label?: string;
	className?: string;
}

export function Icon({ name, label, className }: IconProps) {
	const filled = name in FILLED;
	const d = filled
		? FILLED[name as keyof typeof FILLED]
		: PATHS[name as keyof typeof PATHS];

	return (
		<svg
			viewBox="0 0 24 24"
			role={label ? "img" : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			focusable="false"
			className={cn("size-6 shrink-0", className)}
			fill={filled ? "currentColor" : "none"}
			stroke={filled ? "none" : "currentColor"}
			strokeWidth={filled ? undefined : 1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={d} />
		</svg>
	);
}
