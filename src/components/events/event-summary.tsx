import type { Content } from "@prismicio/client";

import { EventTitle } from "@/components/events/event-title";
import { Reveal } from "@/components/motion/reveal";
import { PrismicMedia } from "@/components/prismic/media";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatEventDate } from "@/lib/dates";
import { eventHref } from "@/lib/events";

export interface EventSummaryProps {
	event: Content.EventDocument;
}

/**
 * An event as one item on What's On.
 *
 * Deliberately shaped like the Feature slices it sits among — poster beside
 * text, heading, a line or two, one button — because it is one of the things
 * going on, not an announcement bolted to the top of the page. Same `Section`
 * spacing and the same grid, so the rhythm of the page doesn't break where the
 * automatic content starts.
 *
 * It carries the date, the place and the summary, and stops there. The facts
 * people scan for and the sign-up link live on the event's own page, which is
 * where the button goes; repeating the closing date in two places is how the
 * two end up disagreeing.
 */
export function EventSummary({ event }: EventSummaryProps) {
	const data = event.data;

	const when = formatEventDate(data.starts_at, data.ends_at);
	const hasPoster = Boolean(data.image?.url);

	return (
		<Section spacing="md">
			<Container>
				<Reveal>
					<div
						className={cn(
							"grid items-center gap-8 sm:gap-12",
							hasPoster && "sm:grid-cols-2",
						)}
					>
						{hasPoster ? (
							/*
							 * Capped rather than filling its column. The poster
							 * is portrait and the Feature images beside it are
							 * landscape, so at full column width it would stand
							 * roughly twice as tall as anything else on the
							 * page and turn a summary into the loudest thing
							 * here.
							 *
							 * `auto` and a hairline for the same reasons as the
							 * event's own page — a flyer carries its wording at
							 * its edges, and it is laid out on white against a
							 * warm off-white page.
							 *
							 * 24rem off the spacing scale, not `max-w-sm`:
							 * Tailwind's named container widths are cleared in
							 * tokens.layout.css, so those classes emit nothing
							 * at all and the cap silently does not happen.
							 */
							<div className="mx-auto w-full max-w-96">
								<PrismicMedia
									field={data.image}
									ratio="auto"
									sizes="(min-width: 750px) 24rem, 100vw"
									className="border border-line"
								/>
							</div>
						) : null}

						<div>
							{when ? (
								<Text size="overline" tone="accent">
									{when}
								</Text>
							) : null}

							<Heading
								as="h2"
								size="h2"
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
								<Text className="mt-5">{data.summary}</Text>
							) : null}

							<div className="mt-8">
								<Button href={eventHref(event)}>
									{/* Named, not "Find out more": the link is
									    one of several buttons on this page and
									    the label is what tells them apart in a
									    screen reader's list of links. */}
									Full details
								</Button>
							</div>
						</div>
					</div>
				</Reveal>
			</Container>
		</Section>
	);
}
