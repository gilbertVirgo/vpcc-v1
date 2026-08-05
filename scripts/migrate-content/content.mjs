/**
 * The site's content, in Prismic's shape.
 *
 * Copy is carried over verbatim from the previous site (~/vpcc-cra), including
 * its typographic apostrophes and en dashes. Where a line here differs from the
 * old site it is because the old markup, not the words, changed — for example
 * a heading that was an <h1> inside a feature block is now a page header.
 */

/* -------------------------------------------------------------------------- */
/* Rich text helpers                                                           */
/* -------------------------------------------------------------------------- */

/** A paragraph, optionally with inline links. */
export function p(text, spans = []) {
	return { type: "paragraph", text, spans };
}

export function heading(text, level = 1) {
	return { type: `heading${level}`, text, spans: [] };
}

/**
 * Builds a paragraph with hyperlinks by naming the substrings to link.
 *
 * Offsets are computed from the text rather than written by hand, so the copy
 * can be edited without silently shifting a link onto the wrong words.
 *
 * Each label is searched for *after* the previous one, so a repeated phrase
 * links the right occurrence. The beliefs intro depends on this: it contains
 * "UCCF doctrinal basis" and then the FIEC's "doctrinal basis", and a plain
 * indexOf would put the second link on the first phrase. Links must therefore
 * be listed in the order they appear in the text.
 */
export function linked(text, links) {
	let cursor = 0;

	const spans = links.map(([label, url]) => {
		const start = text.indexOf(label, cursor);
		if (start === -1) {
			throw new Error(
				`Link text "${label}" not found after index ${cursor} in: ${text}`,
			);
		}
		cursor = start + label.length;
		return {
			start,
			end: cursor,
			type: "hyperlink",
			data: { link_type: "Web", url, target: "_blank" },
		};
	});

	return { type: "paragraph", text, spans };
}

export const web = (url) => ({ link_type: "Web", url });
export const external = (url) => ({ link_type: "Web", url, target: "_blank" });

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Images to migrate, keyed by the name the documents refer to them by.
 *
 * Paths are relative to the previous site's public directory. The alt text is
 * written here rather than carried over: the old site left several images with
 * an empty alt or with "A VPCC Sunday Service" on photographs of something
 * else entirely.
 */
export const IMAGES = {
	sundays1: {
		file: "assets/images/sundays-1_filtered.jpeg",
		alt: "The congregation gathered for a Sunday service",
	},
	sundaysBaby: {
		file: "assets/images/baby-1--filtered.jpg",
		alt: "A parent holding a baby during a Sunday service",
	},
	sundays4: {
		file: "assets/images/sundays-4_filtered.jpeg",
		alt: "People talking together after a Sunday service",
	},
	calendar: {
		file: "assets/images/calendar.jpg",
		alt: "Church members sharing lunch around a long table",
	},
	about: {
		file: "assets/images/about_filtered.jpeg",
		alt: "The Victoria Park Community Church team",
	},
	prayer: {
		file: "assets/images/prayer-meeting_filtered.jpeg",
		alt: "A small group praying together",
	},
	connect: {
		file: "assets/images/general--2.jpg",
		alt: "Members of the church talking outdoors",
	},
	cellGroup: {
		file: "assets/images/beliefs_filtered.JPG",
		alt: "A cell group meeting in a living room",
	},
	lifeSkills: {
		file: "assets/images/hot-cross-buns_filtered.jpg",
		alt: "Homemade hot cross buns cooling on a tray",
	},
	ogImage: {
		file: "assets/images/og-image.jpg",
		alt: "Victoria Park Community Church",
	},
};

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

export const TEAM = [
	{
		uid: "ben-virgo",
		name: "Ben Virgo",
		role: "Lead Pastor",
		sort_order: 1,
		bio: [
			linked(
				"Ben is married to Rachel and they have had seven children together, four of whom live with them at their council estate home in Bethnal Green. Ben also serves as a director at Christian Heritage London.",
				[
					[
						"Christian Heritage London",
						"https://christianheritagelondon.org",
					],
				],
			),
		],
	},
	{
		uid: "gil-virgo",
		name: "Gil Virgo",
		role: "Pastor",
		sort_order: 2,
		bio: [
			linked(
				"Gil is married to Lucy. They live together with their two daughters in Bow. Gil is currently studying Theology at Union School of Theology.",
				[["Union School of Theology", "https://www.ust.ac.uk"]],
			),
		],
	},
	{
		uid: "isaiah-jagdeo",
		name: "Isaiah Jagdeo",
		role: "Safeguarding Lead",
		sort_order: 3,
		bio: [
			linked(
				"Isaiah is married to Beth. They live together in Stratford. Isaiah works as a Mission Associate for Children, Youth & Schools at London City Mission.",
				[["London City Mission", "https://www.lcm.org.uk"]],
			),
		],
	},
	{
		uid: "beth-jagdeo",
		name: "Beth Jagdeo",
		role: "Lead Kids Worker",
		sort_order: 4,
		bio: [
			p(
				"Beth is married to Isaiah. During the week, she works with a medical charity.",
			),
		],
	},
	{
		uid: "rachel-virgo",
		name: "Rachel Virgo",
		role: "Life–Skills Coach",
		sort_order: 5,
		bio: [
			linked(
				"Rachel is married to Ben. Besides her role as a mother, she serves the local community as a CAP Life Skills coach.",
				[["CAP Life Skills", "https://capuk.org"]],
			),
		],
	},
];

/* -------------------------------------------------------------------------- */
/* Beliefs                                                                     */
/* -------------------------------------------------------------------------- */

export const BELIEFS = [
	"There is one God in three persons, the Father, the Son and the Holy Spirit.",
	"God is sovereign in creation, revelation, redemption and final judgement.",
	"The Bible, as originally given, is the inspired and infallible Word of God. It is the supreme authority in all matters of belief and behaviour.",
	"Since the fall, the whole of humankind is sinful and guilty, so that everyone is subject to God’s wrath and condemnation.",
	"The Lord Jesus Christ, God’s incarnate Son, is fully God; he was born of a virgin; his humanity is real and sinless; he died on the cross, was raised bodily from death and is now reigning over heaven and earth.",
	"Sinful human beings are redeemed from the guilt, penalty and power of sin only through the sacrificial death, once and for all time, of their representative and substitute, Jesus Christ, the only mediator between them and God.",
	"Those who believe in Christ are pardoned all their sins and accepted in God’s sight only because of the righteousness of Christ credited to them; this justification is God’s act of undeserved mercy, received solely by trust in him and not by their own efforts.",
	"The Holy Spirit alone makes the work of Christ effective to individual sinners, enabling them to turn to God from their sin and to trust in Jesus Christ.",
	"The Holy Spirit lives in all those he has regenerated. He makes them increasingly Christlike in character and behaviour and gives them power for their witness in the world.",
	"The Lord Jesus Christ will return in person, to judge everyone, to execute God’s just condemnation on those who have not repented and to receive the redeemed to eternal glory.",
];

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export const FOOTER_LINKS = [
	{
		section: "Connect",
		label: "@vpcc.church",
		url: "https://www.instagram.com/vpcc.church",
		icon: "instagram",
	},
	{
		section: "Connect",
		label: "Facebook",
		url: "https://www.facebook.com/p/Victoria-Park-Community-Church-100091737656153",
		icon: "facebook",
	},
	{
		section: "Connect",
		label: "hello@vpcc.church",
		url: "mailto:hello@vpcc.church",
		icon: "mail",
	},
	{
		section: "Legal",
		label: "Safeguarding Policy",
		url: "https://docs.google.com/document/d/101PolqYPxomDMh2NvkQrFp6m_RAvZvBWnlQN7ha0WgE/edit?usp=sharing",
		icon: "none",
	},
	{
		section: "Legal",
		label: "Complaint Policy",
		url: "/assets/pdf/complaint-policy.pdf",
		icon: "none",
	},
	{
		section: "Legal",
		label: "Conflict of Interest Policy",
		url: "/assets/pdf/conflict-of-interest-policy.pdf",
		icon: "none",
	},
	{
		section: "Legal",
		label: "Data Protection & Privacy Policy",
		url: "/assets/pdf/data-protection-privacy-policy.pdf",
		icon: "none",
	},
	{
		section: "Legal",
		label: "Financial Management Policy",
		url: "/assets/pdf/financial-management-policy.pdf",
		icon: "none",
	},
	{
		section: "Legal",
		label: "Serious Incident Reporting Policy",
		url: "/assets/pdf/serious-incident-reporting-policy.pdf",
		icon: "none",
	},
	{
		section: "Quick Links",
		label: "Calendar",
		url: "https://calendar.vpcc.church",
		icon: "none",
	},
	{ section: "Quick Links", label: "Donate", url: "/donate", icon: "none" },
	{
		section: "Associated Organisations",
		label: "FIEC",
		url: "https://fiec.org.uk",
		icon: "none",
	},
	{
		section: "Associated Organisations",
		label: "Christian Heritage London",
		url: "https://christianheritagelondon.org",
		icon: "none",
	},
];

export const NAV = [
	{ label: "Home", uid: "home" },
	{ label: "What’s On", uid: "whats-on" },
	{ label: "About", uid: "about" },
	{ label: "Beliefs", uid: "beliefs" },
	{ label: "Connect", uid: "connect" },
];

export const DIRECTIONS_URL = "https://maps.app.goo.gl/CQFsTYqZfuUAEvuP7";
export const CALENDAR_URL = "https://calendar.vpcc.church";
