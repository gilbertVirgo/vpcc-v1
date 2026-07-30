import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";

import {
	Heading,
	type HeadingProps,
	Prose,
	type ProseProps,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";

/*
 * The bridge between Prismic rich text and the design system.
 *
 * Without this, every slice would invent its own mapping and headings would
 * drift out of the type scale one slice at a time. Editors get a fixed set of
 * blocks; this decides what each one becomes.
 */

/** Body copy: `Prose` already styles bare elements, so the defaults stand. */
const bodySerializer: JSXMapSerializer = {
	hyperlink: ({ node, children, key }) => (
		<PrismicNextLink key={key} field={node.data}>
			{children}
		</PrismicNextLink>
	),
};

export interface PrismicProseProps {
	field: RichTextField | null | undefined;
	tone?: ProseProps["tone"];
	className?: string;
}

/**
 * Renders a rich text field as body copy.
 *
 * Returns null for an empty field so a slice never leaves an empty element
 * taking up vertical rhythm.
 */
export function PrismicProse({ field, tone, className }: PrismicProseProps) {
	if (!hasContent(field)) return null;

	return (
		<Prose tone={tone} className={className}>
			<PrismicRichText field={field} components={bodySerializer} />
		</Prose>
	);
}

/*
 * Body copy with the block structure flattened away.
 *
 * Paragraphs become spans so the text can sit mid-sentence in a single line.
 * The trailing space is what keeps two paragraphs from running together into
 * one word — an editor writing a second one gets a sentence break rather than
 * "…on 23 August.Midweek groups…". Whitespace collapses, so the one after the
 * last paragraph costs nothing.
 */
const inlineSerializer: JSXMapSerializer = {
	paragraph: ({ children, key }) => <span key={key}>{children} </span>,
	/*
	 * The underline takes the text's own colour, not `line-strong`.
	 *
	 * Inline copy sits in a sentence its caller has coloured, so a link here
	 * has no colour of its own to be told apart by — the underline is the whole
	 * affordance. `line-strong` is a light-surface line and reaches 1.47:1 on
	 * the notice band, which is not an affordance at all. `decoration-current`
	 * is always exactly as visible as the words it belongs to.
	 */
	hyperlink: ({ node, children, key }) => (
		<PrismicNextLink
			key={key}
			field={node.data}
			className="underline decoration-current underline-offset-4 hover:decoration-2"
		>
			{children}
		</PrismicNextLink>
	),
};

export interface PrismicInlineProps {
	field: RichTextField | null | undefined;
}

/**
 * Renders a rich text field as inline copy, for a caller that supplies its own
 * sentence around it. Carries no colour of its own — it inherits from whatever
 * it is dropped into.
 */
export function PrismicInline({ field }: PrismicInlineProps) {
	if (!hasContent(field)) return null;

	return <PrismicRichText field={field} components={inlineSerializer} />;
}

export interface PrismicHeadingProps {
	field: RichTextField | null | undefined;
	as?: HeadingProps["as"];
	size?: HeadingProps["size"];
	tone?: HeadingProps["tone"];
	className?: string;
}

/**
 * Renders a single-block rich text field as a heading.
 *
 * Heading fields in the model are restricted to one block, so every block maps
 * to the same element and size — the level is chosen by the slice for the
 * document outline, not by which heading button the editor happened to press.
 */
export function PrismicHeading({
	field,
	as = "h2",
	size = "h2",
	tone,
	className,
}: PrismicHeadingProps) {
	if (!hasContent(field)) return null;

	const serializer: JSXMapSerializer = {
		heading1: ({ children, key }) => (
			<Heading
				key={key}
				as={as}
				size={size}
				tone={tone}
				className={className}
			>
				{children}
			</Heading>
		),
		heading2: ({ children, key }) => (
			<Heading
				key={key}
				as={as}
				size={size}
				tone={tone}
				className={className}
			>
				{children}
			</Heading>
		),
		heading3: ({ children, key }) => (
			<Heading
				key={key}
				as={as}
				size={size}
				tone={tone}
				className={className}
			>
				{children}
			</Heading>
		),
		paragraph: ({ children, key }) => (
			<Heading
				key={key}
				as={as}
				size={size}
				tone={tone}
				className={className}
			>
				{children}
			</Heading>
		),
		/* Ported from the old site: part of a heading set apart from the rest.
		   It was a serif there; here it is a weight shift within Area Inktrap. */
		em: ({ children, key }) => (
			<span key={key} className="font-accent not-italic">
				{children}
			</span>
		),
	};

	return <PrismicRichText field={field} components={serializer} />;
}

/**
 * True when a rich text field has anything worth rendering.
 *
 * Prismic returns `[{ type: "paragraph", text: "", spans: [] }]` for a field an
 * editor has touched and cleared, which is truthy and would otherwise render an
 * empty block.
 */
export function hasContent(field: RichTextField | null | undefined): boolean {
	if (!field || field.length === 0) return false;

	return field.some((block) => {
		if ("text" in block) return block.text.trim().length > 0;
		return true; // images and embeds have no text but are still content
	});
}

/** Shared wrapper so every slice gets consistent slice-zone data attributes. */
export function sliceAttributes(slice: {
	slice_type: string;
	variation: string;
}) {
	return {
		"data-slice-type": slice.slice_type,
		"data-slice-variation": slice.variation,
	};
}

export { cn };
