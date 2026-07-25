import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";

import config from "../prismic.config.json";

/**
 * The Prismic repository this site reads from.
 *
 * Overridable so a Prismic environment (a clone of the repo used to trial
 * model changes) can be pointed at from Netlify without a code change.
 */
export const repositoryName =
	process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ??
	process.env.PRISMIC_REPOSITORY_NAME ??
	config.repositoryName;

/**
 * Maps Prismic documents to URLs.
 *
 * Read from prismic.config.json rather than declared here, because the CLI
 * writes routes into that file when a page type is created and the Page
 * Builder uses them to work out preview links. Two lists would drift, and the
 * symptom — an editor's preview landing on the wrong URL — is easy to miss.
 *
 * `home` resolves to `/`; everything else falls through to `/:uid`, which is
 * what makes a new page in Prismic a live URL with no deploy. Order matters:
 * the first match wins.
 */
export const routes = config.routes as prismic.ClientConfig["routes"];

/**
 * Creates a Prismic client.
 *
 * `enableAutoPreviews` wires the client to Next's draft mode, so an editor
 * previewing an unpublished document sees it without any per-query handling.
 */
export function createClient(config: prismic.ClientConfig = {}) {
	const client = prismic.createClient(repositoryName, {
		routes,
		/*
		 * Published content is served from cache, busted by the webhook in
		 * app/api/revalidate. Draft content is never cached — Next disables the
		 * data cache under draft mode — so an editor never sees a stale preview.
		 *
		 * The `revalidate` is the safety net, and it is not optional. Tags alone
		 * mean the cache is only ever busted by the webhook, so one missing
		 * PRISMIC_WEBHOOK_SECRET freezes every page at whatever the content was
		 * when the site was last built — a publish then never appears at all,
		 * however long you wait. Five minutes is deliberately shorter than the
		 * hour the pages themselves hold: a page re-render must find the fetch
		 * already stale, or the two windows compound and a change can take two
		 * hours to surface. It costs nothing extra, because the fetch only runs
		 * when a page re-renders in the first place.
		 */
		fetchOptions:
			process.env.NODE_ENV === "production"
				? { next: { tags: ["prismic"], revalidate: 300 } }
				: { next: { revalidate: 5 } },
		accessToken: process.env.PRISMIC_ACCESS_TOKEN,
		...config,
	});

	enableAutoPreviews({ client });

	return client;
}
