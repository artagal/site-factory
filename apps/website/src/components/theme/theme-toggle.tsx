"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white transition hover:border-lime-300/35 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-lime-300"
      onClick={toggleTheme}
      title={isLight ? "Dark mode" : "Light mode"}
      type="button"
    >
      <Icon aria-hidden="true" size={19} />
    </button>
  );
}
