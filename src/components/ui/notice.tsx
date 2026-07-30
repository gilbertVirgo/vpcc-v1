import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";
import { Container } from "./layout";
import { Text } from "./typography";

/**
 * A band warning about a change to the ordinary run of things — a Sunday with
 * no service, a venue moved at short notice.
 *
 * The accent fill is the loudest surface in the system, which is the point:
 * this has to be read by someone who came to the site for something else. The
 * orange is a fill only, never text — the label is `accent-contrast` at
 * 8.61:1. See docs/design-system.md.
 *
 * Presentational and time-agnostic. Deciding whether a notice still applies is
 * the caller's job — see src/components/layout/site-notice.tsx.
 */
export interface NoticeProps {
	/** Short — it names the landmark as well as heading the band. */
	title: string;
	/** The days this applies to, already formatted. */
	when?: string;
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
			className={cn("bg-accent text-accent-contrast", className)}
		>
			<Container>
				<div className="flex gap-4 py-5 sm:py-6">
					<Icon name="calendar" className="mt-0.5" />

					<div>
						<Text weight="bold" className="text-accent-contrast">
							{title}
						</Text>

						{when ? (
							<Text
								size="sm"
								weight="bold"
								className="mt-1 text-accent-contrast"
							>
								{when}
							</Text>
						) : null}

						{children ? <div className="mt-2">{children}</div> : null}
					</div>
				</div>
			</Container>
		</aside>
	);
}
