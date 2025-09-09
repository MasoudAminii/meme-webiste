 // NavLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";


type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match?: string[];
};

interface NavLinksProps {
  links: NavLink[];
}

// Persian navigation labels with updated icon sizes and optional `match` patterns


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

const NavLinks: React.FC<NavLinksProps> = ({ links }) => {
  const pathname = usePathname();

  return (
    <>
      <ul className="nav-links space-y-2 max-lg:hidden">
        {links.map(({ href, label, icon, match }) => {
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
          {links.map(({ href, label, icon, match }) => {
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
export default NavLinks