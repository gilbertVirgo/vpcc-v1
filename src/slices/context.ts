/**
 * Context passed to every slice by the page that renders it.
 *
 * `now` is stamped once per render at the page level rather than read inside a
 * slice. Slices stay pure functions of their props — the same slice data and
 * the same context always produce the same output — and every slice on a page
 * agrees on what "now" is, instead of each reading a slightly different clock.
 */
export interface SliceContext {
	/** Milliseconds since the epoch, captured when the page rendered. */
	now: number;
}

/** The shape of a slice this module needs — anything else is ignored. */
type MaybeImageSlice = {
	primary?: {
		image?: { url?: string | null } | null;
		images?: readonly ({ image?: { url?: string | null } | null } | null)[];
	} | null;
};

function carriesImage(slice: unknown): boolean {
	const primary = (slice as MaybeImageSlice)?.primary;
	if (!primary) return false;
	if (Array.isArray(primary.images)) {
		return primary.images.some((item) => Boolean(item?.image?.url));
	}
	return Boolean(primary.image?.url);
}

/**
 * True when this slice holds the first image on the page.
 *
 * Only that one earns `priority`. It is the likeliest LCP element, so it wants
 * preloading — but marking any more would preload photos far below the fold
 * and starve the one that matters. Images that come from linked documents
 * (team photos, event cards) never match: they sit further down the page and
 * arrive many-at-a-time.
 */
export function isLeadImageSlice(slices: readonly unknown[], index: number) {
	return slices.findIndex(carriesImage) === index;
}
