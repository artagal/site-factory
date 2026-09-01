export function isDemoDataEnabled() {
  const override = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA?.trim().toLowerCase();

  if (override === "true") return true;
  if (override === "false") return false;
  return true;
}
