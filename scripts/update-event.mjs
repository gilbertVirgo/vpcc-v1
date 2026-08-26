#!/usr/bin/env node
/**
 * Moves the "Hope in East London" photo deadline to Wednesday 2 September.
 *
 * Two fields carry that deadline and they have to move together: the "Photos
 * due" row people read, and `cta_expires_at`, which drops the entry button
 * once sign-up closes. Change one by hand and forget the other and the page
 * either turns entrants away a week early or takes entries after the cut-off.
 * See docs/events.md.
 *
 * The edit is staged in the repository's **migration release**. The Migration
 * API patches the document there; the live page keeps the old date until that
 * release is published in Prismic. Unlike scripts/create-event.mjs, which
 * creates and so duplicates if it is run twice, this only ever updates the one
 * document — a second run finds both fields already right and writes nothing.
 *
 * Prerequisites:
 *   - PRISMIC_WRITE_TOKEN in the environment or in .env.local at the repo root
 *     (created with `prismic token create --write`)
 *   - PRISMIC_ACCESS_TOKEN too, if the repository has been set to private
 *
 * Usage:
 *   node scripts/update-event.mjs        # dry run: prints the change
 *   node scripts/update-event.mjs --run
 */

import {
	NotFoundError,
	asText,
	createClient,
	createMigration,
	createWriteClient,
} from "@prismicio/client";
import { readFileSync } from "node:fs";

const UID = "hope-in-east-london";
const LANG = "en-gb";
const DRY_RUN = !process.argv.includes("--run");

/* -------------------------------------------------------------------------- */
/* The change                                                                  */
/* -------------------------------------------------------------------------- */

/** The row is found by its label, so reordering the details cannot misfire. */
const PHOTOS_DUE_LABEL = "Photos due";
const PHOTOS_DUE = "11:59pm, Wednesday 2 September";

/**
 * The same moment as a timestamp, which is what hides the entry button.
 *
 * Written as the UTC Prismic stores rather than as local time: 11:59pm falls
 * in British Summer Time, an hour ahead, so the stored value is 22:59. The
 * report below prints it back in Europe/London — the number to check is the
 * one on the right.
 */
const ENTRIES_CLOSE = "2026-09-02T22:59:00+0000";

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

/* -------------------------------------------------------------------------- */
/* Read                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The document as it stands, which is what gets patched and sent back.
 *
 * An update needs the whole document, not the two fields being changed: the
 * Migration API replaces a document's content with what it is given. Fetching
 * first is also what makes the run checkable — the report says what each field
 * reads now, so a value that has already been edited in Prismic shows up
 * instead of being quietly overwritten with an assumption.
 */
const client = createClient(repositoryName, {
	accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

let event;
try {
	event = await client.getByUID("event", UID, { lang: LANG });
} catch (error) {
	/* Anything other than "not there" — no network, a private repository
	   without PRISMIC_ACCESS_TOKEN — is left to report itself, because
	   flattening it into the draft message below sends the next person
	   looking in the Page Builder for a document that is already there. */
	if (!(error instanceof NotFoundError)) throw error;

	console.error(
		`No published event "${UID}" in ${repositoryName}.\n\n` +
			"Only published documents can be read back, so an event still\n" +
			"sitting as a draft cannot be patched this way — open it in the\n" +
			"Page Builder and change the two fields there instead.",
	);
	process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Patch                                                                       */
/* -------------------------------------------------------------------------- */

/** A timestamp as Prismic stores it, alongside the time it means in London. */
function readable(timestamp) {
	if (!timestamp) return "not set";

	const local = new Date(timestamp).toLocaleString("en-GB", {
		timeZone: "Europe/London",
		weekday: "long",
		day: "numeric",
		month: "long",
		hour: "numeric",
		minute: "2-digit",
	});

	return `${timestamp} (${local} in London)`;
}

const changes = [];

const row = event.data.details.find(
	(detail) => detail.label === PHOTOS_DUE_LABEL,
);
if (!row) {
	const labels = event.data.details.map((detail) => detail.label).join(", ");
	console.error(
		`The event has no "${PHOTOS_DUE_LABEL}" row — its details are: ${labels}.\n` +
			"Renaming the row is fine, but this script has to be told about it.",
	);
	process.exit(1);
}

const stated = asText(row.value);
if (stated !== PHOTOS_DUE) {
	changes.push([`${PHOTOS_DUE_LABEL} (details)`, stated, PHOTOS_DUE]);
	/* Replaces the row outright rather than editing the text in place: the
	   value is one plain sentence, and rewriting it as one keeps a stray bold
	   or link from surviving into a date it was never applied to. */
	row.value = [{ type: "paragraph", text: PHOTOS_DUE, spans: [] }];
}

const closes = event.data.cta_expires_at;
if (!closes || Date.parse(closes) !== Date.parse(ENTRIES_CLOSE)) {
	changes.push([
		"Entry button hidden after",
		readable(closes),
		readable(ENTRIES_CLOSE),
	]);
	event.data.cta_expires_at = ENTRIES_CLOSE;
}

/* -------------------------------------------------------------------------- */
/* Write                                                                       */
/* -------------------------------------------------------------------------- */

console.log(`\nRepository: ${repositoryName}\n  event: ${UID}\n`);

if (changes.length === 0) {
	console.log("Both fields already read the new deadline — nothing to do.\n");
	process.exit(0);
}

for (const [field, before, after] of changes) {
	console.log(`  ${field}\n    now:  ${before}\n    next: ${after}\n`);
}

if (DRY_RUN) {
	console.log("Dry run — nothing written. Re-run with --run to stage it.\n");
	process.exit(0);
}

const migration = createMigration();
migration.updateDocument(event);

const writeClient = createWriteClient(repositoryName, { writeToken });

await writeClient.migrate(migration, {
	reporter: (step) => {
		if (step.type.endsWith(":end") || step.type === "start") return;
		console.log(`  ${step.type}`);
	},
});

console.log(
	"\nStaged in the migration release. The site still shows the old date\n" +
		"until that release is published in Prismic — publishing it is also\n" +
		"what fires the webhook that clears the cache.\n",
);
