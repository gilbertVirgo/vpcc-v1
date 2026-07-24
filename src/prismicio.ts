import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";

/**
 * The Prismic repository this site reads from.
 *
 * Overridable so a Prismic environment (a clone of the repo used to trial
 * model changes) can be pointed at from Netlify without a code change.
 */
export const repositoryName =
	process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ??
	process.env.PRISMIC_REPOSITORY_NAME ??
	"9yoxbcr3";

/**
 * Maps Prismic documents to URLs.
 *
 * The four core pages get explicit paths so their UIDs are free to be readable
 * (`home`, `whats-on`) without leaking into the URL. Everything else falls
 * through to `/:uid`, which is what makes a new page in Prismic a live page
 * with no deploy.
 *
 * Order matters — the first match wins.
 */
export const routes: prismic.ClientConfig["routes"] = [
	{ type: "page", uid: "home", path: "/" },
	{ type: "page", path: "/:uid" },
];

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
		 * Published content is served from cache and busted by the webhook in
		 * app/api/revalidate. Draft content must never be cached, or an editor
		 * sees a stale preview.
		 */
		fetchOptions:
			process.env.NODE_ENV === "production"
				? { next: { tags: ["prismic"] }, cache: "force-cache" }
				: { next: { revalidate: 5 } },
		accessToken: process.env.PRISMIC_ACCESS_TOKEN,
		...config,
	});

	enableAutoPreviews({ client });

	return client;
}
