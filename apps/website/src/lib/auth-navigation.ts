export function safeAccountReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/profile";
  try {
    const parsed = new URL(value, "https://gofunmotion.com");
    if (parsed.origin !== "https://gofunmotion.com" || parsed.pathname === "/login") return "/profile";
    return parsed.pathname + parsed.search + parsed.hash;
  } catch { return "/profile"; }
}
