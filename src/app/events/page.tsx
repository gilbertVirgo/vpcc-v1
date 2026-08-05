import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { EventDetail } from "@/components/events/event-detail";
import { Container, Section } from "@/components/ui/layout";
import { Divider } from "@/components/ui/surface";
import { Heading } from "@/components/ui/typography";
import { getLiveEvents } from "@/lib/events";

/**
 * Everything currently on, and nothing when nothing is.
 *
 * The page exists only while an event does: with none live it 404s, and the
 * root layout drops the nav link at the same moment, off the same query. A
 * church that runs two events a year should not carry a permanent "Events"
 * page that says there aren't any.
 *
 * `revalidate` is what makes "at the same moment" true in practice. The Prismic
 * webhook busts the cache when an editor publishes, but nothing fires when a
 * date merely passes — without this, a finished event would sit here until the
 * next publish. Same trade as the EventList slice; see src/app/[uid]/page.tsx.
 */
export const revalidate = 3600;

/*
 * One timestamp for the whole render, read here in the page's data layer rather
 * than inline — the same arrangement the slice pages use. See slices/context.ts.
 */
function stampNow(): number {
	return Date.now();
}

export async function generateMetadata(): Promise<Metadata> {
	const events = await getLiveEvents(stampNow());
	const lead = events[0];

	if (!lead) return {};

	const image = lead.data.share_image?.url ?? lead.data.image?.url;

	/*
	 * The soonest event supplies the description and the share card. Whoever
	 * pastes this link is nearly always pasting it about that event, and a
	 * generic "Events at VPCC" card would tell them nothing the URL didn't.
	 */
	const description = lead.data.summary ?? undefined;

	return {
		title: "Events",
		description,
		alternates: { canonical: "/events" },
		openGraph: {
			title: "Events",
			description,
			url: "/events",
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function EventsPage() {
	/* One timestamp for the whole page, so every event on it agrees on what
	   "now" is rather than each reading a slightly different clock. */
	const now = stampNow();
	const events = await getLiveEvents(now);

	if (events.length === 0) notFound();

	return (
		<main id="main">
			<Section as="header" spacing="header">
				<Container size="text">
					<Heading as="h1" size="h1">
						Events
					</Heading>
				</Container>
			</Section>

			{events.map((event, index) => (
				<Fragment key={event.id}>
					{index > 0 ? (
						<Container>
							<Divider />
						</Container>
					) : null}
					<EventDetail
						event={event}
						now={now}
						as="h2"
						/* Only the first poster earns `priority` — it is the
						   likely LCP element, and preloading the rest would
						   starve it. Same rule as isLeadImageSlice. */
						priority={index === 0}
					/>
				</Fragment>
			))}
		</main>
	);
}
