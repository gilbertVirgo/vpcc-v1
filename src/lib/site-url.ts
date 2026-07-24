/**
 * The site's canonical origin.
 *
 * Order matters. NEXT_PUBLIC_SITE_URL wins so production is always explicit.
 * Netlify's DEPLOY_PRIME_URL is the branch/preview URL, which is what preview
 * builds should advertise — using the production domain there would emit
 * canonicals pointing at pages that may not exist yet.
 */
export function getSiteUrl(): string {
	const candidate =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.DEPLOY_PRIME_URL ||
		process.env.URL ||
		"https://vpcc.church";

	// Trailing slashes produce "https://vpcc.church//about" when joined.
	return candidate.replace(/\/+$/, "");
}

/** True only for the real production domain. */
export function isProductionSite(): boolean {
	return getSiteUrl() === "https://vpcc.church";
}
