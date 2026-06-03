"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { EmptyStatePanel } from "../components/gofunmotion/product-states";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
      <EmptyStatePanel
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white" onClick={reset} type="button">
              <RefreshCw aria-hidden="true" size={17} />
              Try Again
            </button>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] px-5 text-sm font-black text-white hover:bg-white/12" href="/deals">
              Browse Deals
            </Link>
          </div>
        }
        body={error.message || "Something did not load correctly. Retry the page or return to deals."}
        icon={AlertTriangle}
        title="Something needs another try"
      />
    </main>
  );
}
