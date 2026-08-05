import type { Content } from "@prismicio/client";

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

	return <JsonLd data={data} />;
}

/**
 * Structured data describing one event.
 *
 * Only what the document actually holds is emitted. `startDate` is required for
 * a rich result, so an event without one gets no markup at all rather than a
 * half-formed `Event` that search engines would reject anyway — the page still
 * renders, it simply isn't advertised as a dated thing.
 *
 * The location is a `Place` with a name and nothing else. Splitting "Canal Club
 * Community Centre, Waterloo Gardens" into a `PostalAddress` would mean
 * guessing which part is the street and which the building, and the same
 * reasoning keeps the church's own address whole in `ChurchJsonLd`.
 */
export function EventJsonLd({
	event,
	settings,
}: {
	event: Content.EventDocument;
	settings: SiteSettings;
}) {
	const base = getSiteUrl();
	const data = event.data;

	const startDate = toIsoDate(data.starts_at);
	if (!startDate) return null;

	const endDate = toIsoDate(data.ends_at);
	const image = data.share_image?.url ?? data.image?.url;

	return (
		<JsonLd
			data={{
				"@context": "https://schema.org",
				"@type": "Event",
				name: data.title ?? "",
				startDate,
				...(endDate ? { endDate } : {}),
				eventAttendanceMode:
					"https://schema.org/OfflineEventAttendanceMode",
				...(data.summary ? { description: data.summary } : {}),
				...(image ? { image: [image] } : {}),
				...(event.url ? { url: `${base}${event.url}` } : {}),
				...(data.location
					? { location: { "@type": "Place", name: data.location } }
					: {}),
				organizer: {
					"@type": "Organization",
					name: settings.name,
					url: base,
				},
			}}
		/>
	);
}

/**
 * A Prismic timestamp as ISO 8601.
 *
 * Prismic returns "2026-09-12T18:00:00+0000" — a basic-format offset, which
 * schema.org consumers are not obliged to accept. Normalising is one call and
 * removes the question. An unparseable value yields null so the caller can drop
 * the field rather than emit "Invalid Date".
 */
function toIsoDate(value: string | null | undefined): string | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
	return (
		<script
			type="application/ld+json"
			/* JSON.stringify escapes the content; the type is not executable,
			   and every value originates from our own CMS. */
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
