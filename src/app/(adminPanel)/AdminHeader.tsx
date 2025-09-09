"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

const Header = () => {
  const pathname = usePathname() || "";

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

  // helper to determine active by pathname (exact or nested)
  const isHrefActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="bg-bg-1 border-light-white sticky top-0 z-50 flex min-h-screen w-80 min-w-[320px] flex-col justify-between border-r shadow-xl max-lg:hidden">
        {/* Header Top Section */}
        <div className="flex flex-col space-y-6 p-6">
          {/* Logo Section */}
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

          {/* Navigation Links */}
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

        {/* Header Bottom Section */}
        <div className="border-light-white space-y-4 border-t p-6">
          {/* Notifications */}
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

          {/* Theme Toggle */}
          <div className="from-primary-40 to-bg-gradient-2 flex items-center justify-between rounded-2xl bg-gradient-to-r p-4 transition-all duration-200 hover:shadow-lg">
            <div className="flex flex-col">
              <span className="text-secondary font-semibold">حالت تاریک</span>
              <span className="text-light-dark text-xs">Dark Mode</span>
            </div>
            <ThemeChange />
          </div>

          {/* User Profile */}
          <div className="hover:bg-primary-40 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors">
            <div className="from-accent text-primary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-500 font-semibold">
              ک
            </div>
            <div className="flex-1">
              <p className="text-secondary text-sm font-medium">کاربر مدیر</p>
              <p className="text-light-dark text-xs">admin@example.com</p>
            </div>
            <AiOutlineLeft className="text-light-dark h-4 w-4" />
          </div>
        </div>
      </nav>
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
};

export default Header;
