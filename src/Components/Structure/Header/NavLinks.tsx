// NavLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { GoHomeFill } from "react-icons/go";
import { BsImageFill } from "react-icons/bs";
import { HiSquares2X2 } from "react-icons/hi2";
import { FaPenSquare } from "react-icons/fa";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** optional list of path prefixes or exact paths that should make this link active */
  match?: string[];
};

// Persian navigation labels with updated icon sizes and optional `match` patterns
export const navLinks: NavLink[] = [
  {
    href: "/",
    label: "صفحه اصلی",
    icon: <GoHomeFill size={30} />,
    match: ["/"], // root exact
  },
  {
    href: "/gallery",
    label: "گالری آثار",
    icon: <BsImageFill size={30} />,
    // any path that starts with /gallery will match (e.g. /gallery, /gallery/slug)
    match: ["/gallery"],
  },
  {
    href: "/reels",
    label: "حلقه فیلم",
    icon: <HiSquares2X2 size={30} />,
    // make this active for both /reels and /video segments (and their subpaths)
    match: ["/reels", "/video"],
  },
  {
    href: "/about-us",
    label: "درباره ما",
    icon: <FaPenSquare size={30} />,
    match: ["/about-us"],
  },
];

function isPathActive(pathname: string | null, matches?: string[]) {
  if (!pathname) return false;
  const path = pathname;
  const list = matches && matches.length ? matches : [];
  for (const m of list) {
    if (m === "/") {
      if (path === "/") return true;
      continue;
    }
    // exact match
    if (path === m) return true;
    // prefix match (handles /reels, /reels/123, etc.)
    if (path.startsWith(m + "/")) return true;
    // also handle case where pathname ends exactly with the prefix (didn't match above)
    if (path.startsWith(m) && path.length === m.length) return true;
  }
  return false;
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <ul className="nav-links space-y-2 max-lg:hidden">
        {navLinks.map(({ href, label, icon, match }) => {
          const isActive = isPathActive(pathname, match ?? [href]);
          return (
            <li key={href}>
              <Link
                title={label}
                href={href}
                className={[
                  "flex items-center gap-4 rounded-xl p-3 text-xl",
                  !isActive
                    ? "text-light-dark hover:text-accent hover:bg-primary-40"
                    : "text-accent bg-primary-40",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {icon}
                <span className="font-semibold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mobile-nav-links z-50 mx-auto mb-4 max-w-lg rounded-full bg-white p-2 shadow-2xl sm:p-3 lg:hidden">
        <ul className="flex items-center justify-between sm:gap-4">
          {navLinks.map(({ href, label, icon, match }) => {
            const isActive = isPathActive(pathname, match ?? [href]);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-2 rounded-full p-3",
                    !isActive
                      ? "text-light-dark hover:text-accent hover:bg-primary-40"
                      : "text-accent bg-primary-40",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {icon}
                  {isActive && (
                    <span className="text-base font-semibold max-[374px]:hidden">
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
