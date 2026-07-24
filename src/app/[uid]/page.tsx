import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { SliceContext } from "@/slices/context";

/**
 * Every page except the home page.
 *
 * Content is entirely slice-driven, so a new page in Prismic is a live URL
 * with no deploy.
 *
 * `revalidate` is a backstop, not the main mechanism: the Prismic webhook
 * busts the cache the moment content changes. It exists because the EventList
 * slice hides events once `expires_at` passes, and nothing fires a webhook
 * when a date simply goes by — without it, a finished event would sit on the
 * page until the next publish.
 */
export const revalidate = 3600;

/*
 * One timestamp for the whole page.
 *
 * Read here, in the page's data layer, rather than inside a slice: slices stay
 * pure functions of their props, and every slice agrees on what "now" is.
 */
function sliceContext(): SliceContext {
	return { now: Date.now() };
}

export async function generateStaticParams() {
	const client = createClient();

	/*
	 * An empty repository must not fail the build.
	 *
	 * Prismic's Content API only registers a document type once something of
	 * that type has been published. Until then, passing `routes` for that type
	 * is a hard "Link resolver error" rather than an empty result — so a fresh
	 * repository, or a deploy that lands before the first page is published,
	 * would take the whole build down. Returning no params just means nothing
	 * is prerendered; pages render on demand and get picked up on the next
	 * build.
	 */
	const pages = await client.getAllByType("page").catch((error) => {
		console.warn(
			"Could not list pages for prerendering; building with none.",
			error instanceof Error ? error.message : error,
		);
		return [];
	});

	/* The home page is served by app/page.tsx, so it must not also be
	   prerendered here as /home. */
	return pages
		.filter((page) => page.uid !== "home")
		.map((page) => ({ uid: page.uid }));
}

type RouteParams = { uid: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<RouteParams>;
}): Promise<Metadata> {
	const { uid } = await params;
	const client = createClient();
	const page = await client.getByUID("page", uid).catch(() => null);

	if (!page) return {};

	const image = asImageSrc(page.data.meta_image);

	return {
		title: page.data.meta_title ?? undefined,
		description: page.data.meta_description ?? undefined,
		openGraph: {
			title: page.data.meta_title ?? undefined,
			description: page.data.meta_description ?? undefined,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page({
	params,
}: {
	params: Promise<RouteParams>;
}) {
	const { uid } = await params;

	/* `/home` would otherwise render the same document as `/`, giving two URLs
	   for one page. */
	if (uid === "home") notFound();

	const client = createClient();
	const page = await client.getByUID("page", uid).catch(() => null);

	if (!page) notFound();

	return (
		<main id="main">
			<SliceZone
				slices={page.data.slices}
				components={components}
				context={sliceContext()}
			/>
		</main>
	);
}
