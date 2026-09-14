#!/usr/bin/env node
/**
 * Makes the Sunday service start time clear across the live content.
 *
 * The service starts at 3:15pm; 3:00pm is the welcome and refreshments. The
 * site said "3:00pm–4:30pm" throughout, which reads as the service starting on
 * the hour. This rewrites every published mention.
 *
 * Two kinds of rule, because two kinds of copy say it:
 *
 *   SENTENCES  whole paragraphs whose wording is known, replaced outright so
 *              the new copy can add the refreshments line rather than just
 *              shift a number.
 *   PHRASES    the time on its own, for anywhere the wording has since been
 *              edited in Prismic and no longer matches a sentence.
 *
 * Phrase rules rewrite text in place, so any inline links in the paragraph
 * would end up pointing at the wrong words. Spans are shifted by the length
 * each edit before them added or removed, which keeps the "Victoria Park
 * Baptist Church" maps link on the venue name where the Sundays paragraph
 * carries one.
 *
 * Events are reported but never rewritten: an event that happens to run
 * 3:00–4:30pm is its own thing, not the Sunday service, and a blanket rewrite
 * would move a real event's start time. The dry run lists them to look at.
 *
 * As with scripts/update-event.mjs, the edit is staged in the repository's
 * **migration release** — nothing changes on the site until that release is
 * published in Prismic, which is also what fires the cache webhook. Rules only
 * match the old wording, so a second run finds nothing to do.
 *
 * Prerequisites:
 *   - PRISMIC_WRITE_TOKEN in the environment or in .env.local at the repo root
 *     (created with `prismic token create --write`)
 *   - PRISMIC_ACCESS_TOKEN too, if the repository has been set to private
 *
 * Usage:
 *   node scripts/update-service-time.mjs        # dry run: prints every change
 *   node scripts/update-service-time.mjs --run
 */

import {
	createClient,
	createMigration,
	createWriteClient,
} from "@prismicio/client";
import { readFileSync } from "node:fs";

const LANG = "en-gb";
const DRY_RUN = !process.argv.includes("--run");

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Whole paragraphs, matched on their exact current text.
 *
 * The replacement is a list, so one paragraph can become two: the Sundays
 * feature on both Home and What's On gains the refreshments sentence as its
 * own paragraph, matching how the seed script now writes it.
 */
const SENTENCES = [
	{
		from: "We meet from 3:00pm–4:30pm at Victoria Park Baptist Church, 186 Grove Road, London E3 5TG.",
		to: [
			"Our service runs from 3:15pm–4:30pm at Victoria Park Baptist Church, 186 Grove Road, London E3 5TG.",
			"Come along from 3:00pm for a warm welcome and refreshments before we begin.",
		],
	},
];

/**
 * The time on its own, for copy that no longer matches a sentence rule.
 *
 * Ordered longest first so "Sundays, 3:00–4:30pm" is not half-eaten by the
 * bare "3:00–4:30pm" rule below it. Both dash characters appear in the content
 * — the copy uses en dashes, hand-edits in Prismic tend to use hyphens — so
 * each spelling is listed rather than guessed at with a regex.
 */
const PHRASES = [
	["Sundays, 3:00–4:30pm", "Sundays, 3:15–4:30pm (refreshments from 3:00pm)"],
	["Sundays, 3:00-4:30pm", "Sundays, 3:15-4:30pm (refreshments from 3:00pm)"],
	["Sundays, 3–4:30pm", "Sundays, 3:15–4:30pm (refreshments from 3:00pm)"],
	["3:00pm–4:30pm", "3:15pm–4:30pm"],
	["3:00pm-4:30pm", "3:15pm-4:30pm"],
	["3.00pm–4.30pm", "3.15pm–4.30pm"],
	["3.00pm-4.30pm", "3.15pm-4.30pm"],
	["3:00–4:30pm", "3:15–4:30pm"],
	["3:00-4:30pm", "3:15-4:30pm"],
	["3pm–4:30pm", "3:15pm–4:30pm"],
	["3pm-4:30pm", "3:15pm-4:30pm"],
	["3–4:30pm", "3:15–4:30pm"],
	["3-4:30pm", "3:15-4:30pm"],
];

/**
 * Anything left that still talks about a time starting at 3 on the hour. Used
 * only to print a warning: copy the rules did not recognise is for a human to
 * read, not for this script to guess at.
 */
const LEFTOVER = /\b3(?:[:.]00)?\s*(?:pm)?\s*(?:[–-]|to\b)/i;

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

/* -------------------------------------------------------------------------- */
/* Rewriting                                                                   */
/* -------------------------------------------------------------------------- */

const changes = [];
const leftovers = [];

/**
 * Applies the phrase rules to a string.
 *
 * Returns the new text along with the edits that produced it, so a caller
 * holding rich-text spans can move them. Each edit records where it happened
 * in the *original* string and how much longer the replacement was.
 */
function rewrite(text) {
	let out = text;
	const edits = [];

	for (const [from, to] of PHRASES) {
		let cursor = 0;

		for (;;) {
			const at = out.indexOf(from, cursor);
			if (at === -1) break;

			out = out.slice(0, at) + to + out.slice(at + from.length);
			edits.push({ at, delta: to.length - from.length });
			cursor = at + to.length;
		}
	}

	return { text: out, edits };
}

/** Moves a span to wherever its words ended up after the edits. */
function shift(span, edits) {
	const move = (index) =>
		edits.reduce(
			(acc, edit) => (edit.at < index ? acc + edit.delta : acc),
			index,
		);

	return { ...span, start: move(span.start), end: move(span.end) };
}

/**
 * Rewrites one rich-text field in place, returning how many nodes changed.
 *
 * Sentence rules win: if a node is one of the known paragraphs it is replaced
 * wholesale (possibly by several), and the phrase rules never see it.
 */
function rewriteRichText(nodes, where) {
	let touched = 0;

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (typeof node?.text !== "string" || node.text === "") continue;

		/* A paragraph carrying inline links is left to the phrase rules, which
		   keep the links on their words. Splitting it in two would have no
		   honest answer for which half a link belongs to. */
		const sentence =
			node.spans?.length > 0
				? undefined
				: SENTENCES.find((rule) => rule.from === node.text);

		if (sentence) {
			const replacements = sentence.to.map((text) => ({
				...node,
				text,
				spans: [],
			}));

			nodes.splice(i, 1, ...replacements);
			i += replacements.length - 1;

			changes.push({
				where,
				from: node.text,
				to: sentence.to.join(" / "),
			});
			touched++;
			continue;
		}

		const { text, edits } = rewrite(node.text);
		if (edits.length === 0) {
			if (LEFTOVER.test(node.text))
				leftovers.push({ where, text: node.text });
			continue;
		}

		changes.push({ where, from: node.text, to: text });
		node.text = text;
		if (Array.isArray(node.spans)) {
			node.spans = node.spans.map((span) => shift(span, edits));
		}
		touched++;
	}

	return touched;
}

/** Walks a document's data, rewriting every rich-text field it finds. */
function rewriteDocument(value, where) {
	let touched = 0;

	if (Array.isArray(value)) {
		/* A rich text field is an array of nodes with .text; anything else is
		   a repeatable group, so recurse into it. */
		if (value.some((node) => typeof node?.text === "string")) {
			return rewriteRichText(value, where);
		}
		for (const item of value) touched += rewriteDocument(item, where);
		return touched;
	}

	if (value && typeof value === "object") {
		for (const child of Object.values(value)) {
			touched += rewriteDocument(child, where);
		}
	}

	return touched;
}

/* -------------------------------------------------------------------------- */
/* Read                                                                        */
/* -------------------------------------------------------------------------- */

/*
 * The Migration API replaces a document's content with what it is given, so
 * each update sends the whole document back, patched — the same approach as
 * update-event.mjs.
 */
const client = createClient(repositoryName, {
	accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

console.log(`\nRepository: ${repositoryName}\n`);

const settings = await client.getSingle("settings", { lang: LANG });
const pages = await client.getAllByType("page", { lang: LANG });
const events = await client.getAllByType("event", { lang: LANG });

/* -------------------------------------------------------------------------- */
/* Patch                                                                       */
/* -------------------------------------------------------------------------- */

const updated = [];

/* Settings: the footer's meeting line, which is a plain text field rather than
   rich text and so is handled by name instead of by the walk. */
const when = settings.data.meeting_when;
if (typeof when === "string" && when !== "") {
	const { text, edits } = rewrite(when);
	if (edits.length > 0) {
		changes.push({
			where: "settings · meeting_when",
			from: when,
			to: text,
		});
		settings.data.meeting_when = text;
		updated.push(settings);
	} else if (LEFTOVER.test(when)) {
		leftovers.push({ where: "settings · meeting_when", text: when });
	}
}

/* ...and any rich text it carries, such as the site-wide notice. Plain strings
   are invisible to the walk, so meeting_when is not seen here a second time. */
if (rewriteDocument(settings.data, "settings") > 0) {
	if (!updated.includes(settings)) updated.push(settings);
}

for (const page of pages) {
	const where = `page · ${page.uid}`;
	if (rewriteDocument(page.data, where) > 0) updated.push(page);
}

/* Events are read only: see the note at the top of this file. */
for (const event of events) {
	const json = JSON.stringify(event.data);
	if (PHRASES.some(([from]) => json.includes(from))) {
		leftovers.push({
			where: `event · ${event.uid}`,
			text: "mentions a 3:00–4:30pm time — check whether it is the Sunday service",
		});
	}
}

/* -------------------------------------------------------------------------- */
/* Report                                                                      */
/* -------------------------------------------------------------------------- */

if (changes.length === 0) {
	console.log("Nothing to change — every mention already reads 3:15pm.\n");
} else {
	console.log(`${changes.length} change(s):\n`);
	for (const change of changes) {
		console.log(`  ${change.where}`);
		console.log(`    now:  ${change.from}`);
		console.log(`    next: ${change.to}\n`);
	}
}

if (leftovers.length > 0) {
	console.log("Worth a look — not changed:\n");
	for (const leftover of leftovers) {
		console.log(`  ${leftover.where}\n    ${leftover.text}\n`);
	}
}

if (updated.length === 0) process.exit(0);

console.log(
	`Would update ${updated.length} document(s): ` +
		`${updated.map((doc) => doc.uid ?? doc.type).join(", ")}\n`,
);

/* -------------------------------------------------------------------------- */
/* Write                                                                       */
/* -------------------------------------------------------------------------- */

if (DRY_RUN) {
	console.log("Dry run — nothing written. Re-run with --run to stage it.\n");
	process.exit(0);
}

const migration = createMigration();
for (const doc of updated) migration.updateDocument(doc);

const writeClient = createWriteClient(repositoryName, { writeToken });

await writeClient.migrate(migration, {
	reporter: (step) => {
		if (step.type.endsWith(":end") || step.type === "start") return;
		console.log(`  ${step.type}`);
	},
});

console.log(
	"\nStaged in the migration release. The site keeps showing the old\n" +
		"times until that release is published in Prismic.\n",
);
