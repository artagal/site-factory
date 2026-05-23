"use client";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-white px-4 py-3 text-sm font-black text-black shadow-2xl">
      {message}
    </div>
  );
}
