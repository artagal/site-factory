"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { LogIn, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { observeUser, signOutUser } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import { isFirebaseConfigured } from "../../lib/firebase";
import { isAdminUser } from "../../lib/firestore";

function getInitials(user: User | null) {
  const label = user?.displayName ?? user?.email ?? "Account";
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "GM";
}

export function AccountNav() {
  const [signOutError, setSignOutError] = useState("");
  const [adminAccess, setAdminAccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin(nextUser: User) {
      try {
        const allowed = isFirebaseConfigured() ? await isAdminUser(nextUser.uid) : false;
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
  }, [user]);

  if (!user) {
    return (
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-black text-[#070816] transition hover:bg-lime-200"
        href="/login"
        onClick={() =>
          trackEvent("login_clicked", {
            placement: "navbar",
            provider: "unknown"
          })
        }
      >
        <LogIn aria-hidden="true" size={17} />
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/12 px-3 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-300 hover:text-black"
        href="/profile"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-lime-300 text-xs font-black text-black">
          {getInitials(user)}
        </span>
        <span className="hidden sm:inline">Account</span>
      </Link>
      {adminAccess ? (
        <Link
          aria-label="Open admin"
          className="hidden min-h-11 items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300 hover:text-black md:inline-flex"
          href="/admin"
        >
          <ShieldCheck aria-hidden="true" size={17} />
          Admin
        </Link>
      ) : null}
      <button
        aria-label="Sign out"
        title="Sign out"
        className="hidden size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/10 hover:text-white md:inline-flex"
        onClick={() => void signOutUser().catch(() => setSignOutError("Sign out failed. Please retry."))}
        type="button"
      >
        <LogOut aria-hidden="true" size={17} />
      </button>
      {signOutError ? <span className="absolute right-4 top-full rounded-lg bg-[var(--panel-strong)] p-3 text-sm" role="alert">{signOutError}</span> : null}
    </div>
  );
}

export function MobileAccountLink() {
  const [adminAccess, setAdminAccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin(nextUser: User) {
      try {
        const allowed = isFirebaseConfigured() ? await isAdminUser(nextUser.uid) : false;
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
  }, [user]);

  if (user && adminAccess) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Link
          aria-label="Open account"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 text-sm font-black text-white active:scale-[0.98]"
          href="/profile"
        >
          <UserCircle2 aria-hidden="true" size={20} />
          <span>Account</span>
        </Link>
        <Link
          aria-label="Open admin"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/12 px-3 text-sm font-black text-cyan-100 active:scale-[0.98]"
          href="/admin"
        >
          <ShieldCheck aria-hidden="true" size={20} />
          <span>Admin</span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      aria-label={user ? "Open account" : "Sign in"}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 text-sm font-black text-white active:scale-[0.98]"
      href={user ? "/profile" : "/login"}
      onClick={() => {
        if (!user) {
          trackEvent("login_clicked", {
            placement: "mobile_bottom_nav",
            provider: "unknown"
          });
        }
      }}
    >
      <UserCircle2 aria-hidden="true" size={20} />
      <span>{user ? "Account" : "Sign In"}</span>
    </Link>
  );
}
