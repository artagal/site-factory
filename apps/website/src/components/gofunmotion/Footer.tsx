import Link from "next/link";
import { Logo } from "./Navbar";

const footerLinks = [
  { href: "/challenge", label: "Challenge Generator" },
  { href: "/categories", label: "Categories" },
  { href: "/waitlist", label: "Mobile App" },
  { href: "/login", label: "Login" },
  { href: "/profile", label: "Account" },
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
            The internet that gets you moving. Fun AI-powered real-life challenges for motion, courage, connection, and adventure.
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
