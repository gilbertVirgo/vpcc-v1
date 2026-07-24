import { type VariantProps, cva } from "class-variance-authority";
import NextLink from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { isExternalHref } from "@/lib/links";

const button = cva(
	[
		"inline-flex items-center justify-center gap-2 rounded-pill",
		"font-bold whitespace-nowrap select-none",
		"transition-[background-color,color,border-color,opacity,scale]",
		"duration-fast ease-standard",
		"active:scale-[0.98]",
		"disabled:pointer-events-none disabled:opacity-50",
		"aria-disabled:pointer-events-none aria-disabled:opacity-50",
	],
	{
		variants: {
			variant: {
				/* primary-500 is a fill only — its label is dark ink at 8.61:1.
				   Hover lightens rather than darkens so label contrast improves
				   on interaction instead of degrading. */
				primary: [
					"bg-accent text-accent-contrast",
					"hover:bg-accent-hover active:bg-accent-pressed",
				],
				secondary: [
					"border border-line-strong bg-transparent text-ink",
					"hover:bg-surface-sunken hover:border-line-strong",
				],
				ghost: ["bg-transparent text-ink", "hover:bg-surface-sunken"],
				inverse: [
					"border border-line-inverse bg-transparent text-ink-inverse",
					"hover:bg-ink-inverse/10",
				],
			},
			size: {
				sm: "h-9 px-4 text-body-sm",
				md: "h-11 px-6 text-body-sm",
				lg: "h-13 px-8 text-body",
			},
			block: {
				true: "w-full",
				false: "",
			},
		},
		defaultVariants: { variant: "primary", size: "md", block: false },
	},
);

type ButtonVariants = VariantProps<typeof button>;

interface CommonProps extends ButtonVariants {
	className?: string;
	children?: ReactNode;
}

interface ButtonAsButton
	extends CommonProps,
		Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
	href?: undefined;
	loading?: boolean;
}

interface ButtonAsLink extends CommonProps {
	href: string;
	/** Forced when omitted for external links. */
	target?: string;
	rel?: string;
	"aria-label"?: string;
	download?: boolean | string;
	loading?: undefined;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * The single call-to-action primitive. Renders a <button>, a Next <Link>, or a
 * plain <a> depending on `href` — so an anchor never gets faked with a click
 * handler and a button never gets faked with an anchor.
 */
export function Button(props: ButtonProps) {
	const { variant, size, block, className, children } = props;
	const classes = cn(button({ variant, size, block }), className);

	if (props.href !== undefined) {
		const { href, target, rel, download, ...rest } = props;
		const external = isExternalHref(href);

		if (external || download !== undefined) {
			return (
				<a
					href={href}
					target={target ?? (external ? "_blank" : undefined)}
					rel={rel ?? (external ? "noopener noreferrer" : undefined)}
					download={download}
					className={classes}
					aria-label={rest["aria-label"]}
				>
					{children}
				</a>
			);
		}

		return (
			<NextLink href={href} className={classes} aria-label={rest["aria-label"]}>
				{children}
			</NextLink>
		);
	}

	/* Every design-system prop has to come off before the spread, or `block`,
	   `variant` and friends end up as DOM attributes and React warns. */
	const {
		loading,
		disabled,
		type,
		variant: _variant,
		size: _size,
		block: _block,
		className: _className,
		children: _children,
		href: _href,
		...rest
	} = props;

	return (
		<button
			type={type ?? "button"}
			disabled={disabled ?? loading}
			aria-busy={loading || undefined}
			className={classes}
			{...rest}
		>
			{loading ? <Spinner /> : null}
			{children}
		</button>
	);
}

/**
 * The one place a looping animation is allowed: a progress indicator has to
 * loop to mean anything. `motion-safe:` keeps it out of reduced-motion.
 */
function Spinner() {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"size-4 rounded-full border-2 border-current border-t-transparent",
				"motion-safe:animate-spin",
			)}
		/>
	);
}
