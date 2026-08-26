import { availabilityDateMillis, normalizeAvailableDays, normalizeAvailabilityTimeZone } from "./availability";

type ListingInput = Record<string, unknown>;

type ListingInputResult =
  | { input: ListingInput; error?: never }
  | { input?: never; error: string };

const DATE_FIELDS = ["availableFrom", "availableUntil"] as const;

function numberText(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function slotLabels(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 8)
    : [];
}

/** Extra presentation fields keep optional numbers and date defaults lossless in native forms. */
export function partnerListingEditorFields(listing: ListingInput) {
  return {
    availableFromMillis: availabilityDateMillis(listing.availableFrom) ?? 0,
    availableUntilMillis: availabilityDateMillis(listing.availableUntil) ?? 0,
    categoryId: Array.isArray(listing.categoryIds) ? String(listing.categoryIds[0] ?? "") : "",
    originalPriceText: numberText(listing.originalPrice),
    priceText: numberText(listing.price),
    remainingSpotsText: numberText(listing.remainingSpots)
  };
}

/** Omitted fields retain existing values; only the route's explicit allowlist is persisted. */
export function normalizePartnerListingInput(
  body: ListingInput,
  existing: ListingInput | undefined,
  options: { now?: number; timeZone?: string } = {}
): ListingInputResult {
  const input: ListingInput = { ...existing, ...body };
  if (!existing && input.shortDescription == null) input.shortDescription = input.description;
  if (typeof body.primaryCategoryId === "string") {
    const primary = body.primaryCategoryId.trim();
    const secondary = Array.isArray(existing?.categoryIds) ? existing.categoryIds.slice(1) : [];
    input.categoryIds = primary ? [primary, ...secondary.filter((id) => id !== primary)].slice(0, 4) : [];
  }
  const numericFields = [
    { key: "price", label: "Deal price", min: 0, max: 10000, optional: false, integer: false },
    { key: "originalPrice", label: "Original price", min: 0, max: 10000, optional: true, integer: false },
    { key: "remainingSpots", label: "Spots left", min: 0, max: 500, optional: true, integer: true },
    { key: "capacity", label: "Capacity", min: 1, max: 500, optional: true, integer: true },
    { key: "durationMinutes", label: "Duration", min: 15, max: 720, optional: true, integer: true }
  ];

  for (const { key, label, min, max, optional, integer } of numericFields) {
    const raw = input[key];
    const empty = raw == null || (typeof raw === "string" && !raw.trim());
    if (empty && optional) continue;
    const value = typeof raw === "number" || typeof raw === "string" ? Number(raw) : NaN;
    if (empty || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      return { error: `${label} must be ${integer ? "a whole number" : "a number"} between ${min} and ${max}.` };
    }
  }

  for (const field of DATE_FIELDS) {
    const millisField = `${field}Millis`;
    const rawMillis = body[millisField];
    // Native optional DateTime values serialize as zero until the user chooses a date.
    if (rawMillis !== undefined && rawMillis !== null && rawMillis !== 0) {
      if (typeof rawMillis !== "number" || !Number.isSafeInteger(rawMillis) || rawMillis <= 0 || rawMillis > 8.64e15) {
        return { error: "Choose a valid start and end date." };
      }
      input[field] = new Date(rawMillis).toISOString();
    }
    const raw = input[field];
    if (raw == null || raw === "") {
      input[field] = null;
    } else if (availabilityDateMillis(raw) === null) {
      return { error: "Choose a valid start and end date." };
    }
  }

  const startsAt = availabilityDateMillis(input.availableFrom);
  const endsAt = availabilityDateMillis(input.availableUntil);
  const startChanged = startsAt !== availabilityDateMillis(existing?.availableFrom);
  if (startsAt !== null && endsAt !== null && endsAt <= startsAt) {
    return { error: "The end date must be after the start date." };
  }
  if (body.requireAvailabilityWindow === true && body.saveMode !== "draft") {
    if (startsAt === null || endsAt === null) {
      return { error: "Choose a start and end date before submitting this deal." };
    }
    if (endsAt <= (options.now ?? Date.now())) {
      return { error: "This deal has expired. Choose a future availability window." };
    }
  }

  const previousSlots = slotLabels(existing?.availableSlots);
  const explicitSlot = typeof body.availableSlot === "string" ? body.availableSlot.trim().slice(0, 80) : "";
  const nextSlots = explicitSlot && explicitSlot !== previousSlots[0] ? [explicitSlot] : slotLabels(input.availableSlots);
  const slotsChanged = nextSlots.length !== previousSlots.length || nextSlots.some((slot, index) => slot !== previousSlots[index]);
  if (existing && slotsChanged && !startChanged && (startsAt !== null || endsAt !== null)) {
    return { error: "Change the start and end dates to reschedule a dated offer, not just its time label." };
  }
  // The web editor echoes only the first slot even when the saved schedule has several.
  delete input.availableSlot;
  input.availableSlots = nextSlots;
  if (!existing || !Array.isArray(existing.availableDays) || slotsChanged || body.availableDays !== undefined) {
    const explicitDays = Array.isArray(body.availableDays)
      ? body.availableDays.filter((day): day is string => typeof day === "string")
      : [];
    input.availableDays = normalizeAvailableDays(explicitDays, nextSlots);
  }

  if (startChanged && startsAt !== null) {
    input.availableSlot = new Intl.DateTimeFormat("en-US", {
      timeZone: normalizeAvailabilityTimeZone(options.timeZone),
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(new Date(startsAt));
    // A changed one-off window must not retain a previous recurring day filter.
    input.availableDays = [];
  }

  return { input };
}
