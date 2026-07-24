import { PrismicNextImage } from "@prismicio/next";
import type { ImageField } from "@prismicio/client";

import { cn } from "@/lib/cn";

const RATIOS = {
	square: "aspect-square",
	portrait: "aspect-[3/4]",
	landscape: "aspect-[4/3]",
	wide: "aspect-[16/9]",
} as const;

export interface PrismicMediaProps {
	field: ImageField | null | undefined;
	ratio?: keyof typeof RATIOS;
	sizes?: string;
	priority?: boolean;
	rounded?: boolean;
	className?: string;
}

/**
 * A Prismic image in a fixed aspect-ratio box.
 *
 * The ratio is reserved before the image loads, so a slow photo shifts nothing.
 * `PrismicNextImage` carries the alt text the editor set — an empty alt in
 * Prismic is a deliberate "decorative", so it is passed through rather than
 * substituted with a filename.
 */
export function PrismicMedia({
	field,
	ratio = "landscape",
	sizes = "100vw",
	priority = false,
	rounded = true,
	className,
}: PrismicMediaProps) {
	if (!field?.url) return null;

	return (
		<div
			className={cn(
				"relative w-full overflow-hidden bg-surface-sunken",
				RATIOS[ratio],
				rounded && "rounded-lg",
				className,
			)}
		>
			<PrismicNextImage
				field={field}
				fill
				sizes={sizes}
				priority={priority}
				className="object-cover"
			/>
		</div>
	);
}
