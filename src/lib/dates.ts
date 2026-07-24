/*
 * Date formatting.
 *
 * The timezone is pinned to Europe/London. Netlify's functions run in UTC, so
 * without it a 7pm event in British Summer Time would render as 6pm for
 * everyone — the kind of bug nobody notices until someone arrives an hour early.
 */

const TIME_ZONE = "Europe/London";
const LOCALE = "en-GB";

const dayFormat = new Intl.DateTimeFormat(LOCALE, {
	weekday: "long",
	day: "numeric",
	month: "long",
	timeZone: TIME_ZONE,
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
	timeZone: TIME_ZONE,
});

function parse(value: string | null | undefined): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a time, dropping ":00" so 7pm doesn't read as "7:00 pm". */
function time(date: Date): string {
	return timeFormat.format(date).replace(":00", "").replace(/\s/g, "").toLowerCase();
}

/**
 * "Sunday 3 May, 3–4:30pm".
 *
 * Returns an empty string when there is no start, so a caller can skip the
 * element entirely rather than render a stray separator.
 */
export function formatEventDate(
	startsAt: string | null | undefined,
	endsAt?: string | null | undefined,
): string {
	const start = parse(startsAt);
	if (!start) return "";

	const end = parse(endsAt);
	const day = dayFormat.format(start);

	if (!end) return `${day}, ${time(start)}`;

	/* An event that runs past midnight gets both dates; otherwise the end is
	   just a time on the same line. */
	const sameDay = dayFormat.format(end) === day;
	if (!sameDay) {
		return `${day}, ${time(start)} – ${dayFormat.format(end)}, ${time(end)}`;
	}

	return `${day}, ${time(start)}–${time(end)}`;
}
