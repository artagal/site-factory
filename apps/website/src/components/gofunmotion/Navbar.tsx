"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { AccountNav, MobileAccountLink } from "./AccountNav";
import { LinkButton } from "./Button";
import { ThemeToggle } from "../theme/theme-toggle";

const links = [
  { href: "/deals", label: "Deals" },
  { href: "/find", label: "Help me choose" },
  { href: "/date-night", label: "Date night" },
  { href: "/family", label: "Family" },
  { href: "/partner", label: "Partner" }
];

export function Logo() {
  return <Link aria-label="GoFunMotion home" className="group inline-flex min-h-11 min-w-0 shrink items-center gap-2 text-base font-black sm:text-lg" href="/">
    <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.28)]"><img alt="" aria-hidden="true" className="size-full" height={36} src="/brand/gofunmotion-mark.svg" width={36} /></span>
    <span>Go<span className="text-[var(--accent-lime)]">Fun</span><span className="max-[340px]:hidden">Motion</span></span>
  </Link>;
}

export function Navbar() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && menu.current?.open) { menu.current.open = false; menu.current.querySelector("summary")?.focus(); } };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  const navLink = (link: { href: string; label: string }) => <Link
    aria-current={pathname === link.href ? "page" : undefined}
    className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${pathname === link.href ? "bg-[var(--panel)] text-[var(--accent-lime)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
    href={link.href} key={link.href}
  >{link.label}</Link>;
  return <header className="sticky top-0 z-40 h-[var(--app-header-height)] border-b border-[var(--border-subtle)] bg-[var(--panel-strong)] backdrop-blur-2xl">
    <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-4 md:px-8">
      <Logo />
      <nav aria-label="Primary" className="hidden items-center xl:flex">{links.map(navLink)}</nav>
      <div className="hidden items-center gap-2 xl:flex"><ThemeToggle /><AccountNav /><LinkButton className="min-h-11 rounded-lg px-4 py-2" href="/deals?when=tonight">Tonight&apos;s Deals</LinkButton></div>
      <div className="flex shrink-0 items-center gap-2 xl:hidden">
        <Link className="inline-flex min-h-11 items-center rounded-lg bg-lime-300 px-3 text-sm font-bold text-[#101510]" href="/deals">Deals</Link>
        <details className="relative" ref={menu}>
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--border-subtle)]"><Menu aria-hidden="true" size={22} /><span className="sr-only">Open menu</span></summary>
          <div className="absolute right-0 top-full mt-2 grid max-h-[calc(100dvh-6rem)] w-64 gap-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-2 shadow-xl" onClick={(event) => { if ((event.target as Element).closest("a") && menu.current) menu.current.open = false; }}>
            {links.map(navLink)}
            {navLink({ href: "/friends", label: "Friends" })}
            {navLink({ href: "/saved", label: "Saved deals" })}
            <MobileAccountLink />
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-3 pt-2 text-sm"><span>Appearance</span><ThemeToggle /></div>
          </div>
        </details>
      </div>
    </div>
  </header>;
}
