import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16", className)}>{children}</main>;
}
