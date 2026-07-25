import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import NextLink from "next/link";
import type { FC } from "react";

import { Reveal } from "@/components/motion/reveal";
import { linkHref } from "@/components/prismic/link";
import { PrismicMedia } from "@/components/prismic/media";
import { PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { isLeadImageSlice } from "@/slices/context";

export type ImagePosterProps = SliceComponentProps<Content.ImagePosterSlice>;

/** A poster image — event flyers and the like. */
const ImagePoster: FC<ImagePosterProps> = ({ slice, slices, index }) => {
	const href = linkHref(slice.primary.link);

	const image = (
		<PrismicMedia
			field={slice.primary.image}
			ratio="portrait"
			sizes="(min-width: 750px) 44rem, 100vw"
			priority={isLeadImageSlice(slices, index)}
		/>
	);

	return (
		<Section spacing="sm">
			<Container size="text">
				<Reveal>
					{href ? (
						<NextLink
							href={href}
							className="block transition-opacity duration-base ease-standard hover:opacity-90"
						>
							{image}
						</NextLink>
					) : (
						image
					)}
					<PrismicProse
						field={slice.primary.caption}
						className="mt-4 text-caption"
					/>
				</Reveal>
			</Container>
		</Section>
	);
};

export default ImagePoster;
