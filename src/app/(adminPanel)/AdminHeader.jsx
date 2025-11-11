// src/app/(adminPanel)/AdminHeader.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import ThemeChange from "@/Components/Structure/Header/ThemeChange";
import {
  AiOutlineBarChart,
  AiOutlineBell,
  AiOutlineHome,
  AiOutlineLeft,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineShareAlt,
} from "react-icons/ai";

export default function AdminHeader({ username = null }) {
  const pathname = usePathname() || "";
  const router = useRouter();

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "داشبورد",
      labelEn: "Dashboard",
      icon: AiOutlineHome,
      href: "/dashboard",
      allowedRoles: ["ADMIN", "WRITER"], // Both can access
    },
    {
      id: "about",
      label: "درباره",
      labelEn: "About",
      icon: AiOutlineSetting,
      href: "/dashboard/about",
      allowedRoles: ["ADMIN"], // Only admin
    },
    {
      id: "link",
      label: "لینک‌ها",
      labelEn: "Links",
      icon: AiOutlineShareAlt,
      href: "/dashboard/links",
      allowedRoles: ["ADMIN"], // Only admin
    },
    {
      id: "posts",
      label: "پست‌ها",
      labelEn: "Posts",
      icon: AiOutlineBarChart,
      href: "/dashboard/posts",
      allowedRoles: ["ADMIN", "WRITER"], // Both can access
    },
    {
      id: "users",
      label: "کاربران",
      labelEn: "Users",
      icon: AiOutlineUser,
      href: "/dashboard/users",
      allowedRoles: ["ADMIN"], // Only admin
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(userRole),
  );
  const isHrefActive = (href) => pathname === href;

  // Safely compute initial (handle non-string username)
  const initial =
    typeof username === "string" && username.length > 0
      ? username.charAt(0).toUpperCase()
      : "ک";

  // Close modal on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setShowConfirm(false);
    }
    if (showConfirm) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfirm]);

  function openConfirm(e) {
    e?.stopPropagation?.();
    setShowConfirm(true);
  }

  function closeConfirm(e) {
    e?.stopPropagation?.();
    setShowConfirm(false);
  }

  async function confirmSignOut(e) {
    e?.stopPropagation?.();
    setLoading(true);

    // use redirect: false to show loader, then client-side route
    await signOut({ redirect: false });
    setLoading(false);
    router.push("/signin");
  }
  return (
    <>
      <nav className="bg-bg-1 border-light-white sticky top-0 z-50 flex min-h-screen w-80 min-w-[320px] flex-col justify-between border-r shadow-xl max-lg:hidden">
        <div className="flex flex-col space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="ring-accent/30 relative flex-shrink-0 overflow-hidden rounded-2xl shadow-lg ring-2">
                <Image
                  src="/logo/shia-meme-logo.jpg"
                  alt="Logo"
                  width={60}
                  height={60}
                  priority
                  className="transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-secondary text-xl font-bold">
                  میم شیعه
                </span>
                <span className="text-light-dark text-sm font-medium">
                  Shia Meme Dashboard
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {filteredNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isHrefActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group relative flex w-full items-center gap-4 rounded-xl p-3 px-4 transition-all duration-200 ${
                    active
                      ? "from-accent text-primary shadow-accent/25 bg-gradient-to-r to-purple-600 shadow-lg"
                      : "text-light-dark hover:bg-primary-40 hover:text-secondary"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon
                    className={`h-6 w-6 flex-shrink-0 transition-all ${
                      active
                        ? "text-primary"
                        : "text-light-dark group-hover:text-secondary"
                    }`}
                  />

                  <div className="animate-in slide-in-from-left-2 flex flex-col items-start duration-300">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">{item.labelEn}</span>
                  </div>

                  {active && (
                    <div className="animate-in slide-in-from-left-1 bg-primary absolute top-0 right-0 bottom-0 w-[9px] rounded-r-full duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-light-white space-y-4 border-t p-6">
          <div className="border-accent/20 bg-primary-40 flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 rounded-lg p-2">
                <AiOutlineBell className="text-accent h-4 w-4" />
              </div>
              <div>
                <p className="text-secondary text-sm font-medium">
                  ۳ پیام جدید
                </p>
              </div>
            </div>
            <button className="text-accent transition-opacity hover:opacity-70">
              <AiOutlineLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-primary-40 flex items-center justify-between rounded-2xl p-4 shadow-lg">
            <ThemeChange />
          </div>

          {/* User Profile — clicking opens the confirm popup */}
          <div
            onClick={openConfirm}
            className="border-accent/20 flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
            aria-label="پروفایل کاربر"
          >
            <div className="from-accent text-primary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-500 font-semibold">
              {initial}
            </div>

            <div className="flex-1">
              <p className="text-secondary text-sm font-medium">
                {username ?? "وارد نشده‌اید"}
              </p>
              <p className="text-light-dark text-xs">
                {/* You can show email here */}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="text-light-dark hover:text-accent"
              aria-label="باز کردن تأیید خروج"
            >
              <AiOutlineLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-signout"
          onClick={closeConfirm}
        >
          {/* Enhanced backdrop with animation */}
          <div className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-md duration-200" />

          {/* Modal card */}
          <div
            className="animate-in zoom-in-95 slide-in-from-bottom-4 relative z-10 w-full max-w-md duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-bg-1 border-light-white overflow-hidden rounded-2xl border shadow-2xl">
              {/* Header with icon */}
              <div className="border-light-white border-b p-6 pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg
                    className="h-8 w-8 text-red-600 dark:text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <h3
                  id="confirm-signout"
                  className="text-secondary text-center text-xl font-bold"
                >
                  خروج از حساب کاربری
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-light-dark text-center leading-relaxed">
                  آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
                  <br />
                  <span className="mt-2 block text-sm">
                    برای دسترسی مجدد باید دوباره وارد شوید.
                  </span>
                </p>

                {/* Buttons */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    onClick={closeConfirm}
                    className="hover:bg-primary-40 border-light-white text-secondary flex-1 cursor-pointer rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-200"
                  >
                    انصراف
                  </button>

                  <button
                    onClick={confirmSignOut}
                    disabled={loading}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-red-600"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        در حال خروج...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        خروج از حساب
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="MobileNav block lg:hidden">
        <div className="BottomNav from-primary-40 via-primary-40 fixed inset-x-0 bottom-0 z-50 w-full bg-gradient-to-t to-transparent px-2 lg:hidden">
          <div className="mobile-nav-links z-50 mx-auto mb-4 max-w-lg rounded-full bg-white p-2 shadow-2xl sm:p-3 lg:hidden">
            <ul className="flex items-center justify-between sm:gap-4">
              {filteredNavItems.map(({ href, label, icon }) => {
                const isActive = isHrefActive(href);
                const Icon = icon;
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
                      <Icon />
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
        </div>
      </nav>
    </>
  );
}
