import "server-only";

/**
 * Best-effort in-memory rate limiter.
 *
 * Deliberately modest in what it claims: serverless functions are per-instance
 * and short-lived, so this bucket is not shared across concurrent instances and
 * does not survive a cold start. It stops the trivial case — one client
 * hammering one warm instance — and nothing more.
 *
 * The real protection on these endpoints is reCAPTCHA plus the honeypot. If
 * abuse ever becomes a genuine problem, this wants replacing with something
 * backed by shared storage.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const buckets = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now > bucket.expiresAt) {
		buckets.set(key, { count: 1, expiresAt: now + WINDOW_MS });
		return { allowed: true, retryAfter: 0 };
	}

	bucket.count += 1;

	if (bucket.count > MAX_REQUESTS) {
		return {
			allowed: false,
			retryAfter: Math.ceil((bucket.expiresAt - now) / 1000),
		};
	}

	return { allowed: true, retryAfter: 0 };
}

/**
 * Best-guess client address.
 *
 * On Netlify the platform sets `x-nf-client-connection-ip`, which a client
 * cannot forge. `x-forwarded-for` is client-supplied and trivially spoofed, so
 * it is only a fallback — which is another reason not to lean on this for
 * anything security-critical.
 */
export function clientKey(headers: Headers): string {
	return (
		headers.get("x-nf-client-connection-ip") ??
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		"unknown"
	);
}

/** Drops expired buckets so a long-lived instance doesn't grow unbounded. */
export function pruneRateLimitBuckets(): void {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now > bucket.expiresAt) buckets.delete(key);
	}
}
