"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { trackEvent } from "../../lib/analytics";
import { createEmailAccount, observeUser, signInEmail, signInGoogle, signInGuest, signOutUser } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import { ensureUserProfile } from "../../lib/firestore";
import { syncLocalProgressToFirebase } from "../../lib/progressActions";
import { Button } from "../../components/gofunmotion/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Firebase is optional. Local progress works without login.");
  const [user, setUser] = useState<User | null>(null);
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => observeUser(setUser), []);

  async function finishSignIn(resultUser: User | null | undefined, successMessage: string) {
    if (!resultUser) {
      setStatus("Firebase is not configured yet. Add env vars before live login.");
      return;
    }

    await ensureUserProfile(resultUser);
    const syncResult = await syncLocalProgressToFirebase();
    setStatus(syncResult.synced ? successMessage : syncResult.error ?? "Signed in, but sync did not complete.");
  }

  async function runAuthAction(action: () => Promise<User | null | undefined>) {
    if (busy) return null;

    setBusy(true);
    try {
      return await action();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    trackEvent("login_clicked", {
      firebaseConfigured: firebaseReady,
      provider: "anonymous"
    });
    const resultUser = await runAuthAction(async () => (await signInGuest())?.user ?? null);
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Guest session connected. Local momentum is synced.");
  }

  async function handleGoogle() {
    trackEvent("login_clicked", {
      firebaseConfigured: firebaseReady,
      provider: "google"
    });
    const resultUser = await runAuthAction(async () => (await signInGoogle())?.user ?? null);
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Google sign-in connected. Save your momentum across devices.");
  }

  async function handleEmail(mode: "login" | "signup") {
    trackEvent("login_clicked", {
      firebaseConfigured: firebaseReady,
      mode,
      provider: "email"
    });
    if (!email || password.length < 6) {
      setStatus("Add an email and a password with at least 6 characters.");
      return;
    }

    const resultUser = await runAuthAction(async () =>
      (mode === "signup" ? await createEmailAccount(email, password) : await signInEmail(email, password))?.user ?? null
    );
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Firebase auth connected. Your momentum is synced.");
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
      setStatus("Signed out. Local progress still works on this device.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Login / signup</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
          Save your momentum across devices.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Generate without an account. Sign in when you want your XP, streak, saved missions, and completions to move with you.
        </p>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/68">
          Firebase status: {firebaseReady ? "configured" : "not configured"}
        </p>
        {user ? (
          <div className="mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Signed in</p>
            <p className="mt-1 text-sm font-bold text-white/72">
              {user.displayName ?? user.email ?? (user.isAnonymous ? "Guest player" : "GoFunMotion player")}
            </p>
          </div>
        ) : null}
        <div className="mt-5 grid gap-3">
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" value={password} />
          <div className="flex flex-wrap gap-3">
            <Button disabled={busy || !firebaseReady} onClick={handleGoogle} variant="secondary">Google</Button>
            <Button disabled={busy || !firebaseReady} onClick={() => handleEmail("login")}>Login</Button>
            <Button disabled={busy || !firebaseReady} onClick={() => handleEmail("signup")} variant="ghost">Signup</Button>
            <Button disabled={busy || !firebaseReady} onClick={handleGuest} variant="secondary">Guest</Button>
            {user ? <Button disabled={busy} onClick={handleSignOut} variant="ghost">Sign out</Button> : null}
          </div>
          {!firebaseReady ? (
            <p className="rounded-2xl border border-orange-300/20 bg-orange-300/10 p-4 text-sm font-bold leading-6 text-orange-50">
              Live login is disabled until Firebase env vars are added in Vercel. The challenge loop still works locally on this device.
            </p>
          ) : null}
          <p className="text-sm font-bold text-lime-200">{status}</p>
        </div>
      </div>
    </main>
  );
}
