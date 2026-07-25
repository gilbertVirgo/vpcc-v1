import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import type { SlideshowImage } from "@/components/ui/slideshow";
import { getBlurDataURL } from "@/lib/image-placeholder";
import { isLeadImageSlice } from "@/slices/context";

import { FeatureBody } from "./feature-body";

export type FeatureProps = SliceComponentProps<Content.FeatureSlice>;

/**
 * Image (or slideshow) beside text. The workhorse of the previous site.
 *
 * This half runs on the server purely to prepare the images: the blur-up
 * placeholders are fetched, which a client component cannot do. Everything
 * interactive lives in FeatureBody.
 */
export default async function Feature({ slice, slices, index }: FeatureProps) {
	const images: SlideshowImage[] = await Promise.all(
		slice.primary.images
			.filter((item) => Boolean(item.image?.url))
			.map(async (item) => ({
				src: item.image.url as string,
				alt: item.image.alt ?? "",
				blurDataURL: await getBlurDataURL(item.image.url),
			})),
	);

	return (
		<FeatureBody
			slice={slice}
			images={images}
			priority={isLeadImageSlice(slices, index)}
		/>
	);
}
