"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import Sun from "../../../../public/logo/icons/sun.svg";
import Moon from "../../../../public/logo/icons/moon.svg";

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
      <div className="flex w-full items-center justify-between">
        <span className="font-semibold max-lg:hidden">{isDark ? "حالت روز" : "حالت شب"}</span>

        <label className="theme-switch max-lg:hidden">
          <input
            type="checkbox"
            className="theme-switch__checkbox"
            checked={!isDark} // Reversed: checked when in light mode
            onChange={() => setTheme(isDark ? "light" : "dark")}
          />
          <div className="theme-switch__container">
            <div className="theme-switch__clouds"></div>
            <div className="theme-switch__stars-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="currentColor"
                  d="M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69 0-113.44 45.79-128 91.2-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56"
                ></path>
              </svg>
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
      </div>

      {/* mobile icon button */}
      <div className="icon flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`image-logo relative overflow-hidden rounded-lg shadow-lg`}
        >
          <Image
            src={isDark ? Sun : Moon}
            alt={isDark ? "Dark mode icon" : "Light mode icon"}
            width={40}
            height={40}
            priority
            className="object-contain"
          />
        </button>
      </div>
    </>
  );
};

export default ThemeChange;
