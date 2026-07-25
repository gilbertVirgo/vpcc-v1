import "server-only";

/**
 * Blur-up placeholders for Prismic images.
 *
 * Prismic serves its assets through imgix, so a 16px-wide render of the same
 * image is one query string away. Fetched on the server and inlined as a data
 * URI, it costs the visitor no extra request and paints with the HTML — the
 * photo then resolves into place instead of snapping in over a grey box.
 *
 * Every failure path returns `undefined`. A missing placeholder is cosmetic;
 * it must never take a page down.
 */

/** Prismic's imgix host. Other hosts have no resizing API, so they are skipped. */
const IMGIX_HOST = "images.prismic.io";

/** Width of the fetched placeholder, in pixels. Next.js blurs it heavily. */
const PLACEHOLDER_WIDTH = 16;

/**
 * Ceiling on the inlined data URI, in bytes.
 *
 * A 16px webp lands around 200 bytes. Anything an order of magnitude larger
 * means imgix ignored the resize, and inlining it would cost more than the
 * placeholder saves.
 */
const MAX_BYTES = 4096;

/** Give up rather than hold a render open on a slow CDN. */
const TIMEOUT_MS = 3000;

/** The tiny-render URL for a Prismic asset, or null if it isn't one. */
function placeholderUrl(url: string): URL | null {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}

	if (parsed.hostname !== IMGIX_HOST) return null;

	/*
	 * `rect` is the crop the editor chose, so it stays. `h` goes: with only a
	 * width, imgix keeps the crop's aspect ratio, and the placeholder matches
	 * the shape of the image it stands in for.
	 */
	parsed.searchParams.set("w", String(PLACEHOLDER_WIDTH));
	parsed.searchParams.delete("h");
	parsed.searchParams.delete("dpr");

	/* `auto=format` would negotiate on the Accept header, which a server-side
	   fetch does not send. Ask for webp outright. */
	parsed.searchParams.set("auto", "compress");
	parsed.searchParams.set("fm", "webp");
	parsed.searchParams.set("q", "40");

	return parsed;
}

/**
 * A base64 data URI of `url`, downscaled to {@link PLACEHOLDER_WIDTH}.
 *
 * Results are held in the Next.js data cache: the URL of a Prismic asset
 * changes whenever the asset does, so a placeholder is safe to keep forever.
 */
export async function getBlurDataURL(
	url: string | null | undefined,
): Promise<string | undefined> {
	if (!url) return undefined;

	const tiny = placeholderUrl(url);
	if (!tiny) return undefined;

	try {
		const response = await fetch(tiny, {
			cache: "force-cache",
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!response.ok) return undefined;

		const bytes = Buffer.from(await response.arrayBuffer());
		if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES)
			return undefined;

		return `data:image/webp;base64,${bytes.toString("base64")}`;
	} catch {
		return undefined;
	}
}
