"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Bookmark } from "lucide-react";
import { observeUser } from "../../lib/auth";
import { saveListingForUser, unsaveListingForUser } from "../../lib/firestore";
import { isFirebaseConfigured } from "../../lib/firebase";
import { trackEvent } from "../../lib/analytics";
import type { Listing } from "../../types/deals";

export function SaveListingButton({ listing }: { listing: Listing }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  async function toggleSaved() {
    if (!isFirebaseConfigured()) {
      setStatus("Firebase is not configured yet. Sign-in saves will work after env vars are added.");
      return;
    }

    if (!user) {
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update saved deal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={busy}
        onClick={toggleSaved}
        type="button"
      >
        <Bookmark aria-hidden="true" size={17} />
        {saved ? "Saved" : "Save"}
      </button>
      {status ? <p className="mt-2 max-w-xs text-xs font-bold leading-5 text-lime-100">{status}</p> : null}
    </div>
  );
}
