import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

/* The shimmer, colour and reduced-motion handling live in the `skeleton`
   utility (src/styles/utilities.css) so a sibling app can port the CSS
   without this component. */
const skeleton = cva("skeleton block", {
	variants: {
		shape: {
			/* 1em tracks the surrounding font size, so a text bar is as tall as
			   the glyphs it stands in for at any type scale. */
			text: "h-[1em] w-full rounded-sm",
			block: "rounded-md",
			circle: "aspect-square rounded-pill",
			pill: "rounded-pill",
		},
	},
	defaultVariants: { shape: "text" },
});

export interface SkeletonProps extends VariantProps<typeof skeleton> {
	/** Size it here — a skeleton has no intrinsic dimensions beyond `text`. */
	className?: string;
}

/**
 * Placeholder for content that is still loading.
 *
 * Purely visual — it always renders `aria-hidden`. The region being loaded
 * owns the accessible state: give it `aria-busy="true"` and a
 * `<VisuallyHidden>` status such as "Loading events…", then drop both when
 * the content lands.
 *
 * Mirror the final layout — same shapes, same sizes, same gaps — so nothing
 * shifts when the real content replaces it.
 *
 * @example
 * <section aria-busy="true">
 *   <VisuallyHidden>Loading events…</VisuallyHidden>
 *   <Skeleton shape="block" className="h-40" />
 *   <SkeletonText lines={2} />
 * </section>
 */
export function Skeleton({ shape, className }: SkeletonProps) {
	return (
		<span
			aria-hidden="true"
			className={cn(skeleton({ shape }), className)}
		/>
	);
}

/**
 * A paragraph's worth of text bars. The last line stops short at 60%, the way
 * a real paragraph rarely fills its final line.
 *
 * Body copy sets at 1.65 line height, so a 1em bar plus a 0.65em gap takes the
 * same vertical space as the text it replaces.
 */
export function SkeletonText({
	lines = 3,
	className,
}: {
	lines?: number;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn("flex flex-col gap-[0.65em]", className)}
		>
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton
					key={i}
					className={i === lines - 1 ? "w-3/5" : undefined}
				/>
			))}
		</span>
	);
}
