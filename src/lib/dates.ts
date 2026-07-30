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
	return timeFormat
		.format(date)
		.replace(":00", "")
		.replace(/\s/g, "")
		.toLowerCase();
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

/* -------------------------------------------------------------------------- */
/* Whole days                                                                  */
/* -------------------------------------------------------------------------- */

const DAY_MS = 86_400_000;

const partsFormat = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	hour12: false,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});

/** London's offset from UTC, in milliseconds, at a given instant. */
function offset(utcMs: number): number {
	const parts = partsFormat.formatToParts(new Date(utcMs));
	const part = (type: string) =>
		Number(parts.find((piece) => piece.type === type)?.value);

	/* `hour12: false` renders midnight as "24" in some ICU builds. */
	const asIfUtc = Date.UTC(
		part("year"),
		part("month") - 1,
		part("day"),
		part("hour") % 24,
		part("minute"),
		part("second"),
	);

	return asIfUtc - utcMs;
}

/**
 * The instants a London day opens and closes.
 *
 * Prismic Date fields are a bare "YYYY-MM-DD" — no time, no zone. A notice
 * running until Sunday the 16th has to survive that Sunday, so it closes at
 * London midnight rather than UTC midnight: through the summer those are an
 * hour apart, and taking the UTC one would pull a "we're not meeting" warning
 * down while people were still deciding whether to set off.
 */
function startOfDay(iso: string): number {
	const utc = Date.parse(`${iso}T00:00:00Z`);
	if (Number.isNaN(utc)) return Number.NaN;

	/* Midnight opening the day, read as though London were UTC, then pushed
	   back by whatever London's offset is at that point in the year. */
	return utc - offset(utc);
}

/** Midnight opening the following day — so the end day is itself included. */
function endOfDay(iso: string): number {
	const utc = Date.parse(`${iso}T00:00:00Z`);
	if (Number.isNaN(utc)) return Number.NaN;

	const next = utc + DAY_MS;
	return next - offset(next);
}

/**
 * Whether `now` falls inside a window of whole days. Both ends are optional:
 * no start means "from now", no end means "until someone takes it down".
 *
 * Both days are inclusive — a window of 1 to 16 August covers all of the 1st
 * and all of the 16th.
 *
 * An unparseable bound is ignored rather than treated as closed. A notice
 * whose end date is somehow malformed staying up too long is recoverable; one
 * that silently refuses to appear is the failure nobody notices.
 */
export function isWithinWindow(
	startsAt: string | null | undefined,
	endsAt: string | null | undefined,
	now: number,
): boolean {
	if (startsAt) {
		const opens = startOfDay(startsAt);
		if (!Number.isNaN(opens) && now < opens) return false;
	}

	if (endsAt) {
		const closes = endOfDay(endsAt);
		if (!Number.isNaN(closes) && now >= closes) return false;
	}

	return true;
}
