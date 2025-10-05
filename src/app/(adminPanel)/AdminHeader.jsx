// src/app/(adminPanel)/AdminHeader.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

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

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "داشبورد",
      labelEn: "Dashboard",
      icon: AiOutlineHome,
      href: "/dashboard",
    },
    {
      id: "about",
      label: "درباره",
      labelEn: "About",
      icon: AiOutlineSetting,
      href: "/dashboard/about",
    },
    {
      id: "link",
      label: "لینک‌ها",
      labelEn: "Links",
      icon: AiOutlineShareAlt,
      href: "/dashboard/links",
    },
    {
      id: "posts",
      label: "پست‌ها",
      labelEn: "Posts",
      icon: AiOutlineBarChart,
      href: "/dashboard/posts",
    },
    {
      id: "users",
      label: "کاربران",
      labelEn: "Users",
      icon: AiOutlineUser,
      href: "/dashboard/users",
    },
  ];

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
            {navItems.map((item, index) => {
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

          <div className="from-primary-40 to-bg-gradient-2 flex items-center justify-between rounded-2xl bg-gradient-to-r p-4 transition-all duration-200 hover:shadow-lg">
            <div className="flex flex-col">
              <span className="text-secondary font-semibold">حالت تاریک</span>
              <span className="text-light-dark text-xs">Dark Mode</span>
            </div>
            <ThemeChange />
          </div>

          {/* User Profile — clicking opens the confirm popup */}
          <div
            onClick={openConfirm}
            className="hover:bg-primary-40 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-signout"
          onClick={closeConfirm}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="confirm-signout"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              خروج از حساب
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              آیا مطمئن هستید که می‌خواهید خارج شوید؟ برای دسترسی دوباره به
              داشبورد باید دوباره وارد شوید.
            </p>

            <div className="mt-6 flex  gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                انصراف
              </button>

              <button
                onClick={confirmSignOut}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? (
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 118 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                ) : null}
                خروج
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="MobileNav block lg:hidden">
        <div className="BottomNav from-primary-40 via-primary-40 fixed inset-x-0 bottom-0 z-50 w-full bg-gradient-to-t to-transparent px-2 lg:hidden">
          <div className="mobile-nav-links z-50 mx-auto mb-4 max-w-lg rounded-full bg-white p-2 shadow-2xl sm:p-3 lg:hidden">
            <ul className="flex items-center justify-between sm:gap-4">
              {navItems.map(({ href, label, icon }) => {
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
