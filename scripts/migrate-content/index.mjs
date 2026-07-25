#!/usr/bin/env node
/**
 * Migrates the previous site's content into Prismic.
 *
 * Prerequisites:
 *   - PRISMIC_WRITE_TOKEN in .env.local (created with `prismic token create --write`)
 *   - The old site checked out, for its images (see SOURCE_DIR)
 *
 * Usage:
 *   node scripts/migrate-content            # dry run: reports what it would create
 *   node scripts/migrate-content --run      # actually write to Prismic
 *
 * The migration is additive. Prismic's Migration API creates documents; it does
 * not update or delete existing ones, so running this twice produces duplicates.
 * The dry run exists to make that easy to check before committing to it.
 */

import { createMigration, createWriteClient } from "@prismicio/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
	BELIEFS,
	CALENDAR_URL,
	DIRECTIONS_URL,
	FOOTER_LINKS,
	IMAGES,
	NAV,
	TEAM,
	external,
	heading,
	linked,
	p,
	web,
} from "./content.mjs";

const SOURCE_DIR = "/Users/gilbertvirgo/vpcc-cra/public";
const LANG = "en-gb";

const DRY_RUN = !process.argv.includes("--run");

/* -------------------------------------------------------------------------- */
/* Setup                                                                       */
/* -------------------------------------------------------------------------- */

function loadEnv() {
	try {
		const raw = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
		for (const line of raw.split("\n")) {
			const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
			if (match) process.env[match[1]] ??= match[2];
		}
	} catch {
		// No .env.local — fall through to whatever is already in the environment.
	}
}

loadEnv();

const repositoryName = JSON.parse(
	readFileSync(new URL("../../prismic.config.json", import.meta.url), "utf8"),
).repositoryName;

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
	console.error("PRISMIC_WRITE_TOKEN is not set. Add it to .env.local.");
	process.exit(1);
}

const migration = createMigration();

/* -------------------------------------------------------------------------- */
/* Assets                                                                      */
/* -------------------------------------------------------------------------- */

const assets = {};

for (const [key, config] of Object.entries(IMAGES)) {
	const path = join(SOURCE_DIR, config.file);
	const filename = config.file.split("/").pop();

	let file;
	try {
		file = readFileSync(path);
	} catch {
		console.warn(`  ! missing image, skipping: ${config.file}`);
		continue;
	}

	assets[key] = migration.createAsset(file, filename, { alt: config.alt });
}

console.log(`Prepared ${Object.keys(assets).length} image(s).`);

/* -------------------------------------------------------------------------- */
/* Team members                                                                */
/* -------------------------------------------------------------------------- */

const team = {};

for (const member of TEAM) {
	team[member.uid] = migration.createDocument(
		{
			type: "team_member",
			uid: member.uid,
			lang: LANG,
			data: {
				name: member.name,
				role: member.role,
				bio: member.bio,
				photo: undefined,
				sort_order: member.sort_order,
			},
		},
		member.name,
	);
}

/* -------------------------------------------------------------------------- */
/* Slice helpers                                                               */
/* -------------------------------------------------------------------------- */

const slice = (type, primary) => ({
	slice_type: type,
	variation: "default",
	primary,
	items: [],
});

const pageHeader = (title, intro = []) =>
	slice("page_header", { title: [heading(title, 1)], intro });

const feature = ({ title, body, images = [], buttons = [], position = "left" }) =>
	slice("feature", {
		title: [heading(title, 2)],
		body,
		images: images.map((image) => ({ image })),
		buttons,
		image_position: position,
		image_enlargeable: false,
	});

const button = (label, link) => ({ label, link });

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Pages are declared before the links that point at them so the nav and the
 * in-page buttons can reference the document objects directly. Prismic resolves
 * those into real document links at migration time, which keeps internal links
 * working on preview deployments — a hard-coded https://vpcc.church/... would
 * not.
 */
const pages = {};

function page(uid, title, description, slices) {
	pages[uid] = migration.createDocument(
		{
			type: "page",
			uid,
			lang: LANG,
			data: {
				slices,
				meta_title: title,
				meta_description: description,
				meta_image: assets.ogImage,
			},
		},
		title,
	);
	return pages[uid];
}

const HOME = "home";
const WHATS_ON = "whats-on";
const ABOUT = "about";
const BELIEFS_PAGE = "beliefs";
const CONNECT = "connect";
const DONATE = "donate";

/*
 * Creation order matters: a page can only link to a document that already
 * exists as a migration object. The dependency graph happens to be acyclic —
 * home links to four other pages, what's-on links to connect, and connect,
 * donate and beliefs link to nothing — so building leaves first avoids any
 * need to patch links up afterwards.
 */

/* -------------------------------------------------------------------------- */

page(
	CONNECT,
	"Connect",
	"Get in touch with Victoria Park Community Church. We’d love to hear from you.",
	[
		pageHeader("We’d love to hear from you", [
			p(
				"Fill in your details below, and someone from Victoria Park Community Church will get back to you shortly.",
			),
		]),
		slice("contact_form", { title: [], intro: [], form: "contact" }),
	],
);

page(
	DONATE,
	"Donate",
	"Support the work of Victoria Park Community Church.",
	[
		pageHeader("Thank you for supporting us", [
			p(
				"Thank you for your interest in supporting Victoria Park Community Church.",
			),
			p(
				"Please share your contact details below, and we’ll be in touch soon to discuss the best way for you to make your donation.",
			),
		]),
		slice("contact_form", { title: [], intro: [], form: "donate" }),
	],
);

page(
	BELIEFS_PAGE,
	"Beliefs",
	"What Victoria Park Community Church believes, and the doctrinal bases we submit to.",
	[
		pageHeader("Beliefs"),
		slice("beliefs_list", {
			title: [heading("What we believe", 2)],
			intro: [
				linked(
					"We submit to the UCCF doctrinal basis as well as the FIEC’s doctrinal basis and ethos statements on gospel unity, women in ministry and same sex marriage.",
					[
						[
							"UCCF doctrinal basis",
							"https://www.uccf.org.uk/media/pages/impact/more/asked-to-be-a-leader/1964487579-1724852466/uccf_doctrinalbasis.pdf",
						],
						["doctrinal basis", "https://fiec.org.uk/who-we-are/beliefs"],
						[
							"ethos statements",
							"https://fiec.org.uk/who-we-are/beliefs#ethos",
						],
					],
				),
			],
			statements: BELIEFS.map((statement) => ({
				statement: [p(statement)],
			})),
		}),
	],
);

page(
	ABOUT,
	"About",
	"Victoria Park Community Church began in 2011. Meet the team and read our story.",
	[
		pageHeader("Our story (in brief)", [
			p(
				"Victoria Park Community Church began in 2011, when friends and family gathered in Pastor Ben’s living room with a shared vision: to enjoy and share the hope of the gospel in Tower Hamlets — a diverse area where few know Christ.",
			),
			p(
				"Now we meet at Victoria Park Baptist Church, welcoming people from near and far, united by the gospel, building deep relationships, and reaching out with love to our wider community. We are blessed to be a blessing.",
			),
		]),
		slice("team_grid", {
			title: [heading("Our team", 2)],
			intro: [],
			members: TEAM.map((member) => ({ member: team[member.uid] })),
		}),
	],
);

page(
	WHATS_ON,
	"What’s On",
	"Prayer meetings, cell groups, Sunday gatherings and more at Victoria Park Community Church.",
	[
		pageHeader("What’s On", [
			p(
				"We’re a community, not a once-a-week event. We prioritise time midweek to meet, eat together, pray and hang out.",
			),
		]),
		feature({
			title: "Calendar",
			body: [
				p("See all our upcoming events and activities on our calendar page."),
			],
			images: [assets.calendar].filter(Boolean),
			buttons: [button("View calendar", external(CALENDAR_URL))],
		}),
		feature({
			title: "Prayer meetings",
			body: [
				p(
					"London pastor C. H. Spurgeon once said “Prayer moves the arm that moves the world.”",
				),
				p(
					"We meet together on Monday mornings and Friday evenings to pray for one another and for the people of London.",
				),
			],
			images: [assets.prayer].filter(Boolean),
			position: "right",
		}),
		feature({
			title: "Sundays",
			body: [
				p(
					"We meet from 3:00pm–4:30pm at Victoria Park Baptist Church, 186 Grove Road, London E3 5TG.",
				),
			],
			images: [assets.sundays1, assets.sundaysBaby, assets.sundays4].filter(
				Boolean,
			),
			buttons: [button("Get directions", external(DIRECTIONS_URL))],
		}),
		feature({
			title: "Cell groups",
			body: [
				p(
					"At our cell group meetings, we meet in smaller groups to eat, digest Sunday’s message, worship and pray.",
				),
				p("Interested? Why not drop us a line?"),
			],
			images: [assets.cellGroup].filter(Boolean),
			buttons: [button("Get in touch", pages[CONNECT])],
		}),
		feature({
			title: "Life skills course",
			body: [
				p(
					"Living in London can be challenging. At our Life Skills meetings, our trained coaches offer local people help with essential skills with budgeting, cooking and more.",
				),
			],
			images: [assets.lifeSkills].filter(Boolean),
			position: "right",
			buttons: [button("Get in touch", pages[CONNECT])],
		}),
	],
);

page(
	HOME,
	"Victoria Park Community Church",
	"A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.",
	[
		pageHeader("Victoria Park Community Church", [
			p(
				"A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.",
			),
		]),
		feature({
			title: "Sundays",
			body: [
				p("We are Victoria Park Community Church."),
				p(
					"We meet from 3:00pm–4:30pm at Victoria Park Baptist Church, 186 Grove Road, London E3 5TG.",
				),
			],
			images: [assets.sundays1, assets.sundaysBaby, assets.sundays4].filter(
				Boolean,
			),
			buttons: [button("Get directions", external(DIRECTIONS_URL))],
		}),
		feature({
			title: "What’s on?",
			body: [
				p(
					"We’re a community, not a once-a-week event. We prioritise time midweek to meet, eat together, pray and hang out.",
				),
			],
			images: [assets.calendar].filter(Boolean),
			position: "right",
			buttons: [button("Find out what’s on", pages[WHATS_ON])],
		}),
		feature({
			title: "About us",
			body: [
				p(
					"Victoria Park Community Church is led by Ben Virgo, who is supported by a growing team.",
				),
			],
			images: [assets.about].filter(Boolean),
			buttons: [button("Find out more", pages[ABOUT])],
		}),
		feature({
			title: "What we believe",
			body: [
				p(
					"We submit to the UCCF Statement of Faith, and are affiliated with the Fellowship of Independent Evangelical Churches (FIEC).",
				),
			],
			images: [assets.prayer].filter(Boolean),
			position: "right",
			buttons: [button("Find out more", pages[BELIEFS_PAGE])],
		}),
		feature({
			title: "Connect with us",
			body: [
				linked(
					"Contact us via email at ben@vpcc.church or using Facebook or Instagram.",
					[
						[
							"Facebook",
							"https://www.facebook.com/people/Victoria-Park-Community-Church/100091737656153/",
						],
						["Instagram", "https://instagram.com/vpcc.church"],
					],
				),
			],
			images: [assets.connect].filter(Boolean),
			buttons: [button("Send us an email", pages[CONNECT])],
		}),
	],
);

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

migration.createDocument(
	{
		type: "settings",
		lang: LANG,
		data: {
			site_name: "Victoria Park Community Church",
			contact_email: "ben@vpcc.church",
			nav: NAV.map((item) => ({
				label: item.label,
				link: pages[item.uid],
			})),
			nav_cta_label: "Donate",
			nav_cta_link: pages[DONATE],
			footer_links: FOOTER_LINKS.map((link) => ({
				section: link.section,
				label: link.label,
				link: link.url.startsWith("/donate")
					? pages[DONATE]
					: link.url.startsWith("http")
						? external(link.url)
						: web(link.url),
				icon: link.icon,
			})),
			meeting_when: "Sundays, 3:00–4:30pm",
			meeting_venue: "Victoria Park Baptist Church",
			meeting_address: "186 Grove Road, London E3 5TG",
			meeting_directions: external(DIRECTIONS_URL),
			meta_title: "Victoria Park Community Church",
			meta_description:
				"A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.",
			og_image: assets.ogImage,
		},
	},
	"Site settings",
);

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

console.log(
	`\nPrepared for ${repositoryName}:\n` +
		`  ${Object.keys(assets).length} assets\n` +
		`  ${TEAM.length} team members\n` +
		`  ${Object.keys(pages).length} pages: ${Object.keys(pages).join(", ")}\n` +
		`  1 settings document\n`,
);

if (DRY_RUN) {
	console.log("Dry run — nothing written. Re-run with --run to migrate.\n");
	process.exit(0);
}

const client = createWriteClient(repositoryName, { writeToken });

await client.migrate(migration, {
	reporter: (event) => {
		if (event.type.endsWith(":end") || event.type === "start") return;
		console.log(`  ${event.type}`);
	},
});

console.log("\nMigration complete. Documents are created as drafts —");
console.log("review and publish them in Prismic.\n");
