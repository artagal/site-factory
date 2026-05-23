"use client";

import { useState } from "react";
import { trackEvent } from "../../lib/analytics";
import { createEmailAccount, signInEmail, signInGoogle, signInGuest } from "../../lib/auth";
import { isFirebaseConfigured } from "../../lib/firebase";
import { ensureUserProfile } from "../../lib/firestore";
import { syncLocalProgressToFirebase } from "../../lib/progressActions";
import { Button } from "../../components/gofunmotion/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Firebase is optional. Local progress works without login.");

  async function handleGuest() {
    trackEvent("login_clicked", {
      firebaseConfigured: isFirebaseConfigured(),
      provider: "anonymous"
    });
    const result = await signInGuest();
    if (result?.user) {
      await ensureUserProfile(result.user);
      await syncLocalProgressToFirebase();
    }
    setStatus(result ? "Signed in anonymously." : "Firebase is not configured yet. Keep using local progress.");
  }

  async function handleGoogle() {
    trackEvent("login_clicked", {
      firebaseConfigured: isFirebaseConfigured(),
      provider: "google"
    });
    const result = await signInGoogle();
    if (result?.user) {
      await ensureUserProfile(result.user);
      await syncLocalProgressToFirebase();
    }
    setStatus(result ? "Google sign-in connected. Save your momentum with one click." : "Firebase is not configured yet. Add env vars before live login.");
  }

  async function handleEmail(mode: "login" | "signup") {
    trackEvent("login_clicked", {
      firebaseConfigured: isFirebaseConfigured(),
      mode,
      provider: "email"
    });
    if (!email || password.length < 6) {
      setStatus("Add an email and a password with at least 6 characters.");
      return;
    }

    const result =
      mode === "signup" ? await createEmailAccount(email, password) : await signInEmail(email, password);
    if (result?.user) {
      await ensureUserProfile(result.user);
      await syncLocalProgressToFirebase();
    }
    setStatus(result ? "Firebase auth connected." : "Firebase is not configured yet. No secrets are hardcoded.");
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Login / signup</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-7xl">
          Save progress when Firebase is ready.
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/62">
          The generator works without an account. Firebase Auth is wired through environment variables and gracefully falls back when not configured.
        </p>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
        <p className="rounded-2xl bg-black/24 p-4 text-sm font-bold text-white/68">
          Firebase status: {isFirebaseConfigured() ? "configured" : "not configured"}
        </p>
        <div className="mt-5 grid gap-3">
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
          <input className="min-h-12 rounded-2xl border border-white/10 bg-black/24 px-4 text-white outline-none" onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" value={password} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGoogle} variant="secondary">Google</Button>
            <Button onClick={() => handleEmail("login")}>Login</Button>
            <Button onClick={() => handleEmail("signup")} variant="ghost">Signup</Button>
            <Button onClick={handleGuest} variant="secondary">Guest</Button>
          </div>
          <p className="text-sm font-bold text-lime-200">{status}</p>
        </div>
      </div>
    </main>
  );
}
