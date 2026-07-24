import type { MetadataRoute } from "next";

import { getSiteUrl, isProductionSite } from "@/lib/site-url";

/**
 * Deploy previews disallow everything.
 *
 * A Netlify preview URL is publicly reachable, and an indexed preview competes
 * with the real site for the same content — the classic duplicate-content
 * problem. Only the production domain invites crawlers.
 */
export default function robots(): MetadataRoute.Robots {
	const base = getSiteUrl();

	if (!isProductionSite()) {
		return { rules: [{ userAgent: "*", disallow: "/" }] };
	}

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/design-system"],
			},
		],
		sitemap: `${base}/sitemap.xml`,
		host: base,
	};
}
