import Link from "next/link";
import { AccountNav } from "./AccountNav";
import { LinkButton } from "./Button";

const links = [
  { href: "/challenge", label: "Generator" },
  { href: "/categories", label: "Modes" },
  { href: "/daily", label: "Daily" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/blog", label: "Ideas" }
];

export function Logo() {
  return (
    <Link aria-label="GoFunMotion home" className="group inline-flex min-h-11 items-center gap-2 text-lg font-black" href="/">
      <span>Go</span>
      <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300 bg-clip-text text-transparent">
        Fun
      </span>
      <span className="relative">
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
        <div className="flex items-center gap-2">
          <AccountNav />
          <LinkButton className="min-h-11 rounded-full px-4 py-2" href="/challenge">
            Try it
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
