#!/usr/bin/env node
/**
 * Creates the "Hope in East London" photo competition event in Prismic.
 *
 * A one-shot seed, in the same spirit as scripts/migrate-content: the details
 * were agreed over a conversation rather than typed into the Page Builder, and
 * five labelled rows plus two paragraphs are more error-prone to retype than to
 * write down once. Everything here is editable in Prismic afterwards — this
 * only saves the first pass.
 *
 * Prerequisites:
 *   - PRISMIC_WRITE_TOKEN in the environment or in .env.local at the repo root
 *     (created with `prismic token create --write`)
 *
 * Usage:
 *   node scripts/create-event.mjs
 *   node scripts/create-event.mjs --run
 *   node scripts/create-event.mjs --run --poster ./poster.png --share ./share.png
 *
 * The Migration API only creates documents; it never updates or deletes. Run
 * this twice and you get two events, so the dry run is the default.
 *
 * The document is created as a **draft**. Nothing appears on the site — What's
 * On carries no event block and the event's own URL 404s — until someone
 * publishes it.
 */

import { createMigration, createWriteClient } from "@prismicio/client";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const LANG = "en-gb";
const DRY_RUN = !process.argv.includes("--run");

/* -------------------------------------------------------------------------- */
/* Setup                                                                       */
/* -------------------------------------------------------------------------- */

function loadEnv() {
	try {
		const raw = readFileSync(
			new URL("../.env.local", import.meta.url),
			"utf8",
		);
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
	readFileSync(new URL("../prismic.config.json", import.meta.url), "utf8"),
).repositoryName;

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
	console.error(
		"PRISMIC_WRITE_TOKEN is not set. Add it to .env.local at the repo\n" +
			"root, or export it before running. In a git worktree the file\n" +
			"lives in the main checkout and is not shared — source it first:\n" +
			"  set -a; source ../../.env.local; set +a",
	);
	process.exit(1);
}

/** A path passed as `--poster ./file.png`, or undefined. */
function flagPath(flag) {
	const index = process.argv.indexOf(flag);
	if (index === -1) return undefined;
	return process.argv[index + 1];
}

const migration = createMigration();

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const p = (text, spans = []) => ({ type: "paragraph", text, spans });

/**
 * A paragraph with hyperlinks named by the substrings they cover.
 *
 * Offsets are computed from the text rather than written by hand, so editing
 * the copy cannot silently shift a link onto the wrong words. Same helper as
 * scripts/migrate-content/content.mjs, reproduced rather than imported so this
 * script stays deletable on its own.
 */
function linked(text, links) {
	let cursor = 0;

	const spans = links.map(([label, url]) => {
		const start = text.indexOf(label, cursor);
		if (start === -1) {
			throw new Error(`Link text "${label}" not found in: ${text}`);
		}
		cursor = start + label.length;
		return {
			start,
			end: cursor,
			type: "hyperlink",
			data: { link_type: "Web", url },
		};
	});

	return { type: "paragraph", text, spans };
}

/**
 * Times are given as a UTC offset because that is what Prismic stores. Check
 * the published page reads 6pm–7:30pm; if it reads an hour later, the Page
 * Builder and the API disagree about the zone and these want winding back.
 * See docs/events.md.
 */
const STARTS_AT = "2026-09-12T17:00:00+0000";
const ENDS_AT = "2026-09-12T18:30:00+0000";

/* Entries close at the end of the 26th, prizes are handed out on the 12th.
   The button goes at the first, the whole page at the second. */
const ENTRIES_CLOSE = "2026-08-26T22:59:00+0000";
const HIDE_AFTER = "2026-09-12T20:00:00+0000";

const IMAGES = {
	poster: {
		flag: "--poster",
		field: "image",
		alt: "Two hands holding up a phone, photographing trees and a lake in a park",
	},
	share: {
		flag: "--share",
		field: "share_image",
		alt: "Photo Competition: Hope in East London, 26 August to 12 September 2026",
	},
};

const assets = {};

for (const [key, config] of Object.entries(IMAGES)) {
	const path = flagPath(config.flag);
	if (!path) continue;

	try {
		const file = readFileSync(resolve(path));
		assets[config.field] = migration.createAsset(file, basename(path), {
			alt: config.alt,
		});
	} catch {
		console.warn(`  ! could not read ${key} at ${path}, skipping`);
	}
}

migration.createDocument(
	{
		type: "event",
		uid: "hope-in-east-london",
		lang: LANG,
		data: {
			title: "Photo Competition: Hope in East London",
			summary:
				"Show us what hope looks like through your lens. £1 a photo, three age categories, cash prizes, and an exhibition in September.",
			starts_at: STARTS_AT,
			ends_at: ENDS_AT,
			location:
				"Canal Club Community Centre, Waterloo Gardens, London E2 9HP",
			details: [
				{
					label: "Photos due",
					value: [p("11:59pm, Wednesday 26 August")],
				},
				{
					label: "Entry",
					value: [
						p(
							"£1 per photo, cash or card when you hand your photos in",
						),
					],
				},
				{
					label: "Categories",
					value: [
						/* "Adults (18 and over)", not "Adult (18+)". On a
						   photo competition the singular reads as a content
						   rating rather than an age group, and "18+" sitting
						   next to it doubles the effect. */
						p(
							"Primary (5–11), Secondary (12–17), Adults (18 and over)",
						),
					],
				},
				{ label: "Prize", value: [p("Cash prizes to be won")] },
				{ label: "Theme", value: [p("Hope in East London")] },
			],
			body: [
				p(
					"Every entry fee goes straight into the prize pot. The exhibition and prize ceremony is open to everyone, whether you entered or not.",
				),
				linked("Questions? Email hello@vpcc.church.", [
					["hello@vpcc.church", "mailto:hello@vpcc.church"],
				]),
			],
			image: assets.image,
			share_image: assets.share_image,
			expires_at: HIDE_AFTER,
			cta_label: "Enter the competition",
			cta_link: {
				link_type: "Web",
				url: "https://forms.gle/iUSAbJdZdZ59qWVL6",
				target: "_blank",
			},
			cta_expires_at: ENTRIES_CLOSE,
		},
	},
	"Photo Competition: Hope in East London",
);

/* -------------------------------------------------------------------------- */
/* Write                                                                       */
/* -------------------------------------------------------------------------- */

const supplied = Object.keys(assets);
console.log(
	`\nRepository: ${repositoryName}\n` +
		`  1 event: hope-in-east-london\n` +
		`  images: ${supplied.length > 0 ? supplied.join(", ") : "none — add the poster and share image in Prismic"}\n`,
);

if (DRY_RUN) {
	console.log("Dry run — nothing written. Re-run with --run to create it.\n");
	process.exit(0);
}

const client = createWriteClient(repositoryName, { writeToken });

await client.migrate(migration, {
	reporter: (event) => {
		if (event.type.endsWith(":end") || event.type === "start") return;
		console.log(`  ${event.type}`);
	},
});

console.log(
	"\nCreated as a draft. Nothing is on the site — What's On carries no\n" +
		"event block and /whats-on/:uid 404s — until it is published in Prismic.\n",
);
