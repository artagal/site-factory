"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { AlertTriangle, LogOut, MailCheck, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { getCurrentUserIdToken, observeUser, sendCurrentUserEmailVerification, signOutUser, updateUserDisplayName } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
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
  const [deleteConfirm, setDeleteConfirm] = useState("");
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

  async function handleVerifyEmail() {
    setBusy(true);
    try {
      const result = await sendCurrentUserEmailVerification();
      if (!result) {
        setStatus("This account does not need email verification.");
        return;
      }

      trackEvent("email_verification_sent", {
        provider: "email"
      });
      setStatus("Verification email sent. Check your inbox, then reload after verifying.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send verification email.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setStatus("Type DELETE to confirm account deletion.");
      return;
    }

    setBusy(true);
    try {
      const token = await getCurrentUserIdToken();
      if (!token) {
        setStatus("Sign in again before deleting this account.");
        return;
      }

      const response = await fetch("/api/account/delete", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: "POST"
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Account deletion failed.");
      }

      trackEvent("account_deleted", {
        provider: user?.providerData[0]?.providerId ?? "unknown"
      });
      await signOutUser().catch(() => undefined);
      const guestProgress = setProgressScope(null);
      emitProgressUpdate(guestProgress);
      setUser(null);
      setDeleteConfirm("");
      setStatus("Account deleted. This browser is now using local guest progress.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Account deletion failed.");
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

        {user?.email && !user.emailVerified ? (
          <div className="mt-5 rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-100">Email verification</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white/68">
              Verify email/password accounts before relying on them for long-term progress recovery.
            </p>
            <Button className="mt-4" disabled={busy} onClick={handleVerifyEmail} variant="secondary">
              <MailCheck aria-hidden="true" size={18} />
              Send verification email
            </Button>
          </div>
        ) : null}

        {user ? (
          <div className="mt-5 rounded-[1.35rem] border border-red-300/20 bg-red-400/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle aria-hidden="true" className="mt-1 text-red-200" size={20} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-red-100">Danger zone</p>
                <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                  Delete removes the Firebase account plus saved and completed missions for this user ID. It does not remove local guest fallback data on other devices.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-red-300"
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="Type DELETE"
                value={deleteConfirm}
              />
              <Button disabled={busy || deleteConfirm !== "DELETE"} onClick={handleDeleteAccount} variant="ghost">
                <Trash2 aria-hidden="true" size={18} />
                Delete account
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
