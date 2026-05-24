import Link from "next/link";
import { Logo } from "./Navbar";

const footerLinks = [
  { href: "/deals", label: "Deals" },
  { href: "/find", label: "Help Me Choose" },
  { href: "/date-night", label: "Date Night" },
  { href: "/friends", label: "Friends" },
  { href: "/family", label: "Family" },
  { href: "/partner", label: "Partner" },
  { href: "/pricing", label: "Pricing" },
  { href: "/saved", label: "Saved" },
  { href: "/login", label: "Sign In" },
  { href: "/about", label: "About" },
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
            GoFunMotion Deals helps people find discounted last-minute activity openings, date night deals, family passes, and local experiences with clear was/now pricing.
          </p>
          <p className="mt-4 text-sm text-white/45">Contact: hello@gofunmotion.com</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-bold text-white/64 sm:grid-cols-3">
          {footerLinks.map((link) => (
            <Link className="inline-flex min-h-11 items-center hover:text-white" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <span className="inline-flex min-h-11 items-center text-white/35">TikTok</span>
          <span className="inline-flex min-h-11 items-center text-white/35">Instagram</span>
          <span className="inline-flex min-h-11 items-center text-white/35">YouTube</span>
        </div>
      </div>
    </footer>
  );
}
