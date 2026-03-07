"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleHeaderClick = () => {
    if (pathname !== "/") {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        router.push("/");
      }, 280);
    }
  };

  return (
    <header className="flex items-center gap-3 rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        <Image
          src="/crosshair.png"
          alt="Achievement Targetter"
          className={`transition-transform duration-300 ${isAnimating ? "scale-125" : "scale-100"}`}
          width={42}
          height={42}
        />
        <div className="leading-tight">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Achievement Targetter</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Steam achievement planner</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
