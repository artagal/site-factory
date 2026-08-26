const CANONICAL_DAYS = ["today", "tonight", "tomorrow", "weekend"] as const;
type CanonicalDay = typeof CANONICAL_DAYS[number];

export function availabilityDateMillis(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) ? millis : null;
}

export function normalizeAvailabilityTimeZone(timeZone?: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: timeZone || "UTC" }).resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function cleanDay(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function addDay(days: Set<CanonicalDay>, day: CanonicalDay) {
  if (day === "tonight") days.add("today");
  days.add(day);
}

export function inferAvailableDaysFromText(values: string[]) {
  const days = new Set<CanonicalDay>();

  for (const raw of values) {
    const value = raw.toLowerCase();
    if (value.includes("tonight")) addDay(days, "tonight");
    if (value.includes("today")) addDay(days, "today");
    if (value.includes("tomorrow")) addDay(days, "tomorrow");
    if (value.includes("weekend") || value.includes("saturday") || value.includes("sunday")) addDay(days, "weekend");
  }

  return CANONICAL_DAYS.filter((day) => days.has(day));
}

export function normalizeAvailableDays(explicitDays: string[], slotLabels: string[]) {
  const normalized = new Set<CanonicalDay>();

  for (const day of explicitDays) {
    const next = cleanDay(day);
    if ((CANONICAL_DAYS as readonly string[]).includes(next)) {
      addDay(normalized, next as CanonicalDay);
    }
  }

  for (const day of inferAvailableDaysFromText(slotLabels)) {
    addDay(normalized, day);
  }

  return CANONICAL_DAYS.filter((day) => normalized.has(day));
}

export function resolveAvailableDays(
  listing: { availableDays: string[]; availableFrom: string | null; availableUntil: string | null },
  options: { now?: number; timeZone?: string } = {}
): string[] {
  if (!listing.availableFrom && !listing.availableUntil) return listing.availableDays;

  const startsAt = listing.availableFrom ? availabilityDateMillis(listing.availableFrom) : Number.NEGATIVE_INFINITY;
  const endsAt = listing.availableUntil ? availabilityDateMillis(listing.availableUntil) : Number.POSITIVE_INFINITY;
  const now = options.now ?? Date.now();
  if (startsAt === null || endsAt === null || endsAt <= Math.max(startsAt, now)) return [];

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeAvailabilityTimeZone(options.timeZone),
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23"
  });
  const localParts = (millis: number) => {
    const parts = formatter.formatToParts(millis);
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
    return { year: part("year"), month: part("month"), day: part("day"), hour: part("hour") };
  };
  const dayKey = (parts: { year: number; month: number; day: number }) => parts.year * 10000 + parts.month * 100 + parts.day;
  const today = localParts(now);
  // Advance local calendar dates, not elapsed 24-hour periods, across DST changes.
  const calendarDay = (offset: number) => new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
  const relativeDayKey = (offset: number) => {
    const date = calendarDay(offset);
    return dayKey({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
  };
  const firstDay = dayKey(localParts(Math.max(startsAt, now)));
  // Availability is half-open: an end at midnight does not include the next day.
  const last = Number.isFinite(endsAt) ? localParts(endsAt - 1) : null;
  const lastDay = last ? dayKey(last) : Number.POSITIVE_INFINITY;
  const overlaps = (first: number, last = first) => firstDay <= last && lastDay >= first;
  const days = new Set<CanonicalDay>();

  if (overlaps(dayKey(today))) {
    days.add("today");
    if (lastDay > dayKey(today) || (last && last.hour >= 18)) days.add("tonight");
  }
  if (overlaps(relativeDayKey(1))) days.add("tomorrow");
  const weekday = calendarDay(0).getUTCDay();
  const saturdayOffset = weekday === 0 ? -1 : 6 - weekday;
  if (overlaps(relativeDayKey(saturdayOffset), relativeDayKey(saturdayOffset + 1))) days.add("weekend");

  return CANONICAL_DAYS.filter((day) => days.has(day));
}
