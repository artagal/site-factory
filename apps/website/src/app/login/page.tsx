"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { trackEvent } from "../../lib/analytics";
import { createEmailAccount, observeUser, signInEmail, signInGoogle, signInGuest, signOutUser } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import { ensureUserProfile, isAdminUser } from "../../lib/firestore";
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
  const [adminAccess, setAdminAccess] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Browse deals without an account. Sign in to save deals, send booking requests, or manage partner tools.");
  const [user, setUser] = useState<User | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => observeUser(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin(nextUser: User) {
      if (!firebaseReady) {
        setAdminAccess(false);
        return;
      }

      try {
        const allowed = await isAdminUser(nextUser.uid);
        if (!cancelled) setAdminAccess(allowed);
      } catch {
        if (!cancelled) setAdminAccess(false);
      }
    }

    if (!user) {
      setAdminAccess(false);
      return;
    }

    void checkAdmin(user);

    return () => {
      cancelled = true;
    };
  }, [firebaseReady, user]);

  async function finishSignIn(resultUser: User | null | undefined, successMessage: string) {
    if (!resultUser) {
      setStatus("Live sign-in is not connected yet. You can still browse deals without an account.");
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
      setStatus(formatAuthError(error));
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
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Guest session connected. Use Google or email later if you want a permanent account.");
  }

  async function handleGoogle() {
    trackEvent("login_clicked", {
      firebaseConfigured: firebaseReady,
      provider: "google"
    });
    const resultUser = await runAuthAction(async () => (await signInGoogle())?.user ?? null);
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Google sign-in connected. Saved deals and booking requests are ready.");
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
    if (resultUser || !firebaseReady) await finishSignIn(resultUser, "Account connected. Saved deals and booking requests are ready.");
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
      setStatus("Signed out. You can still browse deals.");
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
          Browse GoFunMotion Deals without an account. Sign in only when you want saved deals, booking requests, partner tools, or admin access.
        </p>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/68">
          Account status: {firebaseReady ? "ready" : "not connected"}
        </p>
        {user ? (
          <div className="mt-4 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">You're signed in</p>
            <p className="mt-1 text-sm font-bold text-white/72">
              {user.displayName ?? user.email ?? (user.isAnonymous ? "Guest user" : "GoFunMotion user")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-[#070816] hover:bg-lime-200" href="/profile">
                Open account
              </Link>
              {adminAccess ? (
                <Link className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-lime-300/25 bg-lime-300/15 px-4 text-sm font-black text-lime-100 hover:bg-lime-300 hover:text-[#070816]" href="/admin">
                  Open admin
                </Link>
              ) : null}
            </div>
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
              Live account features are not connected yet. Deal browsing still works without an account.
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

function formatAuthError(error: unknown) {
  if (!(error instanceof Error)) return "Sign-in failed. Try again.";

  const message = error.message;
  if (message.includes("auth/invalid-credential")) return "Email or password is incorrect.";
  if (message.includes("auth/user-not-found")) return "No account exists for that email yet. Use Signup or Google.";
  if (message.includes("auth/wrong-password")) return "Password is incorrect.";
  if (message.includes("auth/email-already-in-use")) return "That email already has an account. Use Sign in instead.";
  if (message.includes("auth/popup-closed-by-user")) return "Google sign-in was closed before it finished.";
  if (message.includes("auth/unauthorized-domain")) return "This domain is not allowed for sign-in yet.";

  return "Sign-in failed. Try again.";
}
