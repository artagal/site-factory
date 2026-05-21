import Link from "next/link";

const navItems = [
  { href: "/previews", label: "Previews" },
  {
    href: "/content/work-organizer/blog/how-to-organize-work-without-another-spreadsheet",
    label: "Sample blog"
  },
  { href: "/content/gofunmotion/models/mia-carter", label: "Model sample" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="text-base font-black text-ink">
          Site Factory
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap justify-end gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-ink/68 hover:bg-white hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
