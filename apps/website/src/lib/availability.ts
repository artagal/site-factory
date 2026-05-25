const CANONICAL_DAYS = ["today", "tonight", "tomorrow", "weekend"] as const;
type CanonicalDay = typeof CANONICAL_DAYS[number];

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
