import type { MetadataRoute } from "next";

import { getLiveEvents } from "@/lib/events";
import { createClient } from "@/prismicio";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

/**
 * Sitemap, built from published Prismic pages and whatever events are on.
 *
 * Each document's `url` comes from the route resolver, so the sitemap can
 * never disagree with what the site actually serves.
 *
 * Events are listed only while they are live, off the same query that decides
 * whether `/events` exists at all — a sitemap advertising a URL that 404s is
 * worse than one that lists nothing.
 *
 * An empty or unreachable repository yields a sitemap containing just the home
 * page rather than a failed build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = getSiteUrl();
	const client = createClient();

	const [pages, events] = await Promise.all([
		client.getAllByType("page").catch(() => []),
		getLiveEvents(Date.now()),
	]);

	if (pages.length === 0 && events.length === 0) {
		return [{ url: base, lastModified: new Date(), priority: 1 }];
	}

	const pageEntries = pages.map((page) => {
		const isHome = page.uid === "home";

		return {
			url: page.url ? `${base}${page.url === "/" ? "" : page.url}` : base,
			lastModified: new Date(page.last_publication_date),
			changeFrequency: isHome
				? ("weekly" as const)
				: ("monthly" as const),
			priority: isHome ? 1 : 0.8,
		};
	});

	if (events.length === 0) return pageEntries;

	/* An event is news with a closing date on it, so it is crawled more often
	   than a standing page and ranked above one. */
	const eventEntries = [
		{
			url: `${base}/events`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.9,
		},
		...events.map((event) => ({
			url: `${base}${event.url ?? `/events/${event.uid}`}`,
			lastModified: new Date(event.last_publication_date),
			changeFrequency: "daily" as const,
			priority: 0.9,
		})),
	];

	return [...pageEntries, ...eventEntries];
}
