"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { observeUser, signOutUser, updateUserDisplayName } from "../../lib/auth";
import { updateUserProfileInFirestore } from "../../lib/firestore";
import { getLocalProgress, setProgressScope, updateLocalProfile } from "../../lib/localStorage";
import { emitProgressUpdate, syncLocalProgressToFirebase } from "../../lib/progressActions";
import { Button, LinkButton } from "./Button";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "GM";
}

export function ProfileSettings() {
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState("Motion Rookie");
  const [status, setStatus] = useState("Profile settings are saved locally and synced to Firebase when signed in.");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setDisplayName(getLocalProgress().displayName);

    return observeUser((nextUser) => {
      setUser(nextUser);
      const progress = getLocalProgress();
      setDisplayName(nextUser?.displayName || progress.displayName);
    });
  }, []);

  async function handleSave() {
    const cleanName = displayName.trim().slice(0, 48);
    if (!cleanName) {
      setStatus("Add a display name first.");
      return;
    }

    setBusy(true);
    try {
      const localProgress = updateLocalProfile({ displayName: cleanName });
      emitProgressUpdate(localProgress);

      if (user) {
        await updateUserDisplayName(cleanName);
        await updateUserProfileInFirestore(user.uid, {
          displayName: cleanName,
          photoURL: user.photoURL
        });
        await syncLocalProgressToFirebase();
        setStatus("Profile updated and synced to Firebase.");
      } else {
        setStatus("Profile updated on this device. Sign in to sync it across devices.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
      const guestProgress = setProgressScope(null);
      emitProgressUpdate(guestProgress);
      setUser(null);
      setStatus("Signed out. This browser is back to local guest progress.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Profile settings</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
          Keep your motion tied to your profile.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Your saved missions, completions, XP, streak, badges, and profile name are isolated by Firebase user ID when you are signed in.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-bold leading-6 text-lime-50">
          <ShieldCheck aria-hidden="true" className="mb-2" size={22} />
          Firestore rules only allow each user to read and write their own profile, saved missions, and completed missions.
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-fuchsia-300 via-cyan-200 to-lime-300 text-3xl font-black text-black">
            {initials(displayName)}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
              {user ? "Signed in profile" : "Local guest profile"}
            </p>
            <p className="mt-1 text-xl font-black text-white">
              {user?.email ?? user?.displayName ?? "Not signed in"}
            </p>
          </div>
        </div>

        <label className="mt-6 grid gap-2 text-sm font-black uppercase tracking-[0.14em] text-white/45">
          Display name
          <input
            className="min-h-14 rounded-2xl border border-white/10 bg-black/24 px-4 text-base font-bold normal-case tracking-normal text-white outline-none focus:border-cyan-300"
            maxLength={48}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Motion Rookie"
            value={displayName}
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={busy} onClick={handleSave}>
            <Save aria-hidden="true" size={18} />
            Save profile
          </Button>
          {user ? (
            <Button disabled={busy} onClick={handleSignOut} variant="ghost">
              <LogOut aria-hidden="true" size={18} />
              Sign out
            </Button>
          ) : (
            <LinkButton href="/login" variant="secondary">
              <UserRound aria-hidden="true" size={18} />
              Login / signup
            </LinkButton>
          )}
          <LinkButton href="/profile" variant="ghost">Back to profile</LinkButton>
        </div>

        <p className="mt-5 rounded-2xl bg-black/24 p-4 text-sm font-bold leading-6 text-lime-100">{status}</p>
      </section>
    </div>
  );
}
