"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import Sun from "../../../../public/logo/sun.png";
import Moon from "../../../../public/logo/moon.png";

const ThemeChange = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Determine if we're in dark mode
  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* desktop switch (hidden on small screens) */}
      <label className="theme-switch max-lg:hidden">
        <input
          type="checkbox"
          className="theme-switch__checkbox"
          checked={isDark}
          onChange={() => setTheme(isDark ? "light" : "dark")}
        />
        <div className="theme-switch__container">
          <div className="theme-switch__clouds"></div>
          <div className="theme-switch__stars-container">
            {/* ... your star SVG here, using currentColor */}
          </div>
          <div className="theme-switch__circle-container">
            <div className="theme-switch__sun-moon-container">
              <div className="theme-switch__moon">
                <div className="theme-switch__spot"></div>
                <div className="theme-switch__spot"></div>
                <div className="theme-switch__spot"></div>
              </div>
            </div>
          </div>
        </div>
      </label>

      {/* mobile icon button */}
      <div className="icon flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`image-logo relative overflow-hidden rounded-lg bg-white p-2 shadow-lg dark:bg-white/20 `}
        >
          <Image
            src={isDark ? Moon : Sun}
            alt={isDark ? "Dark mode icon" : "Light mode icon"}
            width={28}
            height={28}
            priority
            className="object-contain"
          />
        </button>
      </div>
    </>
  );
};

export default ThemeChange;
