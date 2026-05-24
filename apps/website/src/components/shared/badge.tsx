import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-8 items-center rounded-full bg-white/[0.08] px-3 text-xs font-black uppercase tracking-[0.12em] text-white/68", className)}>
      {children}
    </span>
  );
}
