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
import { useState } from "react";

const QuickActions = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const actions = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: "پست جدید",
      color: "from-blue-500 to-indigo-600",
      description: "ایجاد محتوای جدید",
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: "دعوت کاربر",
      color: "from-emerald-500 to-teal-600",
      description: "افزودن کاربر جدید",
    },
    {
      icon: <Download className="h-5 w-5" />,
      label: "دریافت گزارش",
      color: "from-purple-500 to-pink-600",
      description: "صادرات داده‌ها",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "تنظیمات امنیتی",
      color: "from-orange-500 to-red-600",
      description: "مدیریت دسترسی‌ها",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "پشتیبان‌گیری",
      color: "from-cyan-500 to-blue-600",
      description: "ذخیره اطلاعات",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "بهینه‌سازی",
      color: "from-yellow-500 to-orange-600",
      description: "افزایش سرعت",
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

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-xl opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="border-light-white hover:bg-primary-40 bg-bg-1 relative rounded-xl border p-4 transition-all duration-300 group-hover:border-transparent group-hover:shadow-xl">
              <div
                className={`mx-auto h-12 w-12 bg-gradient-to-br ${action.color} mb-3 flex items-center justify-center rounded-xl text-white transition-transform duration-300`}
              >
                {action.icon}
              </div>

              <span className="mb-1 block text-sm font-medium">
                {action.label}
              </span>

              <span
                className={`text-light-dark block text-xs transition-all duration-300 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                {action.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
export default QuickActions;
