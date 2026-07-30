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

const listFormat = new Intl.ListFormat(LOCALE, {
	style: "long",
	type: "conjunction",
});

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
 * The instant a London day runs out.
 *
 * Prismic Date fields are a bare "YYYY-MM-DD" — no time, no zone. A notice
 * about Sunday the 16th has to survive that Sunday, so it expires at London
 * midnight rather than UTC midnight: through the summer those are an hour
 * apart, and taking the UTC one would pull a "we're not meeting" warning down
 * while people were still deciding whether to set off.
 */
function endOfDay(iso: string): number {
	const startUtc = Date.parse(`${iso}T00:00:00Z`);
	if (Number.isNaN(startUtc)) return Number.NaN;

	/* Midnight opening the next day, read as though London were UTC, then
	   pushed back by whatever London's offset is at that point in the year. */
	const nextMidnight = startUtc + DAY_MS;
	return nextMidnight - offset(nextMidnight);
}

const weekdayFormat = new Intl.DateTimeFormat(LOCALE, {
	weekday: "long",
	timeZone: TIME_ZONE,
});

const dayNumberFormat = new Intl.DateTimeFormat(LOCALE, {
	day: "numeric",
	timeZone: TIME_ZONE,
});

const monthFormat = new Intl.DateTimeFormat(LOCALE, {
	month: "long",
	timeZone: TIME_ZONE,
});

/**
 * Formats the days a notice still applies to — "Sundays 9 and 16 August".
 *
 * Days already behind us are dropped, so a notice covering two Sundays stops
 * naming the first one once it has gone. An empty string means every day has
 * passed, and that is what retires the notice: expiry is derived from the list
 * rather than held in a separate "hide after" field that could fall out of
 * step with it.
 *
 * A shared weekday or month is said once. "Sunday 9 August and Sunday 16
 * August" is the same fact twice over and, in a notice that has to read as one
 * line, the repetition is what pushes it onto two. Anything the days do not
 * have in common is still spelled out per day, so the short form never costs
 * clarity:
 *
 *   same weekday, same month   Sundays 9 and 16 August
 *   same month only            Sunday 9 and Monday 17 August
 *   neither                    Sunday 9 August and Sunday 6 September
 */
export function formatNoticeDates(
	dates: readonly (string | null | undefined)[],
	now: number,
): string {
	const days = dates
		.filter((date): date is string => Boolean(date))
		.map((date) => ({ date, ends: endOfDay(date) }))
		.filter(({ ends }) => !Number.isNaN(ends) && ends > now)
		.sort((a, b) => a.ends - b.ends)
		/* Read from midday so no offset can round a label back onto the day
		   before. */
		.map(({ date }) => new Date(`${date}T12:00:00Z`))
		.map((day) => ({
			weekday: weekdayFormat.format(day),
			number: dayNumberFormat.format(day),
			month: monthFormat.format(day),
		}));

	const first = days[0];
	if (!first) return "";

	if (days.length === 1) {
		return `${first.weekday} ${first.number} ${first.month}`;
	}

	const sameMonth = days.every((day) => day.month === first.month);
	const sameWeekday = days.every((day) => day.weekday === first.weekday);

	/* English pluralises every weekday with a bare "s". */
	if (sameMonth && sameWeekday) {
		const numbers = listFormat.format(days.map((day) => day.number));
		return `${first.weekday}s ${numbers} ${first.month}`;
	}

	if (sameMonth) {
		const labels = days.map((day) => `${day.weekday} ${day.number}`);
		return `${listFormat.format(labels)} ${first.month}`;
	}

	return listFormat.format(
		days.map((day) => `${day.weekday} ${day.number} ${day.month}`),
	);
}
