import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";
import { Container } from "./layout";
import { Text } from "./typography";

/**
 * A band warning about a change to the ordinary run of things — a Sunday with
 * no service, a venue moved at short notice.
 *
 * One centred sentence on a pale accent wash, between hairlines. It reads
 * before the page does without competing with it: a full-strength `accent`
 * field the width of the viewport outweighs the h1 beneath it and clashes with
 * the logo and the nav button, which are the two places the brand orange is
 * meant to land. `accent-subtle` separates the band from the page; the weight
 * and colour of the words inside it do the ranking.
 *
 * Presentational and time-agnostic. Deciding whether a notice still applies is
 * the caller's job — see src/components/layout/site-notice.tsx.
 */
export interface NoticeProps {
	/** Short. It leads the sentence and names the landmark. */
	title: string;
	/** The days this applies to, already formatted. Reads after "on". */
	when?: string;
	/** Inline detail, following an em dash. Keep it to a clause. */
	children?: ReactNode;
	className?: string;
}

export function Notice({ title, when, children, className }: NoticeProps) {
	return (
		/*
		 * A landmark with a name, so a screen reader user who takes the skip
		 * link past it can still find it in the landmark list. Not a live
		 * region: it is server-rendered and present at load, so there is
		 * nothing to announce — an alert here would interrupt for content the
		 * reader is about to reach anyway.
		 */
		<aside
			aria-label={title}
			className={cn("border-line border-y bg-accent-subtle", className)}
		>
			<Container>
				<Text size="sm" tone="secondary" className="py-3 text-center">
					{/*
					 * Inline rather than a flex sibling. Beside a centred block
					 * it would hang on its own in the left margin as soon as
					 * the sentence wrapped, which on a phone it always does.
					 * In the flow it travels with the first word.
					 */}
					<Icon
						name="calendar"
						className="mr-2 inline size-4 align-middle text-ink"
					/>
					<strong className="font-bold text-ink">{title}</strong>
					{when ? <> on <span className="text-ink">{when}</span></> : null}
					{children ? <> — {children}</> : null}
				</Text>
			</Container>
		</aside>
	);
}
