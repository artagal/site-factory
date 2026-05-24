"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { trackEvent } from "../../lib/analytics";
import { createEmailAccount, observeUser, signInEmail, signInGoogle, signInGuest, signOutUser } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import { ensureUserProfile } from "../../lib/firestore";
import { Button } from "../../components/gofunmotion/Button";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Firebase is optional in this preview. Browse plans and deals without signing in.");
  const [user, setUser] = useState<User | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => observeUser(setUser), []);

  async function finishSignIn(resultUser: User | null | undefined, successMessage: string) {
    if (!resultUser) {
      setStatus("Firebase is not configured yet. Add env vars before live login.");
      return;
    }

    await ensureUserProfile(resultUser);
    setStatus(successMessage);
    if (nextPath) {
      router.push(nextPath);
    }
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
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Guest session connected. Saved plans and deals can sync when Firebase is configured.");
  }

  async function handleGoogle() {
    trackEvent("login_clicked", {
      firebaseConfigured: firebaseReady,
      provider: "google"
    });
    const resultUser = await runAuthAction(async () => (await signInGoogle())?.user ?? null);
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Google sign-in connected. Marketplace saves can sync when Firebase is configured.");
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
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Firebase auth connected. Marketplace saves can sync when Firebase is configured.");
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
      setStatus("Signed out. You can still browse plans and demo deals.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Sign in</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
          Save plans and deals when you need them.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Browse GoFunMotion Deals without an account. Sign in is only needed for saved plans, saved listings, booking requests, profile, partner dashboard, and admin.
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
              {user.displayName ?? user.email ?? (user.isAnonymous ? "Guest user" : "GoFunMotion user")}
            </p>
          </div>
        ) : null}
        <div className="mt-5 grid gap-3">
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" value={password} />
          <div className="flex flex-wrap gap-3">
            <Button disabled={busy || !firebaseReady} onClick={handleGoogle} variant="secondary">Google</Button>
            <Button disabled={busy || !firebaseReady} onClick={() => handleEmail("login")}>Sign in</Button>
            <Button disabled={busy || !firebaseReady} onClick={() => handleEmail("signup")} variant="ghost">Signup</Button>
            <Button disabled={busy || !firebaseReady} onClick={handleGuest} variant="secondary">Guest</Button>
            {user ? <Button disabled={busy} onClick={handleSignOut} variant="ghost">Sign out</Button> : null}
          </div>
          {!firebaseReady ? (
            <p className="rounded-2xl border border-orange-300/20 bg-orange-300/10 p-4 text-sm font-bold leading-6 text-orange-50">
              Live sign-in is disabled until Firebase env vars are added in Vercel. Plan finding and demo deal browsing still work without an account.
            </p>
          ) : null}
          <p className="text-sm font-bold text-lime-200">{status}</p>
        </div>
      </div>
    </main>
  );
}

function getSafeNextPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function LoginFallback() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-sm font-bold text-white/64">
        Loading sign-in...
      </div>
    </main>
  );
}
