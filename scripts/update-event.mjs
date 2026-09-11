#!/usr/bin/env node
/**
 * Takes the "Hope in East London" photo competition off the site.
 *
 * The Migration API cannot delete or unpublish, so this sets the event's
 * `expires_at` ("Hide after") to a moment already gone. `getLiveEvents` then
 * drops it from What's On, its own page 404s, and it leaves the sitemap — the
 * same thing that would have happened on its own once the prize evening was
 * over. See docs/events.md.
 *
 * The edit is staged in the repository's **migration release**. The event stays
 * up until that release is published in Prismic. Publishing it is also what
 * fires the webhook that clears the cache. It only ever updates the one
 * document, so a second run finds it already expired and writes nothing.
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
	createClient,
	createMigration,
	createWriteClient,
} from "@prismicio/client";
import { readFileSync } from "node:fs";

const UID = "hope-in-east-london";
const LANG = "en-gb";
const DRY_RUN = !process.argv.includes("--run");

/**
 * Hide after midnight opening 11 September — already past, so the event is
 * finished the moment the release is published. Fixed rather than "now", so
 * the dry run and the real run agree and a second run is a no-op.
 */
const HIDE_AFTER = "2026-09-10T23:00:00+0000";

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
/* Read                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The document as it stands, which is what gets patched and sent back: the
 * Migration API replaces a document's content with what it is given, so an
 * update needs the whole thing, not the one field being changed.
 */
const client = createClient(repositoryName, {
	accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

let event;
try {
	event = await client.getByUID("event", UID, { lang: LANG });
} catch (error) {
	/* Anything other than "not there" — no network, a private repository
	   without PRISMIC_ACCESS_TOKEN — is left to report itself. */
	if (!(error instanceof NotFoundError)) throw error;

	console.error(
		`No published event "${UID}" in ${repositoryName} — nothing to take down.`,
	);
	process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Patch                                                                       */
/* -------------------------------------------------------------------------- */

console.log(`\nRepository: ${repositoryName}\n  event: ${UID}\n`);

const current = event.data.expires_at;
if (current && Date.parse(current) <= Date.parse(HIDE_AFTER)) {
	console.log(`Already hidden after ${current} — nothing to do.\n`);
	process.exit(0);
}

console.log(
	`  Hide after\n    now:  ${current ?? "not set"}\n    next: ${HIDE_AFTER}\n`,
);
event.data.expires_at = HIDE_AFTER;

/* -------------------------------------------------------------------------- */
/* Write                                                                       */
/* -------------------------------------------------------------------------- */

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
	"\nStaged in the migration release. The competition stays on the site\n" +
		"until that release is published in Prismic.\n",
);
