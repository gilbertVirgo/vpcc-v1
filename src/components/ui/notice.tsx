import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./layout";
import { Text } from "./typography";

/**
 * A band warning about a change to the ordinary run of things — a Sunday with
 * no service, a venue moved at short notice.
 *
 * One centred line on a pale accent wash, between hairlines. It reads before
 * the page does without competing with it: a full-strength `accent` field the
 * width of the viewport outweighs the h1 beneath it and clashes with the logo
 * and the nav button, which are the two places the brand orange is meant to
 * land. `accent-subtle` separates the band from the page; the words inside it
 * do the ranking.
 *
 * The emphasis is the editor's. A bold fragment takes `ink` against the line's
 * `ink-secondary`, which is the contrast the old fixed title used to carry —
 * so "**No Sunday service this week** — back on 23 August" reads the same way
 * it did when those were two separate fields, without the model insisting they
 * always are.
 *
 * Presentational and time-agnostic. Deciding whether a notice is currently
 * showing is the caller's job — see src/components/layout/site-notice.tsx.
 */
export interface NoticeProps {
	/** One line. Bold carries the emphasis; the caller supplies the wording. */
	children?: ReactNode;
	className?: string;
}

export function Notice({ children, className }: NoticeProps) {
	return (
		/*
		 * A landmark with a name, so a screen reader user who takes the skip
		 * link past it can still find it in the landmark list. The name is
		 * fixed now the title field has gone: a landmark label wants to be a
		 * short handle, and the notice's own sentence — the only other
		 * candidate — is a whole line of prose that is read out on entering
		 * the region anyway.
		 *
		 * Not a live region: it is server-rendered and present at load, so
		 * there is nothing to announce — an alert here would interrupt for
		 * content the reader is about to reach anyway.
		 */
		<aside
			aria-label="Notice"
			className={cn("border-y border-line bg-accent-subtle", className)}
		>
			<Container>
				<Text
					size="sm"
					tone="secondary"
					className="py-3 text-center [&_strong]:font-bold [&_strong]:text-ink"
				>
					{children}
				</Text>
			</Container>
		</aside>
	);
}
