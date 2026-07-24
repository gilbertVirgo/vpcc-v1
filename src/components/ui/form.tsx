"use client";

import { type VariantProps, cva } from "class-variance-authority";
import {
	type InputHTMLAttributes,
	type ReactNode,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	createContext,
	useContext,
	useId,
} from "react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Field context                                                               */
/* -------------------------------------------------------------------------- */

interface FieldContextValue {
	name: string;
	inputId: string;
	errorId: string;
	hintId: string;
	invalid: boolean;
	required: boolean;
	describedBy: string | undefined;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Controls read their wiring from context rather than taking a dozen aria
 * props, so a field cannot be assembled with a label pointing at nothing or an
 * error message no screen reader will announce.
 */
function useField(component: string): FieldContextValue {
	const context = useContext(FieldContext);
	if (!context) {
		throw new Error(`<${component}> must be rendered inside a <Field>.`);
	}
	return context;
}

/* -------------------------------------------------------------------------- */
/* Field                                                                       */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
	name: string;
	label: string;
	/** Supporting copy rendered under the label. */
	hint?: string;
	error?: string;
	required?: boolean;
	className?: string;
	children: ReactNode;
}

export function Field({
	name,
	label,
	hint,
	error,
	required = false,
	className,
	children,
}: FieldProps) {
	const uid = useId();
	const inputId = `${uid}-${name}`;
	const errorId = `${inputId}-error`;
	const hintId = `${inputId}-hint`;
	const invalid = Boolean(error);

	const describedBy =
		[hint ? hintId : null, invalid ? errorId : null]
			.filter(Boolean)
			.join(" ") || undefined;

	return (
		<FieldContext.Provider
			value={{ name, inputId, errorId, hintId, invalid, required, describedBy }}
		>
			<div className={cn("flex flex-col gap-2", className)}>
				<label
					htmlFor={inputId}
					className="text-body-sm font-bold text-ink"
				>
					{label}
					{required ? null : (
						<span className="text-ink-muted font-medium">
							{" "}
							(optional)
						</span>
					)}
				</label>

				{hint ? (
					<p id={hintId} className="text-caption text-ink-muted">
						{hint}
					</p>
				) : null}

				{children}

				{/*
				  Always rendered, so the live region exists in the accessibility
				  tree before it has anything to say. A region inserted at the
				  moment of the error is frequently not announced.
				*/}
				<p
					id={errorId}
					aria-live="polite"
					className={cn(
						"text-caption text-danger",
						invalid ? "" : "hidden",
					)}
				>
					{error}
				</p>
			</div>
		</FieldContext.Provider>
	);
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                    */
/* -------------------------------------------------------------------------- */

const control = cva(
	[
		"w-full rounded-md border bg-surface-raised",
		"px-4 py-3 text-body text-ink",
		"placeholder:text-ink-muted",
		"transition-[border-color,background-color] duration-fast ease-standard",
		"disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-sunken",
	],
	{
		variants: {
			invalid: {
				true: "border-danger",
				false: "border-line-strong hover:border-ink-muted",
			},
		},
		defaultVariants: { invalid: false },
	},
);

type ControlVariants = VariantProps<typeof control>;

export type InputProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"id" | "name" | "required" | "aria-invalid" | "aria-describedby"
> &
	Omit<ControlVariants, "invalid">;

export function Input({ className, ...props }: InputProps) {
	const field = useField("Input");

	return (
		<input
			id={field.inputId}
			name={field.name}
			required={field.required}
			aria-invalid={field.invalid || undefined}
			aria-describedby={field.describedBy}
			className={cn(control({ invalid: field.invalid }), className)}
			{...props}
		/>
	);
}

export type TextareaProps = Omit<
	TextareaHTMLAttributes<HTMLTextAreaElement>,
	"id" | "name" | "required" | "aria-invalid" | "aria-describedby"
>;

export function Textarea({ className, rows = 6, ...props }: TextareaProps) {
	const field = useField("Textarea");

	return (
		<textarea
			id={field.inputId}
			name={field.name}
			rows={rows}
			required={field.required}
			aria-invalid={field.invalid || undefined}
			aria-describedby={field.describedBy}
			className={cn(control({ invalid: field.invalid }), className)}
			{...props}
		/>
	);
}

export type SelectProps = Omit<
	SelectHTMLAttributes<HTMLSelectElement>,
	"id" | "name" | "required" | "aria-invalid" | "aria-describedby"
>;

export function Select({ className, children, ...props }: SelectProps) {
	const field = useField("Select");

	return (
		<select
			id={field.inputId}
			name={field.name}
			required={field.required}
			aria-invalid={field.invalid || undefined}
			aria-describedby={field.describedBy}
			className={cn(control({ invalid: field.invalid }), "pr-10", className)}
			{...props}
		>
			{children}
		</select>
	);
}

/* -------------------------------------------------------------------------- */
/* Checkbox / Radio                                                            */
/* -------------------------------------------------------------------------- */

export interface ToggleProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label: ReactNode;
	type?: "checkbox" | "radio";
}

/**
 * Self-labelling, so it sits outside <Field>. Uses the native control with
 * `accent-color` rather than a styled div: keyboard behaviour, forms
 * integration and assistive-tech semantics all come for free.
 */
export function Toggle({
	label,
	type = "checkbox",
	className,
	...props
}: ToggleProps) {
	const uid = useId();
	const id = props.id ?? uid;

	return (
		<div className={cn("flex items-start gap-3", className)}>
			<input
				{...props}
				id={id}
				type={type}
				className={cn(
					"mt-1 size-5 shrink-0 accent-[var(--color-accent)]",
					type === "checkbox" ? "rounded-sm" : "rounded-pill",
				)}
			/>
			<label htmlFor={id} className="text-body-sm text-ink-secondary">
				{label}
			</label>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Form status                                                                 */
/* -------------------------------------------------------------------------- */

export interface FormStatusProps {
	tone: "success" | "error";
	title: string;
	children?: ReactNode;
	className?: string;
}

/**
 * Inline outcome message. Deliberately not a modal: the previous site opened a
 * dialog and then navigated home, which threw away the page the visitor was
 * on and gave them nothing to act on.
 */
export function FormStatus({
	tone,
	title,
	children,
	className,
}: FormStatusProps) {
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			aria-live={tone === "error" ? "assertive" : "polite"}
			className={cn(
				"rounded-md border p-5",
				tone === "success"
					? "border-success bg-success-surface"
					: "border-danger bg-danger-surface",
				className,
			)}
		>
			<p className="text-body font-bold text-ink">{title}</p>
			{children ? (
				<div className="mt-2 text-body-sm text-ink-secondary">
					{children}
				</div>
			) : null}
		</div>
	);
}
