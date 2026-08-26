"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { createEmailAccount, observeUser, resetAccountPassword, signInApple, signInEmail, signInGoogle, signOutUser } from "../../lib/auth";
import { safeAccountReturnPath } from "../../lib/auth-navigation";
import { isFirebaseConfigured } from "../../lib/firebase";
import { ensureUserProfile, isAdminUser } from "../../lib/firestore";

export default function LoginPage() {
  return <Suspense fallback={<main className="p-8" role="status">Loading sign-in...</main>}><LoginContent /></Suspense>;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [adminAccess, setAdminAccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const ready = isFirebaseConfigured();
  const nextPath = safeAccountReturnPath(searchParams.get("next"));

  useEffect(() => observeUser((value) => { setUser(value?.isAnonymous ? null : value); setChecking(false); }), []);
  useEffect(() => {
    let cancelled = false;
    setAdminAccess(false);
    if (user) void isAdminUser(user.uid).then((allowed) => { if (!cancelled) setAdminAccess(allowed); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [user]);

  async function authenticate(action: () => Promise<{ user: User } | null>) {
    if (busy || !ready) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await action();
      if (!result) throw new Error("Unavailable");
      await ensureUserProfile(result.user);
      router.replace(nextPath);
    } catch (error) {
      setStatus(formatAuthError(error));
    } finally { setBusy(false); }
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode !== "reset") {
      await authenticate(() => mode === "signup" ? createEmailAccount(email.trim(), password) : signInEmail(email.trim(), password));
      return;
    }
    if (busy || !ready) return;
    setBusy(true);
    try {
      await resetAccountPassword(email);
      setStatus("If an account uses this email, a password reset link will arrive shortly. Check your spam folder too.");
    } catch (error) { setStatus(formatAuthError(error)); }
    finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-[65vh] max-w-md px-4 py-8 md:py-12">
    <h1 className="text-3xl font-bold">{user ? "You're signed in" : mode === "signup" ? "Create your account" : mode === "reset" ? "Reset your password" : "Welcome back"}</h1>
    <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{user ? user.displayName ?? user.email : "Save deals and keep track of your booking requests."}</p>
    {checking ? <p className="mt-6" role="status">Checking your account...</p> : user ? <div className="mt-6 grid gap-3">
      <Link className="inline-flex min-h-12 items-center justify-center rounded-lg bg-lime-300 px-4 font-semibold text-[#101510]" href={nextPath}>Continue to account</Link>
      {adminAccess ? <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] font-semibold" href="/admin">Open admin</Link> : null}
      <button className="min-h-11 text-sm underline" disabled={busy} onClick={async () => {
        setBusy(true);
        try { await signOutUser(); setStatus(""); } catch { setStatus("Could not sign out. Please try again."); }
        finally { setBusy(false); }
      }} type="button">Sign out</button>
    </div> : <>
      {!ready ? <p className="mt-5 rounded-lg border border-amber-500/30 p-4 text-sm text-[var(--accent-amber)]">Sign-in is temporarily unavailable. You can still browse deals.</p> : null}
      <form className="mt-6 grid gap-4" onSubmit={submitEmail}>
        <label className="grid gap-2 text-sm font-semibold">Email
          <input autoComplete="email" className="h-12 min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3" maxLength={254} name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        {mode !== "reset" ? <div className="grid gap-2 text-sm font-semibold"><label htmlFor="login-password">Password</label>
          <span className="relative">
            <input id="login-password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="h-12 w-full min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] pl-3 pr-12" minLength={mode === "signup" ? 6 : 1} name="password" onChange={(event) => setPassword(event.target.value)} required type={visible ? "text" : "password"} value={password} />
            <button aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} className="absolute right-0 top-0 flex size-12 items-center justify-center" onClick={() => setVisible(!visible)} title={visible ? "Hide password" : "Show password"} type="button">{visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}</button>
          </span>
        </div> : null}
        <button className="min-h-12 rounded-lg bg-lime-300 px-4 font-semibold text-[#101510] disabled:opacity-50" disabled={busy || !ready} type="submit">{busy ? "Please wait..." : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</button>
      </form>
      {mode === "signin" ? <button className="mt-2 min-h-11 text-sm underline" onClick={() => { setMode("reset"); setStatus(""); }} type="button">Forgot password?</button> : null}
      {mode !== "reset" ? <div className="mt-4 grid gap-3 border-t border-[var(--border-subtle)] pt-5">
        <button className="min-h-12 rounded-lg border border-[var(--border-subtle)] font-semibold disabled:opacity-50" disabled={busy || !ready} onClick={() => void authenticate(signInGoogle)} type="button">Continue with Google</button>
        <button className="min-h-12 rounded-lg border border-[var(--border-subtle)] font-semibold disabled:opacity-50" disabled={busy || !ready} onClick={() => void authenticate(signInApple)} type="button">Continue with Apple</button>
      </div> : null}
      <button className="mt-3 min-h-11 text-sm underline" disabled={busy} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setStatus(""); }} type="button">{mode === "signin" ? "New here? Create an account" : "Back to sign in"}</button>
    </>}
    <p aria-live="polite" className="mt-3 text-sm leading-6 text-[var(--accent-amber)]">{status}</p>
    <Link className="mt-4 inline-flex min-h-11 items-center text-sm text-[var(--muted-foreground)] underline" href="/deals">Browse without an account</Link>
  </main>;
}

function formatAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/auth\/(invalid-credential|user-not-found|wrong-password)/.test(message)) return "Email or password is incorrect.";
  if (message.includes("auth/email-already-in-use")) return "That email already has an account. Sign in instead.";
  if (message.includes("auth/weak-password")) return "Choose a stronger password with at least 6 characters.";
  if (message.includes("auth/popup-closed-by-user")) return "Sign-in was cancelled. You can try again.";
  if (message.includes("auth/popup-blocked")) return "Allow popups for this site, then try again, or use email.";
  if (message.includes("auth/too-many-requests")) return "Too many attempts. Please wait a few minutes.";
  if (/auth\/(operation-not-allowed|unauthorized-domain)/.test(message)) return "This sign-in option is temporarily unavailable. Please use email or contact support.";
  return "We couldn't finish that request. Please try again, or contact support.";
}
