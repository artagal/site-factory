"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareButton({
  label = "Share",
  text,
  title,
  url
}: {
  label?: string;
  text: string;
  title: string;
  url?: string;
}) {
  const [status, setStatus] = useState("");

  async function share() {
    const shareUrl = url ?? globalThis.location.href;
    const browserNavigator = navigator as Navigator & {
      share?: (data: { text: string; title: string; url: string }) => Promise<void>;
    };

    try {
      if (browserNavigator.share) {
        await browserNavigator.share({ text, title, url: shareUrl });
        setStatus("Share sheet opened.");
        return;
      }

      await browserNavigator.clipboard.writeText(`${title}\n${text}\n${shareUrl}`);
      setStatus("Copied link.");
    } catch {
      setStatus("Could not share right now.");
    }
  }

  return (
    <div>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white transition hover:bg-white/10"
        onClick={share}
        type="button"
      >
        <Share2 aria-hidden="true" size={17} />
        {label}
      </button>
      {status ? <p className="mt-2 text-xs font-bold text-lime-100">{status}</p> : null}
    </div>
  );
}
