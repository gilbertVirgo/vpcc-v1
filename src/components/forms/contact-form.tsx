"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

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
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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

	const update = useCallback(
		(field: keyof ContactFormValues) =>
			(
				event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
			) => {
				const { value } = event.target;
				setValues((previous) => ({ ...previous, [field]: value }));
				/* Clear this field's error as it is corrected, rather than
				   leaving it accusing the visitor while they type. */
				setErrors((previous) => ({ ...previous, [field]: undefined }));
			},
		[],
	);

	async function getRecaptchaToken(): Promise<string | undefined> {
		if (!SITE_KEY || !window.grecaptcha) return undefined;

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
			document
				.querySelector<HTMLElement>(`[name="${first}"]`)
				?.focus();
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
					result.error ?? "Your message didn’t send. Please try again.",
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
			{SITE_KEY ? (
				<Script
					src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
					strategy="lazyOnload"
				/>
			) : null}

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
