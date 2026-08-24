import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ...(details ?? {}),
      error: message,
      ok: false
    },
    { status }
  );
}

export function jsonOk<T extends Record<string, unknown>>(payload: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      ...payload
    },
    { status }
  );
}
