export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  return `${Math.round(minutes / 60)} hr`;
}
