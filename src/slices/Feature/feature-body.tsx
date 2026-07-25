"use client";

import type { Content } from "@prismicio/client";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { PrismicButtonGroup } from "@/components/prismic/link";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Dialog } from "@/components/ui/dialog";
import { Container, Section } from "@/components/ui/layout";
import { Slideshow, type SlideshowImage } from "@/components/ui/slideshow";
import { cn } from "@/lib/cn";

export interface FeatureBodyProps {
	slice: Content.FeatureSlice;
	/** Prepared on the server, blur placeholders included. */
	images: SlideshowImage[];
	/** Set on the page's lead image only. See slices/context.ts. */
	priority?: boolean;
}

/**
 * The interactive half of the Feature slice.
 *
 * A client component because of the slideshow and the optional
 * enlarge-on-click. The images arrive ready-made from the server component
 * that wraps this one — building them here would mean no blur placeholders,
 * since those are fetched.
 */
export function FeatureBody({
	slice,
	images,
	priority = false,
}: FeatureBodyProps) {
	const [enlarged, setEnlarged] = useState(false);

	const hasImages = images.length > 0;
	const imageRight = slice.primary.image_position === "right";
	const enlargeable = Boolean(slice.primary.image_enlargeable) && hasImages;

	const media = hasImages ? (
		<Slideshow
			images={images}
			ratio="landscape"
			sizes="(min-width: 750px) 50vw, 100vw"
			priority={priority}
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
								<PrismicButtonGroup
									buttons={slice.primary.buttons}
								/>
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
