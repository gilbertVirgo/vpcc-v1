"use client";

import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { PrismicButtonGroup } from "@/components/prismic/link";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Dialog } from "@/components/ui/dialog";
import { Container, Section } from "@/components/ui/layout";
import { Slideshow } from "@/components/ui/slideshow";
import { cn } from "@/lib/cn";

export type FeatureProps = SliceComponentProps<Content.FeatureSlice>;

/**
 * Image (or slideshow) beside text. The workhorse of the previous site.
 *
 * A client component because of the slideshow and the optional
 * enlarge-on-click; the text within it is still rendered on the server.
 */
export default function Feature({ slice }: FeatureProps) {
	const [enlarged, setEnlarged] = useState(false);

	const images = slice.primary.images
		.filter((item) => Boolean(item.image?.url))
		.map((item) => ({
			src: item.image.url as string,
			alt: item.image.alt ?? "",
		}));

	const hasImages = images.length > 0;
	const imageRight = slice.primary.image_position === "right";
	const enlargeable = Boolean(slice.primary.image_enlargeable) && hasImages;

	const media = hasImages ? (
		<Slideshow
			images={images}
			ratio="landscape"
			sizes="(min-width: 750px) 50vw, 100vw"
		/>
	) : null;

	return (
		<Section spacing="md">
			<Container>
				<Reveal>
					<div
						className={cn(
							"grid items-center gap-8 sm:gap-12",
							hasImages && "sm:grid-cols-2",
						)}
					>
						{hasImages ? (
							<div className={cn(imageRight && "sm:order-2")}>
								{enlargeable ? (
									/* A real button rather than a div with a
									   click handler, so it is reachable and
									   operable from the keyboard. */
									<button
										type="button"
										onClick={() => setEnlarged(true)}
										aria-label="Enlarge image"
										className="block w-full cursor-zoom-in"
									>
										{media}
									</button>
								) : (
									media
								)}
							</div>
						) : null}

						<div className={cn(imageRight && "sm:order-1")}>
							<PrismicHeading
								field={slice.primary.title}
								as="h2"
								size="h2"
							/>
							<PrismicProse
								field={slice.primary.body}
								className="mt-5"
							/>
							<div className="mt-8">
								<PrismicButtonGroup buttons={slice.primary.buttons} />
							</div>
						</div>
					</div>
				</Reveal>
			</Container>

			{enlargeable ? (
				<Dialog
					open={enlarged}
					onClose={() => setEnlarged(false)}
					title="Image"
					hideTitle
					className="w-[min(64rem,calc(100vw-2rem))]"
				>
					<Slideshow images={images} ratio="landscape" sizes="90vw" />
				</Dialog>
			) : null}
		</Section>
	);
}
