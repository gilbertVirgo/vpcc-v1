import type { Content } from "@prismicio/client";

import { createClient } from "@/prismicio";

import type { NavLink } from "./site-config";

/**
 * Events, and the single rule for whether one is still worth showing.
 *
 * The rule lives here rather than in a page or a slice because three surfaces
 * have to agree on it — the `/events` route, the `EventList` slice, and the nav
 * link that appears only while something is on. A page that 404s while the nav
 * still links to it is the failure this module exists to make impossible.
 */

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
 * A failed query yields no events rather than an error. That degrades to the
 * events page 404ing and the nav link going away, which is the same state as
 * having nothing on — and is a great deal better than taking down the layout,
 * and with it every page on the site.
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

/** Where `/events` sits in the nav while it exists. */
export const EVENTS_NAV_LINK: NavLink = { label: "Events", href: "/events" };

/**
 * The navigation with an Events link in it.
 *
 * Injected in code rather than typed into the `settings` document, which is
 * where the rest of the nav comes from. Everything else in that document is a
 * standing choice an editor makes once; this link has to appear the day an
 * event is published and go the day it finishes, and a link the editor has to
 * remember to remove is one that will still be there in November pointing at a
 * 404.
 *
 * Second, directly after Home: an event is the timeliest thing on the site
 * while it is on, and burying it at the end of a six-item nav would waste it.
 * An editor who has added their own `/events` link keeps theirs, wherever they
 * put it — no duplicate, and their ordering wins.
 */
export function withEventsLink(links: NavLink[]): NavLink[] {
	if (links.some((link) => link.href === EVENTS_NAV_LINK.href)) return links;

	const [first, ...rest] = links;
	if (!first) return [EVENTS_NAV_LINK];

	return [first, EVENTS_NAV_LINK, ...rest];
}
