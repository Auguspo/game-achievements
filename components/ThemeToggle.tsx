"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const resolveTheme = (saved: string | null) => {
  if (saved === "dark" || saved === "light") return saved;
  return getSystemTheme();
};

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = resolveTheme(saved);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setIsDark(initial === "dark");

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!localStorage.getItem("theme")) {
        const system = getSystemTheme();
        document.documentElement.classList.toggle("dark", system === "dark");
        setIsDark(system === "dark");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      className="h-11 w-11 rounded-full border-slate-300 bg-white/90 p-0 shadow-lg backdrop-blur transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/90"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
