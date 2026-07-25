import { PrismicNextImage } from "@prismicio/next";
import type { ImageField } from "@prismicio/client";

import { cn } from "@/lib/cn";
import { getBlurDataURL } from "@/lib/image-placeholder";

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
 *
 * Async because the blur-up placeholder is fetched from Prismic's imgix
 * renderer at render time and inlined; it is cached, so this costs one request
 * per asset per build rather than one per page view.
 */
export async function PrismicMedia({
	field,
	ratio = "landscape",
	sizes = "100vw",
	priority = false,
	rounded = true,
	className,
}: PrismicMediaProps) {
	if (!field?.url) return null;

	const blurDataURL = await getBlurDataURL(field.url);

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
				{...(blurDataURL
					? { placeholder: "blur" as const, blurDataURL }
					: {})}
				className="object-cover"
			/>
		</div>
	);
}
