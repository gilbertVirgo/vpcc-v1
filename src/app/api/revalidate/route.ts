import { revalidatePrismicPages } from "@prismicio/next";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/**
 * Prismic webhook receiver.
 *
 * Publishing in Prismic POSTs here; this busts the cache so the change is live
 * without a rebuild.
 *
 * Register it with:
 *   npx prismic webhook create --url <site-url>/api/revalidate --secret <secret>
 */

interface PrismicWebhookBody {
	type?: string;
	secret?: string;
	documents?: string[];
}

/** Constant-time comparison, so a wrong secret can't be found by timing. */
function secretMatches(received: string | undefined, expected: string) {
	if (!received) return false;

	const a = Buffer.from(received);
	const b = Buffer.from(expected);

	// timingSafeEqual throws on length mismatch, which would itself leak length.
	if (a.length !== b.length) return false;

	return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
	const expected = process.env.PRISMIC_WEBHOOK_SECRET;

	/*
	 * Fail closed. An unset secret must not mean "accept anything" — that would
	 * leave an open cache-busting endpoint on every deploy where the env var
	 * was forgotten.
	 */
	if (!expected) {
		console.error("PRISMIC_WEBHOOK_SECRET is not set; rejecting webhook.");
		return Response.json({ error: "Not configured" }, { status: 500 });
	}

	let body: PrismicWebhookBody;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (!secretMatches(body.secret, expected)) {
		return Response.json({ error: "Invalid secret" }, { status: 401 });
	}

	/* Prismic sends a test payload when a webhook is created or the trigger
	   button is used. Acknowledge it without touching the cache. */
	if (body.type === "test-trigger") {
		return Response.json({ ok: true, tested: true });
	}

	const documents = body.documents ?? [];

	if (documents.length > 0) {
		revalidatePrismicPages(documents);
	}

	/* Documents that appear in shared chrome — the settings singleton, team
	   members listed on a page — affect routes that don't carry their id, so
	   the broad tag is busted as well.
	   Next 16 requires a cache profile; "max" expires the entry immediately
	   rather than waiting out a revalidation window. */
	revalidateTag("prismic", "max");

	return Response.json({ ok: true, revalidated: documents.length });
}
