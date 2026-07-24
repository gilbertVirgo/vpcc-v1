import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Mail adapter.
 *
 * Gmail with an app password, carried over from the previous site. Everything
 * provider-specific is confined to this file, so moving to Resend or Postmark
 * later is one implementation swap rather than a change at every call site.
 *
 * Gmail's app passwords are rate-limited and tied to a single account. For a
 * contact form measured in messages per week that is fine; if volume grows, or
 * if deliverability matters, this is the file to replace.
 */

export interface MailMessage {
	to: string;
	subject: string;
	text: string;
	/** Set so a reply goes to the person who filled in the form. */
	replyTo?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
	if (transporter) return transporter;

	const user = process.env.GMAIL_USER;
	const pass = process.env.GMAIL_PASS;

	if (!user || !pass) {
		throw new Error("GMAIL_USER and GMAIL_PASS must both be set.");
	}

	transporter = nodemailer.createTransport({
		service: "gmail",
		auth: { user, pass },
	});

	return transporter;
}

export async function sendMail(message: MailMessage): Promise<void> {
	const from = process.env.GMAIL_USER;
	const transport = getTransporter();

	await transport.sendMail({
		from: `"Victoria Park Community Church" <${from}>`,
		to: message.to,
		subject: message.subject,
		text: message.text,
		replyTo: message.replyTo,
	});
}

/** True when the adapter has everything it needs to send. */
export function isMailConfigured(): boolean {
	return Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);
}
