"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Radio, UserCircle2 } from "lucide-react";

const hiddenRoutes = ["/challenge", "/login", "/privacy", "/terms"];

export function MobileBottomCTA() {
  const pathname = usePathname();

  if (hiddenRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  const primaryHref = pathname === "/" || pathname === "/challenge" ? "#generator" : "/challenge";
  const primaryLabel = pathname === "/challenge" ? "Spin mission" : "Generate mission";

  return (
    <nav
      aria-label="Mobile quick actions"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.35rem] border border-white/10 bg-[#070816]/88 p-2 shadow-[0_18px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:hidden"
    >
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Link
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#f72585,#7c3aed,#00d4ff)] px-4 text-sm font-black text-white shadow-[0_0_34px_rgba(0,212,255,0.26)] active:scale-[0.98]"
          href={primaryHref}
        >
          <Radio aria-hidden="true" size={18} />
          {primaryLabel}
        </Link>
        <Link
          aria-label="Open daily mission"
          className="inline-flex size-14 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10 text-lime-100 active:scale-[0.98]"
          href="/daily"
        >
          <Flame aria-hidden="true" size={20} />
        </Link>
        <Link
          aria-label="Open profile"
          className="inline-flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white active:scale-[0.98]"
          href="/profile"
        >
          <UserCircle2 aria-hidden="true" size={20} />
        </Link>
      </div>
    </nav>
  );
}
