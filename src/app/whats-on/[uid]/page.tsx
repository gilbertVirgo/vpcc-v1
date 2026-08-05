import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetail } from "@/components/events/event-detail";
import { EventJsonLd } from "@/components/seo/json-ld";
import { Container, Section } from "@/components/ui/layout";
import { Link } from "@/components/ui/link";
import { getLiveEvent, getLiveEvents } from "@/lib/events";
import { getSettings } from "@/lib/settings";

/** See the note in app/[uid]/page.tsx — this covers time-based expiry. */
export const revalidate = 3600;

/* One timestamp for the whole render, read in the page's data layer rather than
   inline. See slices/context.ts. */
function stampNow(): number {
	return Date.now();
}

/**
 * One event, at its own URL, under What's On.
 *
 * This is the link that gets shared and the link a printed QR code points at,
 * so it carries the event's own share card and its `Event` structured data.
 * What's On is where people are pointed; this is the page they forward.
 */
export async function generateStaticParams() {
	const events = await getLiveEvents(stampNow());
	return events.map((event) => ({ uid: event.uid }));
}

type RouteParams = { uid: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<RouteParams>;
}): Promise<Metadata> {
	const { uid } = await params;
	const event = await getLiveEvent(uid, stampNow());

	if (!event) return {};

	const title = event.data.title ?? undefined;
	const description = event.data.summary ?? undefined;

	/*
	 * `share_image` first, and it is not interchangeable with `image`: the
	 * poster is portrait and every social card is landscape, so sharing the
	 * poster crops the middle out of it and loses the date. The fallback is
	 * still better than no card at all.
	 */
	const image = event.data.share_image?.url ?? event.data.image?.url;

	return {
		title,
		description,
		alternates: { canonical: `/whats-on/${uid}` },
		openGraph: {
			type: "article",
			title,
			description,
			url: `/whats-on/${uid}`,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function EventPage({
	params,
}: {
	params: Promise<RouteParams>;
}) {
	const { uid } = await params;

	/*
	 * A finished event 404s rather than rendering. The alternative is a live URL
	 * advertising a closing date that has already gone, which is worse than a
	 * dead one — someone would still turn up.
	 */
	const now = stampNow();
	const event = await getLiveEvent(uid, now);
	if (!event) notFound();

	const settings = await getSettings();

	return (
		<main id="main">
			<EventJsonLd event={event} settings={settings} />
			<EventDetail event={event} now={now} priority />

			<Section spacing="sm">
				<Container>
					<Link href="/whats-on">What&rsquo;s on</Link>
				</Container>
			</Section>
		</main>
	);
}
