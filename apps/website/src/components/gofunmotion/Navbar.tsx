import Link from "next/link";
import { Menu } from "lucide-react";
import { AccountNav, MobileAccountLink } from "./AccountNav";
import { LinkButton } from "./Button";
import { ThemeToggle } from "../theme/theme-toggle";

const links = [
  { href: "/find", label: "Find" },
  { href: "/deals", label: "Deals" },
  { href: "/date-night", label: "Date Night" },
  { href: "/family", label: "Family" },
  { href: "/partner", label: "Partner" }
];

export function Logo() {
  return (
    <Link aria-label="GoFunMotion home" className="group inline-flex min-h-11 min-w-0 shrink items-center gap-1.5 text-base font-black sm:gap-2 sm:text-lg" href="/">
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
        <img alt="" aria-hidden="true" className="size-full" height={36} src="/brand/gofunmotion-mark.svg" width={36} />
      </span>
      <span>Go</span>
      <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300 bg-clip-text text-transparent">
        Fun
      </span>
      <span className="relative max-[430px]:hidden">
        Motion
        <span className="absolute -right-8 top-1/2 hidden h-0.5 w-7 -translate-y-1/2 bg-gradient-to-r from-lime-300 to-transparent sm:block" />
      </span>
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070816]/78 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-bold text-white/68 transition hover:bg-white/8 hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <AccountNav />
          <LinkButton className="min-h-11 rounded-full px-4 py-2" href="/find">
            Find My Plan
          </LinkButton>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <ThemeToggle />
          <LinkButton className="min-h-11 rounded-full px-3 py-2 sm:px-4" href="/find" showArrow={false}>
            Find
          </LinkButton>
          <details className="relative">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white">
              <Menu aria-hidden="true" size={20} />
              <span className="sr-only">Open menu</span>
            </summary>
            <div className="absolute right-0 top-13 w-64 rounded-2xl border border-white/10 bg-[#070816] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              {links.map((link) => (
                <Link className="block rounded-xl px-4 py-3 text-sm font-black text-white/76 hover:bg-white/[0.08] hover:text-white" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
              <div className="mt-2">
                <MobileAccountLink />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
