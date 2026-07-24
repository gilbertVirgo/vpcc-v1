"use client";

import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { useState } from "react";

import { linkHref } from "@/components/prismic/link";
import { PrismicHeading } from "@/components/prismic/rich-text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";

export type MapEmbedProps = SliceComponentProps<Content.MapEmbedSlice>;

/**
 * A Google Maps embed, behind a click-to-load placeholder.
 *
 * Loading the iframe eagerly would pull in a large third-party bundle and set
 * Google cookies on every visitor, including those who never look at the map.
 * Waiting for an explicit click keeps both off the page until they are wanted.
 */
export default function MapEmbed({ slice }: MapEmbedProps) {
	const [loaded, setLoaded] = useState(false);

	const embedUrl = slice.primary.embed_url?.trim();
	const directions = linkHref(slice.primary.directions_link);

	return (
		<Section spacing="sm">
			<Container size="text">
				<PrismicHeading field={slice.primary.title} as="h2" size="h3" />

				{slice.primary.address ? (
					<Text tone="secondary" className="mt-3">
						{slice.primary.address}
					</Text>
				) : null}

				{embedUrl ? (
					<div className="mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface-sunken">
						{loaded ? (
							<iframe
								src={embedUrl}
								title={
									slice.primary.address
										? `Map showing ${slice.primary.address}`
										: "Map"
								}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								className="h-full w-full border-0"
							/>
						) : (
							<button
								type="button"
								onClick={() => setLoaded(true)}
								className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-muted transition-colors duration-fast ease-standard hover:text-ink"
							>
								<Icon name="pin" className="size-8" />
								<span className="text-body-sm">
									Load the map
								</span>
								<span className="text-caption">
									Loads Google Maps and sets its cookies
								</span>
							</button>
						)}
					</div>
				) : null}

				{directions ? (
					<div className="mt-6">
						<Button href={directions} variant="secondary">
							Get directions
						</Button>
					</div>
				) : null}
			</Container>
		</Section>
	);
}
