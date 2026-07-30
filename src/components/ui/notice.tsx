import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

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
 * Presentational and time-agnostic. Deciding whether a notice is currently
 * showing is the caller's job — see src/components/layout/site-notice.tsx.
 */
export interface NoticeProps {
	/** Short. It opens the sentence and names the landmark. */
	title: string;
	/**
	 * The rest of the sentence, following the title after a single space.
	 * It carries its own punctuation — nothing is inserted between the two.
	 */
	children?: ReactNode;
	className?: string;
}

export function Notice({ title, children, className }: NoticeProps) {
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
			className={cn("border-y border-line bg-accent-subtle", className)}
		>
			<Container>
				<Text size="sm" tone="secondary" className="py-3 text-center">
					<strong className="font-bold text-ink">{title}</strong>
					{children ? <> {children}</> : null}
				</Text>
			</Container>
		</aside>
	);
}
