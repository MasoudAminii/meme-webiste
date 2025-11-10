"use client";
import {
  Database,
  Download,
  Plus,
  Settings,
  Shield,
  UserPlus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react"; // Add this import

const QuickActions = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { data: session } = useSession(); // Add this line
  const userRole = session?.user?.role; // Add this line

  const actions = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: "پست جدید",
      color: "from-blue-500 to-indigo-600",
      description: "ایجاد محتوای جدید",
      href: "/dashboard/posts?tab=create",
      disabled: false,
      allowedRoles: ["ADMIN", "WRITER"], // Add this
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: "دعوت کاربر",
      color: "from-emerald-500 to-teal-600",
      description: "افزودن کاربر جدید",
      href: "/dashboard/users?tab=create",
      disabled: false,
      allowedRoles: ["ADMIN"], // Add this - only ADMIN can use it
    },
    {
      icon: <Download className="h-5 w-5" />,
      label: "دریافت گزارش",
      color: "from-purple-500 to-pink-600",
      description: "صادرات داده‌ها",
      href: "/admin/invite-user",
      disabled: true,
      allowedRoles: ["ADMIN"],
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "تنظیمات امنیتی",
      color: "from-orange-500 to-red-600",
      description: "مدیریت دسترسی‌ها",
      href: "/admin/invite-user",
      disabled: true,
      allowedRoles: ["ADMIN"],
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "پشتیبان‌ گیری",
      color: "from-cyan-500 to-blue-600",
      description: "ذخیره اطلاعات",
      href: "/admin/invite-user",
      disabled: true,
      allowedRoles: ["ADMIN"],
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "بهینه‌سازی",
      color: "from-yellow-500 to-orange-600",
      description: "افزایش سرعت",
      href: "/admin/invite-user",
      disabled: true,
      allowedRoles: ["ADMIN"],
    },
  ];

  return (
    <div className="border-light-white rounded-2xl border p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-light-dark text-lg font-semibold">دسترسی سریع</h3>
        <button className="text-light-dark hover:text-secondary cursor-pointer">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
        {actions.map((action, index) => {
          // Check if action is disabled OR user doesn't have permission
          const isDisabled =
            action.disabled || !action.allowedRoles.includes(userRole);

          const content = (
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-xl opacity-0 blur-sm transition-opacity duration-300 ${!isDisabled ? "group-hover:opacity-100" : ""}`}
              />
              <div
                className={`border-light-white ${!isDisabled ? "hover:bg-primary-40 group-hover:border-transparent group-hover:shadow-xl" : ""} bg-bg-1 relative flex h-full flex-col items-center justify-center rounded-xl border p-4 transition-all duration-300`}
              >
                <div
                  className={`mx-auto h-12 w-12 bg-gradient-to-br ${action.color} mb-3 flex items-center justify-center rounded-xl text-white transition-transform duration-300`}
                >
                  {action.icon}
                </div>
                <span className="mb-1 block text-sm font-medium">
                  {action.label}
                </span>
                <span
                  className={`text-light-dark block text-xs transition-all duration-300 ${hoveredIndex === index ? "opacity-100" : "opacity-0"}`}
                >
                  {action.description}
                </span>
              </div>
            </>
          );

          return isDisabled ? (
            <div
              key={action.label}
              role="link"
              aria-disabled="true"
              tabIndex={-1}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="pointer-events-none relative h-full cursor-not-allowed opacity-50"
            >
              {content}
            </div>
          ) : (
            <Link
              key={action.label}
              href={action.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative h-full"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default QuickActions;
