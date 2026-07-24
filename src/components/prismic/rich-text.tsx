import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";

import { Heading, type HeadingProps, Prose } from "@/components/ui/typography";
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
	className?: string;
}

/**
 * Renders a rich text field as body copy.
 *
 * Returns null for an empty field so a slice never leaves an empty element
 * taking up vertical rhythm.
 */
export function PrismicProse({ field, className }: PrismicProseProps) {
	if (!hasContent(field)) return null;

	return (
		<Prose className={className}>
			<PrismicRichText field={field} components={bodySerializer} />
		</Prose>
	);
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
			<Heading key={key} as={as} size={size} tone={tone} className={className}>
				{children}
			</Heading>
		),
		heading2: ({ children, key }) => (
			<Heading key={key} as={as} size={size} tone={tone} className={className}>
				{children}
			</Heading>
		),
		heading3: ({ children, key }) => (
			<Heading key={key} as={as} size={size} tone={tone} className={className}>
				{children}
			</Heading>
		),
		paragraph: ({ children, key }) => (
			<Heading key={key} as={as} size={size} tone={tone} className={className}>
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
