import { PrismicInline, hasContent } from "@/components/prismic/rich-text";
import { Notice } from "@/components/ui/notice";
import { isWithinWindow } from "@/lib/dates";
import type { SiteNoticeContent } from "@/lib/settings";

export interface SiteNoticeProps {
	notice: SiteNoticeContent | null;
	/** Milliseconds since the epoch, stamped by the layout. */
	now: number;
}

/**
 * The site-wide notice, if one is currently showing.
 *
 * `now` arrives as a prop rather than being read here, for the same reason
 * slices take it from context: the component stays a pure function of its
 * props, and the whole render agrees on what "now" is.
 *
 * The window is checked on the server, so it is only as fresh as the cached
 * page. The Prismic webhook busts the cache when an editor changes the notice,
 * but nothing busts it when a date simply passes — the hourly `revalidate` on
 * the page routes is what eventually brings a notice up or takes it down. Same
 * trade as the EventList slice; see src/app/[uid]/page.tsx.
 */
export function SiteNotice({ notice, now }: SiteNoticeProps) {
	if (!notice) return null;

	/* Checked here rather than left to PrismicInline: that returns null for an
	   empty field, which inside the band would leave a stripe of colour across
	   every page with nothing written in it. */
	if (!hasContent(notice.text)) return null;

	if (!isWithinWindow(notice.startsAt, notice.endsAt, now)) return null;

	return (
		<Notice>
			<PrismicInline field={notice.text} />
		</Notice>
	);
}
