import "server-only";

/**
 * reCAPTCHA v3 verification.
 *
 * The previous site minted a token in the browser and then never checked it
 * server-side, which makes the whole thing decorative — a bot simply posts to
 * the endpoint without one. This verifies the token with Google and checks
 * three things: that it succeeded, that the score clears a threshold, and that
 * the action matches the form that claims to have produced it.
 */

/**
 * Google's score runs 0 (almost certainly a bot) to 1 (almost certainly human).
 *
 * 0.5 is Google's suggested starting point and it was wrong here. v3 calibrates
 * per key against that key's own traffic, and a key with no history scores
 * nearly everyone 0.3 — verified against Google directly: a real person on the
 * live site and an automated browser came back with the same 0.3. At 0.5 the
 * form rejected every human who tried it.
 *
 * So this sits below that band rather than above it. Obvious automation still
 * lands at 0.1 and is still refused, and the score is not the only thing
 * standing between a bot and the mailbox — the honeypot and the rate limiter in
 * the route both run first. Losing a real enquiry costs this church more than
 * receiving a spam one.
 *
 * Raise it once the key has weeks of real traffic. The route logs the score of
 * every accepted submission, which is the evidence to raise it on.
 */
const SCORE_THRESHOLD = 0.3;
const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

interface VerifyResponse {
	success: boolean;
	score?: number;
	action?: string;
	"error-codes"?: string[];
}

export type RecaptchaResult =
	| { ok: true; score: number | null }
	| { ok: false; reason: string };

export function isRecaptchaConfigured(): boolean {
	return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

export async function verifyRecaptcha(
	token: string | undefined,
	expectedAction: string,
): Promise<RecaptchaResult> {
	const secret = process.env.RECAPTCHA_SECRET_KEY;

	/*
	 * With no secret configured there is nothing to verify against. In
	 * development that is expected and the check is skipped; in production it
	 * means the endpoint is unprotected, so it fails closed instead.
	 */
	if (!secret) {
		if (process.env.NODE_ENV === "production") {
			return { ok: false, reason: "recaptcha-not-configured" };
		}
		console.warn("RECAPTCHA_SECRET_KEY unset — skipping verification.");
		return { ok: true, score: null };
	}

	if (!token) return { ok: false, reason: "missing-token" };

	let data: VerifyResponse;
	try {
		const response = await fetch(VERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret, response: token }),
			cache: "no-store",
		});
		data = await response.json();
	} catch {
		return { ok: false, reason: "verification-unreachable" };
	}

	if (!data.success) {
		return {
			ok: false,
			reason: data["error-codes"]?.join(",") ?? "verification-failed",
		};
	}

	/* Without the action check, a token minted on any other page of the site —
	   or any other site sharing the key — would be accepted here. */
	if (data.action && data.action !== expectedAction) {
		return { ok: false, reason: "action-mismatch" };
	}

	const score = data.score ?? 0;
	if (score < SCORE_THRESHOLD) {
		return { ok: false, reason: `low-score:${score}` };
	}

	return { ok: true, score };
}
