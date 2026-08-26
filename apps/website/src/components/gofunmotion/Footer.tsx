import Link from "next/link";
import { Logo } from "./Navbar";

const footerLinks = [
  { href: "/find", label: "Find My Plan" },
  { href: "/deals", label: "Deals" },
  { href: "/date-night", label: "Date Night" },
  { href: "/friends", label: "Friends" },
  { href: "/family", label: "Family" },
  { href: "/partner", label: "Partner" },
  { href: "/pricing", label: "Pricing" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Account" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/28">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
            Last-minute fun deals near you.
          </p>
          <a className="mt-4 inline-flex min-h-11 items-center text-sm text-[var(--muted-foreground)] hover:underline" href="mailto:hello@gofunmotion.com">hello@gofunmotion.com</a>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-bold text-white/64 sm:grid-cols-3">
          {footerLinks.map((link) => (
            <Link className="inline-flex min-h-11 items-center hover:text-white" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
