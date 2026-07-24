import { redirectToPreviewURL } from "@prismicio/next";
import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";

import { createClient } from "@/prismicio";

/**
 * Preview entry point.
 *
 * Prismic sends editors here with a preview token. Draft mode is enabled, then
 * the request is redirected to the URL of the document being previewed, which
 * the route resolver in prismicio.ts works out.
 *
 * Configure this path in the repository's preview settings:
 *   npx prismic preview create --url <site-url> --path /api/preview
 */
export async function GET(request: NextRequest) {
	const client = createClient();
	const draft = await draftMode();

	draft.enable();

	return await redirectToPreviewURL({ client, request });
}
