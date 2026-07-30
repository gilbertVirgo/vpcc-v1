"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormStatus, Input, Textarea } from "@/components/ui/form";
import { Stack } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";
import {
	type ContactFormErrors,
	type ContactFormValues,
	type ContactFormVariant,
	EMPTY_CONTACT_FORM,
	validateContactForm,
} from "@/lib/contact-form";

type Status = "idle" | "submitting" | "success" | "error";

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void;
			execute: (
				siteKey: string,
				options: { action: string },
			) => Promise<string>;
		};
	}
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const RECAPTCHA_SRC = SITE_KEY
	? `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
	: null;

/**
 * Loads the reCAPTCHA script, once per page.
 *
 * Done imperatively rather than with next/script: the token is required for
 * the form to work at all, and next/script's scheduling proved unreliable here
 * — the tag was never injected on this route, which left every submission
 * without a token and rejected by the server. A plain injection is predictable
 * and happens the moment a form mounts.
 *
 * The guard on an existing tag matters because both /connect and /donate can
 * render a form, and a second copy of the script resets grecaptcha.
 */
function loadRecaptcha() {
	if (!RECAPTCHA_SRC) return;
	if (document.querySelector(`script[src="${RECAPTCHA_SRC}"]`)) return;

	const script = document.createElement("script");
	script.src = RECAPTCHA_SRC;
	script.async = true;
	document.head.appendChild(script);
}

export interface ContactFormProps {
	variant: ContactFormVariant;
	submitLabel?: string;
	successTitle?: string;
	successMessage?: string;
}

/**
 * The contact and donate form.
 *
 * One component for both: they collect identical details and differ only in
 * where the message lands. Phase 3's `contact_form` slice renders this too, so
 * the markup never diverges between a hard-coded page and a Prismic one.
 */
export function ContactForm({
	variant,
	submitLabel = "Send",
	successTitle = "Message sent",
	successMessage = "Thank you for getting in touch. We’ll get back to you as soon as we can.",
}: ContactFormProps) {
	const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);
	const [errors, setErrors] = useState<ContactFormErrors>({});
	const [status, setStatus] = useState<Status>("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const honeypot = useRef<HTMLInputElement>(null);

	useEffect(loadRecaptcha, []);

	const update = useCallback(
		(field: keyof ContactFormValues) =>
			(
				event: React.ChangeEvent<
					HTMLInputElement | HTMLTextAreaElement
				>,
			) => {
				const { value } = event.target;
				setValues((previous) => ({ ...previous, [field]: value }));
				/* Clear this field's error as it is corrected, rather than
				   leaving it accusing the visitor while they type. */
				setErrors((previous) => ({ ...previous, [field]: undefined }));
			},
		[],
	);

	/**
	 * Waits for the reCAPTCHA script to finish loading.
	 *
	 * Without this, a visitor who fills in the form faster than the script
	 * loads submits with no token, and the server — which verifies tokens
	 * properly — rejects them with a 403. Giving up immediately turned a slow
	 * network into a broken form.
	 */
	async function waitForRecaptcha(timeoutMs = 5000): Promise<boolean> {
		if (window.grecaptcha) return true;

		const started = Date.now();
		while (Date.now() - started < timeoutMs) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			if (window.grecaptcha) return true;
		}
		return false;
	}

	async function getRecaptchaToken(): Promise<string | undefined> {
		if (!SITE_KEY) return undefined;
		if (!(await waitForRecaptcha())) return undefined;

		return new Promise((resolve) => {
			window.grecaptcha?.ready(() => {
				window.grecaptcha
					?.execute(SITE_KEY, { action: `${variant}_form` })
					.then(resolve)
					.catch(() => resolve(undefined));
			});
		});
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateContactForm(values);
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			/* Move focus to the first problem so a keyboard or screen-reader
			   user isn't left at the submit button wondering what happened. */
			const first = Object.keys(nextErrors)[0];
			document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
			return;
		}

		setStatus("submitting");
		setErrorMessage("");

		try {
			const token = await getRecaptchaToken();

			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					variant,
					values,
					token,
					website: honeypot.current?.value ?? "",
				}),
			});

			const result = await response.json().catch(() => ({}));

			if (!response.ok) {
				if (result.errors) setErrors(result.errors);
				setErrorMessage(
					result.error ??
						"Your message didn’t send. Please try again.",
				);
				setStatus("error");
				return;
			}

			setStatus("success");
			setValues(EMPTY_CONTACT_FORM);
		} catch {
			setErrorMessage(
				"Your message didn’t send. Please check your connection and try again.",
			);
			setStatus("error");
		}
	}

	if (status === "success") {
		return (
			<FormStatus tone="success" title={successTitle}>
				{successMessage}
			</FormStatus>
		);
	}

	return (
		<>
			<form onSubmit={handleSubmit} noValidate>
				<Stack gap="lg">
					{status === "error" ? (
						<FormStatus tone="error" title="Something went wrong">
							{errorMessage}
						</FormStatus>
					) : null}

					<div className="grid gap-5 xs:grid-cols-2">
						<Field
							name="firstName"
							label="First name"
							required
							error={errors.firstName}
						>
							<Input
								type="text"
								autoComplete="given-name"
								value={values.firstName}
								onChange={update("firstName")}
							/>
						</Field>

						<Field
							name="lastName"
							label="Last name"
							required
							error={errors.lastName}
						>
							<Input
								type="text"
								autoComplete="family-name"
								value={values.lastName}
								onChange={update("lastName")}
							/>
						</Field>
					</div>

					<Field
						name="email"
						label="Email address"
						required
						error={errors.email}
						hint="We’ll only use this to reply to you."
					>
						<Input
							type="email"
							autoComplete="email"
							value={values.email}
							onChange={update("email")}
						/>
					</Field>

					<Field
						name="message"
						label="Message"
						required
						error={errors.message}
					>
						<Textarea
							value={values.message}
							onChange={update("message")}
						/>
					</Field>

					{/*
					  Honeypot. Positioned off-screen rather than display:none —
					  some bots skip hidden inputs — and hidden from assistive
					  tech and the tab order so no person ever meets it.
					*/}
					<div aria-hidden="true" className="offscreen">
						<label htmlFor={`${variant}-website`}>
							Leave this field empty
						</label>
						<input
							ref={honeypot}
							id={`${variant}-website`}
							name="website"
							type="text"
							tabIndex={-1}
							autoComplete="off"
						/>
					</div>

					<div>
						<Button
							type="submit"
							loading={status === "submitting"}
							size="lg"
						>
							{status === "submitting" ? "Sending" : submitLabel}
						</Button>
					</div>

					{SITE_KEY ? (
						/*
						 * Google's terms allow hiding the badge only if this
						 * attribution is shown instead. The previous site hid
						 * the badge on every page but carried the notice on one
						 * form and a bare sentence on the other.
						 */
						<Text size="caption" tone="muted">
							This site is protected by reCAPTCHA. Google’s{" "}
							<a
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-4"
							>
								Privacy Policy
							</a>{" "}
							and{" "}
							<a
								href="https://policies.google.com/terms"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-4"
							>
								Terms of Service
							</a>{" "}
							apply.
						</Text>
					) : null}
				</Stack>
			</form>
		</>
	);
}
