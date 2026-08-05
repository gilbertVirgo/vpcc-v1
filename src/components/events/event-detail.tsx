import type { Content } from "@prismicio/client";

import { Reveal } from "@/components/motion/reveal";
import { linkHref } from "@/components/prismic/link";
import { PrismicMedia } from "@/components/prismic/media";
import { PrismicProse } from "@/components/prismic/rich-text";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { Accent, Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatEventDate } from "@/lib/dates";

export interface EventDetailProps {
	event: Content.EventDocument;
	/** Milliseconds since the epoch, stamped by the page. See slices/context.ts. */
	now: number;
	/**
	 * `h1` on the event's own page, `h2` where the events index stacks several.
	 * Level and size move together here — an event heading is the biggest thing
	 * in its block either way.
	 */
	as?: "h1" | "h2";
	/** Set on the first event on the page only. See slices/context.ts. */
	priority?: boolean;
}

/**
 * One event, in full.
 *
 * Shared by `/events` and `/events/[uid]` so the two can't drift: the index is
 * the page people are sent to, the per-event URL is the one they share, and an
 * event that reads differently depending on which link you followed is a bug
 * nobody would think to look for.
 *
 * Everything the poster says is repeated here as real text. That is not
 * duplication for its own sake — the poster is an image, so its wording reaches
 * neither a screen reader nor a search engine, and it is the only copy of the
 * closing date until someone retypes it.
 */
export function EventDetail({
	event,
	now,
	as = "h2",
	priority = false,
}: EventDetailProps) {
	const data = event.data;

	const when = formatEventDate(data.starts_at, data.ends_at);
	const details = data.details.filter(
		(row) => row.label?.trim() || row.value?.length,
	);

	/*
	 * The button goes before the event does.
	 *
	 * Sign-up almost always closes ahead of the thing itself — a competition
	 * takes entries in August and gives out prizes in September — and for the
	 * fortnight in between, a page still offering a live entry form is worse
	 * than one offering nothing: somebody fills it in and finds out later.
	 *
	 * Empty means the button stands as long as the event does, which is right
	 * for anything you can just turn up to.
	 */
	const href = isCtaOpen(data.cta_expires_at, now)
		? linkHref(data.cta_link)
		: undefined;

	const hasPoster = Boolean(data.image?.url);

	return (
		<Section spacing="md">
			{/*
			 * Two columns beside a poster, one measure-width column without one.
			 * Keeping the grid either way would leave an event with no poster
			 * set in half the page against an empty right-hand column, and
			 * dropping to one full-width column instead would run the prose to
			 * 1248px. Same arrangement as the Feature slice.
			 */}
			<Container size={hasPoster ? "default" : "text"}>
				<Reveal>
					<div
						className={cn(
							"grid items-start gap-10 sm:gap-14",
							hasPoster && "sm:grid-cols-2",
						)}
					>
						{hasPoster ? (
							/*
							 * `auto`, not a fixed ratio: a poster carries its
							 * wording at its edges and any crop takes some of
							 * it off.
							 *
							 * The hairline is what makes it an object rather
							 * than a patch. Posters are laid out on white and
							 * `surface` is a warm off-white, so an unframed one
							 * reads as a slightly wrong rectangle — visible,
							 * but not visibly deliberate. A border says it is a
							 * separate thing on purpose, and costs nothing on
							 * artwork that already sits on the page colour.
							 * Depth is a hairline here, never a shadow.
							 */
							<PrismicMedia
								field={data.image}
								ratio="auto"
								sizes="(min-width: 750px) 50vw, 100vw"
								priority={priority}
								className="border border-line"
							/>
						) : null}

						<div>
							{when ? (
								<Text size="overline" tone="accent">
									{when}
								</Text>
							) : null}

							<Heading
								as={as}
								size={as === "h1" ? "h1" : "h2"}
								className={when ? "mt-3" : ""}
							>
								<EventTitle title={data.title} />
							</Heading>

							{data.location ? (
								<Text size="sm" tone="muted" className="mt-3">
									{data.location}
								</Text>
							) : null}

							{data.summary ? (
								<Text
									size="lg"
									tone="secondary"
									className="mt-6"
								>
									{data.summary}
								</Text>
							) : null}

							{details.length > 0 ? (
								<dl className="mt-8 border-t border-line">
									{details.map((row, index) => (
										<div
											key={index}
											className="grid gap-1 border-b border-line py-4 xs:grid-cols-[9rem_1fr] xs:gap-6"
										>
											<dt>
												<Text
													size="overline"
													tone="muted"
													as="span"
												>
													{row.label}
												</Text>
											</dt>
											<dd>
												<PrismicProse
													field={row.value}
												/>
											</dd>
										</div>
									))}
								</dl>
							) : null}

							<PrismicProse field={data.body} className="mt-8" />

							{href && data.cta_label?.trim() ? (
								<div className="mt-10">
									<Button href={href} size="lg">
										{data.cta_label}
									</Button>
								</div>
							) : null}
						</div>
					</div>
				</Reveal>
			</Container>
		</Section>
	);
}

/**
 * Whether the call to action is still worth offering.
 *
 * An unparseable timestamp leaves it open, matching `isEventLive`: a sign-up
 * link that outstays its welcome is recoverable, one that silently vanishes is
 * the failure nobody notices.
 */
function isCtaOpen(closesAt: string | null | undefined, now: number): boolean {
	if (!closesAt) return true;

	const at = new Date(closesAt).getTime();
	return Number.isNaN(at) ? true : at > now;
}

/**
 * "Photo Competition: Hope in East London" — the part after the colon set apart
 * at weight 500 against the heading's 700.
 *
 * The previous site's two-tone headings, reproduced without a second typeface;
 * see `Accent`. A title with no colon is left alone, so this is a bonus for
 * titles shaped to take it rather than a rule editors have to know about.
 */
function EventTitle({ title }: { title: string | null }) {
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
