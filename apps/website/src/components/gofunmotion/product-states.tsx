import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Tone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<Tone, string> = {
  danger: "border-rose-300/45 bg-rose-50/90 text-rose-950 dark:border-rose-300/25 dark:bg-rose-300/12 dark:text-rose-100",
  info: "border-cyan-300/45 bg-cyan-50/90 text-cyan-950 dark:border-cyan-300/22 dark:bg-cyan-300/10 dark:text-cyan-100",
  success: "border-lime-300/45 bg-lime-50/90 text-lime-950 dark:border-lime-300/25 dark:bg-lime-300/12 dark:text-lime-100",
  warning: "border-amber-300/60 bg-amber-50/95 text-amber-950 dark:border-amber-300/25 dark:bg-amber-300/12 dark:text-amber-100"
};

export function StatusBanner({
  children,
  title,
  tone = "info"
}: {
  children?: ReactNode;
  title: string;
  tone?: Tone;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`rounded-2xl border p-4 ${toneStyles[tone]}`} role={tone === "danger" ? "alert" : "status"}>
      <div className="flex gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="text-sm font-black">{title}</p>
          {children ? <div className="mt-1 text-sm font-bold leading-6 opacity-75">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyStatePanel({
  action,
  body,
  icon: Icon,
  title
}: {
  action?: ReactNode;
  body: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lime-200">
        <Icon aria-hidden="true" size={24} />
      </div>
      <h3 className="mt-4 text-2xl font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-6 text-white/54">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5" role="status">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-white/58">
        <Loader2 aria-hidden="true" className="animate-spin text-lime-200" size={17} />
        Loading
      </div>
      <div className="grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="h-16 animate-pulse rounded-2xl bg-white/[0.07]" key={index} />
        ))}
      </div>
    </div>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;

  return (
    <p className="mt-2 text-xs font-bold leading-5 text-rose-100" role="alert">
      {children}
    </p>
  );
}
