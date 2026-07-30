import { PrismicProse } from "@/components/prismic/rich-text";
import { Notice } from "@/components/ui/notice";
import { formatNoticeDates } from "@/lib/dates";
import type { SiteNoticeContent } from "@/lib/settings";

export interface SiteNoticeProps {
	notice: SiteNoticeContent | null;
	/** Milliseconds since the epoch, stamped by the layout. */
	now: number;
}

/**
 * The site-wide notice, if there is one that still applies.
 *
 * `now` arrives as a prop rather than being read here, for the same reason
 * slices take it from context: the component stays a pure function of its
 * props, and the whole render agrees on what "now" is.
 *
 * The filter runs on the server, so it is only as fresh as the cached page.
 * The Prismic webhook busts the cache when an editor changes the notice, but
 * nothing busts it when a date simply passes — the hourly `revalidate` on the
 * page routes is what eventually takes an expired notice down. Same trade as
 * the EventList slice; see src/app/[uid]/page.tsx.
 */
export function SiteNotice({ notice, now }: SiteNoticeProps) {
	if (!notice) return null;

	/* Empty once every date is behind us — that is the expiry. */
	const when = formatNoticeDates(notice.dates, now);
	if (!when) return null;

	return (
		<Notice title={notice.title} when={when}>
			<PrismicProse field={notice.body} tone="accent" />
		</Notice>
	);
}
