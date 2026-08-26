"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ListingImage({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--panel)]">
      {failed ? <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]"><ImageOff aria-hidden="true" size={20} />Photo unavailable</span> : (
        <img alt={alt} className="h-full w-full object-cover" decoding="async" height={450} loading="lazy" onError={() => setFailed(true)} referrerPolicy="no-referrer" src={src} width={800} />
      )}
    </div>
  );
}
