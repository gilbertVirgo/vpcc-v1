import { asLink, isFilled } from "@prismicio/client";

import type { IconName } from "@/components/ui/icon";
import { createClient } from "@/prismicio";

import {
	type FooterSection,
	type NavLink,
	siteConfig,
} from "./site-config";

/**
 * Site chrome, from Prismic where available.
 *
 * Falls back to src/lib/site-config.ts whenever the `settings` document is
 * missing or a field on it is empty. That is not just belt-and-braces: the
 * document starts life unpublished, and a nav that renders as nothing while an
 * editor is midway through filling it in would be worse than a slightly stale
 * one.
 */

export interface SiteSettings {
	name: string;
	email: string;
	navigation: NavLink[];
	navCta: NavLink;
	footer: FooterSection[];
	meeting: {
		when: string;
		venue: string;
		address: string;
		directions: string;
	};
	seo: {
		title: string;
		description: string;
		image?: string;
	};
}

const FALLBACK: SiteSettings = {
	name: siteConfig.name,
	email: siteConfig.email,
	navigation: [...siteConfig.navigation],
	navCta: siteConfig.navCta,
	footer: siteConfig.footer.map((section) => ({
		title: section.title,
		links: [...section.links],
	})),
	meeting: { ...siteConfig.meeting },
	seo: {
		title: siteConfig.name,
		description: siteConfig.description,
	},
};

const ICONS: IconName[] = ["instagram", "facebook", "mail"];

function toIcon(value: string | null | undefined): IconName | undefined {
	if (!value || value === "none") return undefined;
	return ICONS.includes(value as IconName) ? (value as IconName) : undefined;
}

export async function getSettings(): Promise<SiteSettings> {
	const client = createClient();
	const settings = await client.getSingle("settings").catch(() => null);

	if (!settings) return FALLBACK;

	const data = settings.data;

	const navigation: NavLink[] = data.nav
		.map((item) => ({
			label: item.label ?? "",
			href: asLink(item.link) ?? "",
		}))
		.filter((item) => item.label && item.href);

	/*
	 * Footer links are one flat group in Prismic — the model nests only one
	 * level deep — so they are regrouped here by the `section` value the editor
	 * typed. Insertion order is preserved, which is how the editor controls the
	 * order of the columns.
	 */
	const sections = new Map<string, FooterSection>();
	for (const link of data.footer_links) {
		const title = link.section?.trim();
		const label = link.label?.trim();
		const href = asLink(link.link);
		if (!title || !label || !href) continue;

		if (!sections.has(title)) sections.set(title, { title, links: [] });
		sections.get(title)?.links.push({
			label,
			href,
			icon: toIcon(link.icon),
		});
	}

	const footer = [...sections.values()];

	return {
		name: data.site_name?.trim() || FALLBACK.name,
		email: data.contact_email?.trim() || FALLBACK.email,
		navigation: navigation.length > 0 ? navigation : FALLBACK.navigation,
		navCta:
			data.nav_cta_label && isFilled.link(data.nav_cta_link)
				? {
						label: data.nav_cta_label,
						href: asLink(data.nav_cta_link) ?? FALLBACK.navCta.href,
					}
				: FALLBACK.navCta,
		footer: footer.length > 0 ? footer : FALLBACK.footer,
		meeting: {
			when: data.meeting_when?.trim() || FALLBACK.meeting.when,
			venue: data.meeting_venue?.trim() || FALLBACK.meeting.venue,
			address: data.meeting_address?.trim() || FALLBACK.meeting.address,
			directions:
				asLink(data.meeting_directions) ?? FALLBACK.meeting.directions,
		},
		seo: {
			title: data.meta_title?.trim() || FALLBACK.seo.title,
			description: data.meta_description?.trim() || FALLBACK.seo.description,
			image: data.og_image?.url ?? undefined,
		},
	};
}
