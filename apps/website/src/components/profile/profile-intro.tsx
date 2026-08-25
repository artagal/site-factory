"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { observeUser } from "../../lib/auth";

export function ProfileIntro() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => observeUser(setUser), []);

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-300">User profile</p>
      <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">Your deals, plans, and requests.</h1>
      <p className="mt-5 text-lg leading-8 text-white/64">
        {user
          ? "Your account is connected. Saved deals and booking request updates stay together here."
          : "Browse without login. Sign in when you want to save deals, keep helper plans, submit booking requests, or manage partner access."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime-300 px-5 text-sm font-black text-[#070816] hover:bg-white"
          href={user ? "/deals?when=tonight" : "/login"}
        >
          {user ? "See Tonight's Deals" : "Sign In"}
        </Link>
        <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-5 text-sm font-black text-white hover:bg-white/10" href="/find">
          Help Me Choose
        </Link>
      </div>
    </div>
  );
}
