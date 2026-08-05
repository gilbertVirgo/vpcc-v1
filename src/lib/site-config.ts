import type { IconName } from "@/components/ui/icon";

/*
 * Site chrome content.
 *
 * Hard-coded for now. Phase 3 moves all of this into the Prismic `settings`
 * singleton; the shape here is deliberately close to what that document will
 * return, so the swap is a data-source change rather than a rewrite.
 */

export interface NavLink {
	label: string;
	href: string;
}

export interface FooterLink {
	label: string;
	href: string;
	icon?: IconName;
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

const navigation: NavLink[] = [
	{ label: "Home", href: "/" },
	{ label: "What’s On", href: "/whats-on" },
	{ label: "About", href: "/about" },
	{ label: "Beliefs", href: "/beliefs" },
	{ label: "Connect", href: "/connect" },
];

/** Sits apart from the nav links, as a button. */
const navCta: NavLink = { label: "Donate", href: "/donate" };

/*
 * Annotated rather than inferred: `as const` on the exported object would
 * narrow each link to its own literal type, and a link without an `icon` would
 * then have no `icon` property at all for the footer to read.
 */
const footer: FooterSection[] = [
	{
		title: "Connect",
		links: [
			{
				label: "@vpcc.church",
				href: "https://www.instagram.com/vpcc.church",
				icon: "instagram",
			},
			{
				label: "Facebook",
				href: "https://www.facebook.com/p/Victoria-Park-Community-Church-100091737656153",
				icon: "facebook",
			},
			{
				label: "hello@vpcc.church",
				href: "mailto:hello@vpcc.church",
				icon: "mail",
			},
		],
	},
	{
		title: "Legal",
		links: [
			{
				label: "Safeguarding Policy",
				href: "https://docs.google.com/document/d/101PolqYPxomDMh2NvkQrFp6m_RAvZvBWnlQN7ha0WgE/edit?usp=sharing",
			},
			{
				label: "Complaint Policy",
				href: "/assets/pdf/complaint-policy.pdf",
			},
			{
				label: "Conflict of Interest Policy",
				href: "/assets/pdf/conflict-of-interest-policy.pdf",
			},
			{
				label: "Data Protection & Privacy Policy",
				href: "/assets/pdf/data-protection-privacy-policy.pdf",
			},
			{
				label: "Financial Management Policy",
				href: "/assets/pdf/financial-management-policy.pdf",
			},
			{
				label: "Serious Incident Reporting Policy",
				href: "/assets/pdf/serious-incident-reporting-policy.pdf",
			},
		],
	},
	{
		title: "Quick Links",
		links: [
			{ label: "Calendar", href: "https://calendar.vpcc.church" },
			{ label: "Donate", href: "/donate" },
		],
	},
	{
		title: "Associated Organisations",
		links: [
			{ label: "FIEC", href: "https://fiec.org.uk" },
			{
				label: "Christian Heritage London",
				href: "https://christianheritagelondon.org",
			},
		],
	},
];

export const siteConfig = {
	name: "Victoria Park Community Church",
	shortName: "VPCC",
	description:
		"A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.",
	email: "hello@vpcc.church",

	navigation,
	navCta,
	footer,

	meeting: {
		when: "Sundays, 3:00–4:30pm",
		venue: "Victoria Park Baptist Church",
		address: "186 Grove Road, London E3 5TG",
		directions: "https://maps.app.goo.gl/CQFsTYqZfuUAEvuP7",
	},
} as const;
