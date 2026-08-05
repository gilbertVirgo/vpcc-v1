import { type Content, isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Stagger } from "@/components/motion/reveal";
import { PrismicMedia } from "@/components/prismic/media";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { Card } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { formatEventDate } from "@/lib/dates";
import { isEventLive } from "@/lib/events";
import type { SliceContext } from "@/slices/context";

export type EventListProps = SliceComponentProps<
	Content.EventListSlice,
	SliceContext
>;

/**
 * Dated events, with finished ones dropped.
 *
 * What counts as finished is `isEventLive` in src/lib/events.ts, shared with
 * the `/events` route and the nav link, so the three cannot drift apart.
 *
 * The filter runs on the server, so it is only as fresh as the cached page.
 * The Prismic webhook busts the cache when content changes, but nothing busts
 * it when a date simply passes — which is why pages carrying this slice also
 * set a time-based revalidate (see src/app/[uid]/page.tsx).
 */
const EventList: FC<EventListProps> = ({ slice, context }) => {
	/* Stamped by the page, not read here — see src/slices/context.ts. */
	const now = context.now;

	const events = slice.primary.events
		.map((item) => item.event)
		.filter(isFilled.contentRelationship)
		.filter((event) => event.data && isEventLive(event.data, now));

	if (events.length === 0) return null;

	return (
		<Section spacing="md">
			<Container>
				<PrismicHeading field={slice.primary.title} as="h2" size="h2" />

				<Stagger
					className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2"
					itemClassName="h-full"
				>
					{events.map((event, index) => {
						const data = event.data;
						if (!data) return null;
						const when = formatEventDate(
							data.starts_at,
							data.ends_at,
						);

						return (
							<Card
								key={event.id || index}
								padding="none"
								className="flex h-full flex-col overflow-hidden"
							>
								{data.image?.url ? (
									<PrismicMedia
										field={data.image}
										ratio="wide"
										sizes="(min-width: 750px) 50vw, 100vw"
										rounded={false}
									/>
								) : null}

								<div className="flex flex-1 flex-col p-6 sm:p-8">
									{when ? (
										<Text size="overline" tone="accent">
											{when}
										</Text>
									) : null}

									<Heading as="h3" size="h4" className="mt-3">
										{data.title}
									</Heading>

									{data.location ? (
										<Text
											size="sm"
											tone="muted"
											className="mt-2"
										>
											{data.location}
										</Text>
									) : null}

									<PrismicProse
										field={data.body}
										className="mt-4"
									/>
								</div>
							</Card>
						);
					})}
				</Stagger>
			</Container>
		</Section>
	);
};

export default EventList;
