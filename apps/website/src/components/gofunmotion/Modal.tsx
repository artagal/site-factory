"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  children,
  onClose,
  open
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-white/10 bg-[#10122f] p-5 shadow-[0_24px_120px_rgba(0,0,0,0.55)]">
        <button
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
