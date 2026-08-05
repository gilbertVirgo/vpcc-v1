import { Accent } from "@/components/ui/typography";

/**
 * "Photo Competition: Hope in East London" — the part after the colon set apart
 * at weight 500 against the heading's 700.
 *
 * The previous site's two-tone headings, reproduced without a second typeface;
 * see `Accent`. A title with no colon is left alone, so this is a bonus for
 * titles shaped to take it rather than a rule editors have to know about.
 *
 * Shared by the event's own page and the block on What's On, so an event reads
 * the same whichever one you land on first.
 */
export function EventTitle({ title }: { title: string | null }) {
	const text = title?.trim();
	if (!text) return null;

	const colon = text.indexOf(":");
	if (colon === -1 || colon === text.length - 1) return <>{text}</>;

	return (
		<>
			{text.slice(0, colon + 1)}{" "}
			<Accent>{text.slice(colon + 1).trim()}</Accent>
		</>
	);
}
