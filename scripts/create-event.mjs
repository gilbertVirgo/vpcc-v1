#!/usr/bin/env node
/**
 * Creates the ESOL course event in Prismic, served at /whats-on/esol.
 *
 * A one-shot seed, in the same spirit as scripts/migrate-content: the details
 * were agreed over a conversation rather than typed into the Page Builder, and
 * seven labelled rows are more error-prone to retype than to write down once.
 * Everything here is editable in Prismic afterwards — this only saves the first
 * pass.
 *
 * Prerequisites:
 *   - PRISMIC_WRITE_TOKEN in the environment or in .env.local at the repo root
 *     (created with `prismic token create --write`)
 *
 * Usage:
 *   node scripts/create-event.mjs
 *   node scripts/create-event.mjs --run --image ~/Downloads/esol.jpg
 *
 * The Migration API only creates and updates; it never deletes. Run this twice
 * and you get two events, so the dry run is the default.
 *
 * The document is staged in the repository's **migration release**. Nothing
 * appears on the site — What's On carries no ESOL block and /whats-on/esol
 * 404s — until that release is published in Prismic.
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
			"  set -a; source ../../../.env.local; set +a",
	);
	process.exit(1);
}

/** A path passed as `--image ./file.jpg`, or undefined. */
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
 * Times are given as UTC because that is what Prismic stores. See
 * docs/events.md.
 *
 * `starts_at`/`ends_at` are the **first session**, not the whole course, so the
 * date line reads "Friday 18 September, 11am–2pm". Spanning the ten weeks
 * would read "Friday 18 September, 11am – Friday 20 November, 2pm", which
 * sounds like one very long class. The "When" row says it is weekly.
 *
 * 11am on the 18th is in British Summer Time, an hour ahead, so 10:00 UTC.
 */
const FIRST_STARTS = "2026-09-18T10:00:00+0000";
const FIRST_ENDS = "2026-09-18T13:00:00+0000";

/* The tenth Friday is 20 November, after the clocks go back, so 2pm is 14:00
   UTC. The page comes down when the last session finishes. No button cutoff:
   someone a week or two late is still welcome, so booking stays open as long
   as the page does. */
const LAST_ENDS = "2026-11-20T14:00:00+0000";

const SELT_URL =
	"https://www.gov.uk/guidance/prove-your-english-language-abilities-with-a-secure-english-language-test-selt";

/* A landscape photo, so it does for the share card too — 3:2 cropped to the
   card's 1.91:1 keeps "SCHOOL" in the middle. */
const ALT =
	"Letter tiles scattered across a wooden table, with SCHOOL spelled out in the middle";

let image;
const imagePath = flagPath("--image");
if (imagePath) {
	try {
		const file = readFileSync(resolve(imagePath));
		image = migration.createAsset(file, basename(imagePath), { alt: ALT });
	} catch {
		console.warn(`  ! could not read image at ${imagePath}, skipping`);
	}
}

migration.createDocument(
	{
		type: "event",
		uid: "esol",
		lang: LANG,
		data: {
			title: "ESOL: English Through Stories",
			summary:
				"A free ten-week English course built on stories, old and new — with conversation, cooking and lunch every Friday.",
			starts_at: FIRST_STARTS,
			ends_at: FIRST_ENDS,
			location: "17 Lark Row, London E2 9JA",
			details: [
				{
					label: "When",
					value: [
						p(
							"Fridays, 11am–2pm, for 10 weeks: 18 September to 20 November",
						),
					],
				},
				{
					label: "Each week",
					value: [
						p(
							"Conversation and cooking, then the main lesson, then lunch together and more conversation",
						),
					],
				},
				{ label: "Studying", value: [p("Stories, old and new")] },
				{
					label: "Working towards",
					value: [
						linked(
							"A B2-level Secure English Language Test (SELT), the English test the Home Office accepts for visa applications",
							[["Secure English Language Test (SELT)", SELT_URL]],
						),
					],
				},
				{
					label: "Homework",
					value: [p("Writing, set every week")],
				},
				{
					label: "Attendance",
					value: [
						p(
							"In person. Try to come every week, as each session builds on the last — but if you miss one, you are still welcome back",
						),
					],
				},
				{ label: "Cost", value: [p("Free, lunch included")] },
			],
			body: [
				p(
					"The course is run by Rachel Virgo, a qualified teacher who has helped many students with their English.",
				),
			],
			image,
			share_image: image,
			expires_at: LAST_ENDS,
			cta_label: "Call Rachel to book: 07906 875505",
			cta_link: { link_type: "Web", url: "tel:+447906875505" },
		},
	},
	"ESOL: English Through Stories",
);

/* -------------------------------------------------------------------------- */
/* Write                                                                       */
/* -------------------------------------------------------------------------- */

console.log(
	`\nRepository: ${repositoryName}\n` +
		`  1 event: esol\n` +
		`  image: ${image ? imagePath : "none — pass --image, or add it in Prismic"}\n`,
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
	"\nStaged in the migration release. Nothing is on the site until that\n" +
		"release is published in Prismic.\n",
);
