/**
 * Contact form shape and validation.
 *
 * Imported by both the client component and the route handler, so the rules
 * are defined once. Client-side validation is a convenience; the server runs
 * the same checks and does not trust anything the browser sent.
 */

export const CONTACT_FORM_VARIANTS = ["contact", "donate"] as const;
export type ContactFormVariant = (typeof CONTACT_FORM_VARIANTS)[number];

export interface ContactFormValues {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export const EMPTY_CONTACT_FORM: ContactFormValues = {
	firstName: "",
	lastName: "",
	email: "",
	message: "",
};

const MAX = {
	name: 80,
	email: 254, // RFC 5321 maximum
	message: 5000,
} as const;

/* Deliberately permissive. Anything stricter rejects valid addresses, and the
   only real proof an address works is that mail to it arrives. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(
	values: ContactFormValues,
): ContactFormErrors {
	const errors: ContactFormErrors = {};

	if (!values.firstName.trim()) {
		errors.firstName = "First name is required.";
	} else if (values.firstName.length > MAX.name) {
		errors.firstName = `Please keep this under ${MAX.name} characters.`;
	}

	if (!values.lastName.trim()) {
		errors.lastName = "Last name is required.";
	} else if (values.lastName.length > MAX.name) {
		errors.lastName = `Please keep this under ${MAX.name} characters.`;
	}

	if (!values.email.trim()) {
		errors.email = "Email address is required.";
	} else if (!EMAIL.test(values.email.trim())) {
		errors.email = "Enter a valid email address.";
	} else if (values.email.length > MAX.email) {
		errors.email = "That email address is too long.";
	}

	if (!values.message.trim()) {
		errors.message = "Please tell us a little about why you’re getting in touch.";
	} else if (values.message.length > MAX.message) {
		errors.message = `Please keep this under ${MAX.message} characters.`;
	}

	return errors;
}

export function isValidVariant(value: unknown): value is ContactFormVariant {
	return (
		typeof value === "string" &&
		(CONTACT_FORM_VARIANTS as readonly string[]).includes(value)
	);
}

/**
 * Coerces an unknown request body into the form shape.
 *
 * Returns null rather than throwing when the payload isn't an object of
 * strings, so a malformed POST is a 400 rather than a 500.
 */
export function parseContactFormValues(input: unknown): ContactFormValues | null {
	if (typeof input !== "object" || input === null) return null;

	const record = input as Record<string, unknown>;
	const keys: (keyof ContactFormValues)[] = [
		"firstName",
		"lastName",
		"email",
		"message",
	];

	const values = {} as ContactFormValues;
	for (const key of keys) {
		const value = record[key];
		if (typeof value !== "string") return null;
		values[key] = value;
	}

	return values;
}
