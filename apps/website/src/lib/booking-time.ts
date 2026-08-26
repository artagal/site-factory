/** Convert partner display times to the API's 24-hour HH:mm contract. */
export function toBookingTime(value: string) {
  const match = /(?:^|\s)(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(value.trim());
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toLowerCase();
  if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23)) return "";
  if (period) hour = hour % 12 + (period === "pm" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
