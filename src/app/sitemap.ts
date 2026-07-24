import type { MetadataRoute } from "next";

import { createClient } from "@/prismicio";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

/**
 * Sitemap, built from published Prismic pages.
 *
 * Each document's `url` comes from the route resolver, so the sitemap can
 * never disagree with what the site actually serves.
 *
 * An empty or unreachable repository yields a sitemap containing just the home
 * page rather than a failed build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = getSiteUrl();
	const client = createClient();

	const pages = await client.getAllByType("page").catch(() => []);

	if (pages.length === 0) {
		return [{ url: base, lastModified: new Date(), priority: 1 }];
	}

	return pages.map((page) => {
		const isHome = page.uid === "home";

		return {
			url: page.url ? `${base}${page.url === "/" ? "" : page.url}` : base,
			lastModified: new Date(page.last_publication_date),
			changeFrequency: isHome ? ("weekly" as const) : ("monthly" as const),
			priority: isHome ? 1 : 0.8,
		};
	});
}
