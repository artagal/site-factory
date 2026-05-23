import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

type LinkButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  showArrow?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  ghost: "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]",
  primary:
    "bg-[linear-gradient(135deg,#f72585,#7c3aed,#00d4ff)] text-white shadow-[0_18px_60px_rgba(124,58,237,0.35)] hover:scale-[1.03] hover:shadow-[0_22px_80px_rgba(0,212,255,0.28)]",
  secondary: "bg-white text-[#070816] hover:scale-[1.03] hover:bg-lime-200"
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-lime-300 disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  href,
  showArrow = true,
  variant = "primary"
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-lime-300",
        variants[variant],
        className
      )}
      href={href}
    >
      {children}
      {showArrow ? <ArrowRight aria-hidden="true" size={18} /> : null}
    </Link>
  );
}
