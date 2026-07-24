import type { SiteSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Structured data describing the church.
 *
 * Everything here is drawn from the settings document rather than restated, so
 * a change of address or social account updates the markup too. Nothing is
 * inferred: the address is emitted as the single text field the CMS actually
 * holds rather than being split into a PostalAddress by guesswork, and no
 * opening hours are claimed from prose like "Sundays, 3:00–4:30pm".
 */
export function ChurchJsonLd({ settings }: { settings: SiteSettings }) {
	const base = getSiteUrl();

	/*
	 * `sameAs` means "other profiles of this same organisation" — not "every
	 * outbound link". Selecting by social icon rather than by URL keeps the
	 * FIEC, Christian Heritage London and the Google Docs safeguarding policy
	 * out of it, none of which are the church.
	 *
	 * Matching on the URL was the first attempt and got it wrong twice: it
	 * swept in those third parties, and the "not our own domain" filter also
	 * excluded instagram.com/vpcc.church, which is exactly the profile wanted.
	 */
	const SOCIAL_ICONS = new Set(["instagram", "facebook"]);

	const sameAs = settings.footer
		.flatMap((section) => section.links)
		.filter((link) => link.icon && SOCIAL_ICONS.has(link.icon))
		.map((link) => link.href)
		.filter((href) => /^https?:\/\//.test(href));

	const data = {
		"@context": "https://schema.org",
		"@type": "Church",
		name: settings.name,
		url: base,
		email: settings.email,
		description: settings.seo.description,
		...(settings.seo.image ? { image: settings.seo.image } : {}),
		address: `${settings.meeting.venue}, ${settings.meeting.address}`,
		...(sameAs.length > 0 ? { sameAs: [...new Set(sameAs)] } : {}),
	};

	return (
		<script
			type="application/ld+json"
			/* JSON.stringify escapes the content; the type is not executable,
			   and every value originates from our own CMS. */
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
