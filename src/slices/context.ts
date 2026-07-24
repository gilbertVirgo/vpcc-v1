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
