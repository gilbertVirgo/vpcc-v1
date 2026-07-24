import {
	type ContactFormValues,
	isValidVariant,
	parseContactFormValues,
	validateContactForm,
} from "@/lib/contact-form";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { clientKey, pruneRateLimitBuckets, rateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";

/**
 * Contact and donate form handler.
 *
 * Replaces the two Netlify Functions from the previous site. One endpoint
 * serves both forms; `variant` selects the recipient and the subject line.
 */

const RECIPIENTS = {
	contact: () => process.env.CONTACT_FORM_RECIPIENT ?? process.env.GMAIL_USER,
	donate: () => process.env.DONATE_FORM_RECIPIENT ?? process.env.GMAIL_USER,
} as const;

const SUBJECTS = {
	contact: "Website enquiry",
	donate: "Donation enquiry",
} as const;

function body(values: ContactFormValues, variant: string) {
	return [
		`A message was sent from the ${variant} form on vpcc.church.`,
		"",
		`Name:    ${values.firstName} ${values.lastName}`,
		`Email:   ${values.email}`,
		"",
		"Message:",
		values.message,
	].join("\n");
}

export async function POST(request: Request) {
	pruneRateLimitBuckets();

	const limit = rateLimit(clientKey(request.headers));
	if (!limit.allowed) {
		return Response.json(
			{ error: "Too many messages. Please try again shortly." },
			{ status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
		);
	}

	let payload: Record<string, unknown>;
	try {
		payload = await request.json();
	} catch {
		return Response.json({ error: "Invalid request." }, { status: 400 });
	}

	/*
	 * Honeypot. A field hidden from people but present in the DOM: anything
	 * that fills it in is automated. Answer 200 so the bot has no signal that
	 * it was caught and no reason to adapt.
	 */
	if (typeof payload.website === "string" && payload.website.trim() !== "") {
		return Response.json({ ok: true });
	}

	const variant = payload.variant;
	if (!isValidVariant(variant)) {
		return Response.json({ error: "Unknown form." }, { status: 400 });
	}

	const values = parseContactFormValues(payload.values);
	if (!values) {
		return Response.json({ error: "Invalid request." }, { status: 400 });
	}

	/* The same validation the browser ran. Client-side checks are a courtesy;
	   this is the one that counts. */
	const errors = validateContactForm(values);
	if (Object.keys(errors).length > 0) {
		return Response.json({ error: "Invalid details.", errors }, { status: 422 });
	}

	const token = typeof payload.token === "string" ? payload.token : undefined;
	const recaptcha = await verifyRecaptcha(token, `${variant}_form`);
	if (!recaptcha.ok) {
		console.warn(`reCAPTCHA rejected a ${variant} submission: ${recaptcha.reason}`);
		return Response.json(
			{ error: "We couldn’t verify that request. Please try again." },
			{ status: 403 },
		);
	}

	if (!isMailConfigured()) {
		console.error("Mail is not configured; GMAIL_USER/GMAIL_PASS are unset.");
		return Response.json(
			{ error: "Sending is unavailable right now." },
			{ status: 500 },
		);
	}

	const to = RECIPIENTS[variant]();
	if (!to) {
		console.error(`No recipient configured for the ${variant} form.`);
		return Response.json(
			{ error: "Sending is unavailable right now." },
			{ status: 500 },
		);
	}

	try {
		await sendMail({
			to,
			subject: `${SUBJECTS[variant]} from ${values.firstName} ${values.lastName}`,
			text: body(values, variant),
			/* So hitting reply in the inbox goes to the enquirer. The address is
			   validated above, and nodemailer encodes the header. */
			replyTo: values.email.trim(),
		});
	} catch (error) {
		console.error("Failed to send contact form email:", error);
		return Response.json(
			{ error: "Your message didn’t send. Please try again." },
			{ status: 502 },
		);
	}

	return Response.json({ ok: true });
}
