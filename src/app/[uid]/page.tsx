import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventSummary } from "@/components/events/event-summary";
import { EVENTS_PAGE_UID, getLiveEvents } from "@/lib/events";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { SliceContext } from "@/slices/context";

/**
 * Every page except the home page.
 *
 * Content is entirely slice-driven, so a new page in Prismic is a live URL
 * with no deploy.
 *
 * `revalidate` is a backstop, not the main mechanism: the Prismic webhook
 * busts the cache the moment content changes. It exists because events drop
 * off this page once `expires_at` passes, and nothing fires a webhook when a
 * date simply goes by — without it, a finished event would sit on What's On
 * until the next publish.
 */
export const revalidate = 3600;

/*
 * One timestamp for the whole page.
 *
 * Read here, in the page's data layer, rather than inside a slice: slices stay
 * pure functions of their props, and every slice agrees on what "now" is.
 */
function sliceContext(): SliceContext {
	return { now: Date.now() };
}

export async function generateStaticParams() {
	const client = createClient();

	/*
	 * An empty repository must not fail the build.
	 *
	 * Prismic's Content API only registers a document type once something of
	 * that type has been published. Until then, passing `routes` for that type
	 * is a hard "Link resolver error" rather than an empty result — so a fresh
	 * repository, or a deploy that lands before the first page is published,
	 * would take the whole build down. Returning no params just means nothing
	 * is prerendered; pages render on demand and get picked up on the next
	 * build.
	 */
	const pages = await client.getAllByType("page").catch((error) => {
		console.warn(
			"Could not list pages for prerendering; building with none.",
			error instanceof Error ? error.message : error,
		);
		return [];
	});

	return pages
		.filter((page) => !RESERVED_UIDS.has(page.uid))
		.map((page) => ({ uid: page.uid }));
}

/**
 * UIDs this route must not claim, because something else already serves them.
 *
 * `home` is served by app/page.tsx, and `/events` is a permanent redirect to
 * `/whats-on` in netlify.toml — a page built for either would be a URL that
 * exists twice or one that nothing can reach. Nothing stops an editor from
 * creating a page with one of these UIDs; the model has no idea these paths are
 * spoken for.
 */
const RESERVED_UIDS = new Set(["home", "events"]);

type RouteParams = { uid: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<RouteParams>;
}): Promise<Metadata> {
	const { uid } = await params;
	const client = createClient();
	const page = await client.getByUID("page", uid).catch(() => null);

	if (!page) return {};

	const image = asImageSrc(page.data.meta_image);

	return {
		title: page.data.meta_title ?? undefined,
		description: page.data.meta_description ?? undefined,
		openGraph: {
			title: page.data.meta_title ?? undefined,
			description: page.data.meta_description ?? undefined,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page({
	params,
}: {
	params: Promise<RouteParams>;
}) {
	const { uid } = await params;

	/* `/home` would otherwise render the same document as `/`, giving two URLs
	   for one page. See RESERVED_UIDS. */
	if (RESERVED_UIDS.has(uid)) notFound();

	const client = createClient();
	const page = await client.getByUID("page", uid).catch(() => null);

	if (!page) notFound();

	const context = sliceContext();
	const events = await liveEventsFor(uid, page.data.slices, context.now);

	/* Straight after the page header, which is the only slice an event should
	   ever come below: what is on this month outranks what is on every month,
	   and below five standing features is where it would go unread. */
	const lead = page.data.slices[0]?.slice_type === "page_header" ? 1 : 0;

	if (events.length === 0) {
		return (
			<main id="main">
				<SliceZone
					slices={page.data.slices}
					components={components}
					context={context}
				/>
			</main>
		);
	}

	return (
		<main id="main">
			{/*
			 * Two zones rather than one, so the events sit between them.
			 * `isLeadImageSlice` works within whatever array it is handed, and
			 * the split is above the first image-carrying slice on What's On,
			 * so the same slice still earns `priority`. The event poster does
			 * not ask for it — images arriving from linked documents never do.
			 */}
			<SliceZone
				slices={page.data.slices.slice(0, lead)}
				components={components}
				context={context}
			/>

			{events.map((event) => (
				<EventSummary key={event.id} event={event} />
			))}

			<SliceZone
				slices={page.data.slices.slice(lead)}
				components={components}
				context={context}
			/>
		</main>
	);
}

/**
 * The live events this page should carry, which is none for every page but one.
 *
 * On What's On they appear on their own: an event is published, and the block
 * is there; it finishes, and the block goes. Nobody adds it and nobody has to
 * remember to take it away — the alternative is a slice that is still
 * advertising August's competition in November.
 *
 * An `event_list` slice on the page turns this off, because that slice is an
 * editor saying where the events go. Their placement wins, and the event is not
 * shown twice.
 */
async function liveEventsFor(
	uid: string,
	slices: readonly { slice_type: string }[],
	now: number,
) {
	if (uid !== EVENTS_PAGE_UID) return [];
	if (slices.some((slice) => slice.slice_type === "event_list")) return [];

	return getLiveEvents(now);
}
