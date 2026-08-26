"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { Bookmark } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { isListingSaved, saveListingForUser, unsaveListingForUser } from "../../lib/firestore";
import { isFirebaseConfigured } from "../../lib/firebase";
import { trackEvent } from "../../lib/analytics";
import type { Listing } from "../../types/deals";

export function SaveListingButton({ compact = false, listing }: { compact?: boolean; listing: Listing }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => observeUser(setUser), []);
  useEffect(() => {
    let cancelled = false;
    setSaved(false);
    setLoaded(false);
    setStatus("");
    if (user && !user.isAnonymous) {
      void isListingSaved(user.uid, listing.id).then((value) => {
        if (!cancelled) { setSaved(value); setLoaded(true); }
      }).catch(() => {
        if (!cancelled) setStatus("Saved deals could not load. Please refresh and try again.");
      });
    }
    return () => { cancelled = true; };
  }, [listing.id, user]);

  async function toggleSaved() {
    if (!isFirebaseConfigured()) {
      setStatus("Saving is temporarily unavailable. You can still browse deals.");
      return;
    }

    if (!user || user.isAnonymous) {
      setStatus("Sign in to save this deal.");
      return;
    }

    setBusy(true);
    try {
      if (saved) {
        await unsaveListingForUser(user.uid, listing.id);
        setSaved(false);
        setStatus("Removed from saved deals.");
      } else {
        await saveListingForUser(user.uid, listing);
        trackEvent("listing_saved", { listingId: listing.id, listingSlug: listing.slug });
        setSaved(true);
        setStatus("Saved to your profile.");
      }
    } catch {
      setStatus("Could not update your saved deal. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "relative shrink-0" : ""}>
      {!user || user.isAnonymous ? <Link
        aria-label="Sign in to save this deal"
        title="Sign in to save this deal"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 text-sm font-semibold"
        href={`/login?next=${encodeURIComponent(`/deals/${listing.slug}`)}`}
      ><Bookmark aria-hidden="true" size={18} />{!compact ? "Save" : null}</Link> : <button
        aria-label={saved ? "Remove saved deal" : "Save deal"}
        aria-pressed={saved}
        title={status || (saved ? "Remove saved deal" : "Save deal")}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 text-sm font-semibold disabled:opacity-60"
        disabled={busy || !loaded}
        onClick={toggleSaved}
        type="button"
      >
        <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} size={18} />
        {!compact ? (saved ? "Saved" : "Save") : null}
      </button>}
      <span className={compact ? "sr-only" : "mt-2 block max-w-xs text-xs leading-5"} role="status">{status}</span>
    </div>
  );
}
