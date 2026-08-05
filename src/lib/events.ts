import type { Content } from "@prismicio/client";

import { createClient } from "@/prismicio";

/**
 * Events, and the single rule for whether one is still worth showing.
 *
 * The rule lives here rather than in a page or a slice because several surfaces
 * have to agree on it — the What's On page, each event's own page, the
 * `EventList` slice and the sitemap. A page linking to an event that has
 * already 404'd itself is the failure this module exists to make impossible.
 */

/**
 * The page live events appear on.
 *
 * What's On is the site's one activities page, so an event belongs on it rather
 * than on a second page of its own that spends most of the year empty. The UID
 * is named here rather than read from a setting because the events themselves
 * are served from `/whats-on/:uid` — the page and its children have to agree,
 * and a route path is not something an editor can change anyway.
 */
export const EVENTS_PAGE_UID = "whats-on";

/**
 * The fields the live check reads.
 *
 * Structural rather than `EventDocumentData`, because the `EventList` slice
 * sees an event through a content relationship, which carries only the fields
 * the model asked for. Both callers have these three; neither has to have the
 * rest.
 */
export interface EventTiming {
	starts_at?: string | null;
	ends_at?: string | null;
	expires_at?: string | null;
}

/**
 * Whether an event still has a reason to be on the site.
 *
 * `expires_at` is the editor's override — it ports the previous site's
 * `timeout` field, which is how the Hot Cross Buns feature removed itself once
 * the morning was over. `ends_at` is the fallback, because an editor who has
 * already said when the thing finishes should not also have to say when to stop
 * advertising it: leaving "hide after" empty used to mean "never", which on a
 * page whose whole premise is that it disappears is the wrong default.
 *
 * An event with neither stays up. So does one whose timestamp is unparseable —
 * an event that overstays is recoverable, one that silently refuses to appear
 * is the failure nobody notices. Same call as `isWithinWindow` in ./dates.
 */
export function isEventLive(event: EventTiming, now: number): boolean {
	const until = event.expires_at ?? event.ends_at;
	if (!until) return true;

	const at = new Date(until).getTime();
	if (Number.isNaN(at)) return true;

	return at > now;
}

/**
 * Every event still worth showing, soonest first.
 *
 * The filter runs on the server, so it is only as fresh as the cached page.
 * The Prismic webhook busts the cache when content changes, but nothing busts
 * it when a date simply passes — which is why every route that depends on this
 * sets a time-based `revalidate`.
 *
 * A failed query yields no events rather than an error. That degrades to What's
 * On carrying no event block, which is the same state as having nothing on —
 * and is a great deal better than taking the page down.
 */
export async function getLiveEvents(
	now: number,
): Promise<Content.EventDocument[]> {
	const client = createClient();

	const events = await client
		.getAllByType("event", {
			orderings: [{ field: "my.event.starts_at", direction: "asc" }],
		})
		.catch((error) => {
			console.warn(
				"Could not list events; treating the site as having none.",
				error instanceof Error ? error.message : error,
			);
			return [];
		});

	return events.filter((event) => isEventLive(event.data, now));
}

/**
 * One event, by UID, or null if it is missing or finished.
 *
 * Finished is null rather than the document, so a stale link to last month's
 * event 404s instead of quietly serving it.
 */
export async function getLiveEvent(
	uid: string,
	now: number,
): Promise<Content.EventDocument | null> {
	const client = createClient();
	const event = await client.getByUID("event", uid).catch(() => null);

	if (!event) return null;

	return isEventLive(event.data, now) ? event : null;
}

/**
 * The URL for an event.
 *
 * `url` comes from the route resolver, so it can never disagree with what the
 * site serves. The fallback covers a document fetched without routes — a
 * hand-built path is still better than a card that links nowhere.
 */
export function eventHref(event: {
	uid?: string | null;
	url?: string | null;
}): string {
	return event.url ?? `/${EVENTS_PAGE_UID}/${event.uid ?? ""}`;
}
