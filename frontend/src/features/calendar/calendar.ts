import { Temporal } from '@js-temporal/polyfill';
export type LeapPolicy = 'feb28' | 'mar1';
export type Recurrence = 'none' | 'annual';
export function date(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error('Enter a real date as YYYY-MM-DD.');
    const d = Temporal.PlainDate.from(value, { overflow: 'reject' });
    if (d.year < 1)
        throw new Error('Choose a year from 0001 to 9999.');
    return d;
}
export function validateZone(zone: string) { try {
    Temporal.Now.zonedDateTimeISO(zone);
    return zone;
}
catch {
    throw new Error('Unsupported timezone. Choose an IANA zone such as Asia/Singapore.');
} }
export function today(zone: string) { return Temporal.Now.plainDateISO(validateZone(zone)).toString(); }
export function between(start: string, end: string, inclusive = false) { const days = date(start).until(date(end), { largestUnit: 'days' }).days; return inclusive ? days + (days < 0 ? -1 : 1) : days; }
export function occurrence(original: string, year: number, policy: LeapPolicy) {
    const d = date(original);
    if (d.month === 2 && d.day === 29 && !Temporal.PlainDate.from({ year, month: 1, day: 1 }).inLeapYear && policy === 'mar1')
        return Temporal.PlainDate.from({ year, month: 3, day: 1 });
    return d.with({ year }, { overflow: 'constrain' });
}
export function nextOccurrence(original: string, now: string, policy: LeapPolicy = 'feb28') {
    const d = date(now), first = date(original);
    if (Temporal.PlainDate.compare(first, d) > 0)
        return first.toString();
    const candidate = occurrence(original, d.year, policy);
    return (Temporal.PlainDate.compare(candidate, d) >= 0 ? candidate : occurrence(original, d.year + 1, policy)).toString();
}
export function calendarPeriod(original: string, now: string) {
    const start = date(original), end = date(now);
    if (Temporal.PlainDate.compare(start, end) > 0)
        throw new Error('The original date cannot be in the future.');
    // Constrain each calendar addition explicitly so month-end periods remain reversible.
    let years = end.year - start.year;
    if (Temporal.PlainDate.compare(start.add({ years }), end) > 0)
        years--;
    const afterYears = start.add({ years });
    let months = (end.year - afterYears.year) * 12 + end.month - afterYears.month;
    if (Temporal.PlainDate.compare(afterYears.add({ months }), end) > 0)
        months--;
    const days = afterYears.add({ months }).until(end).days;
    return { years, months, days, totalDays: between(original, now) };
}
export function millisecondsToMidnight(zone: string, instant = Temporal.Now.instant()) {
    const z = instant.toZonedDateTimeISO(zone);
    const next = z.toPlainDate().add({ days: 1 }).toZonedDateTime(zone);
    return Math.max(1, next.epochMilliseconds - instant.epochMilliseconds);
}
export function dayLabel(target: string, now: string) { const n = between(now, target); return n === 0 ? 'Today' : `${Math.abs(n).toLocaleString()} days ${n > 0 ? 'until' : 'ago'}`; }
