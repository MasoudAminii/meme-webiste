// components/StatsCards.jsx
"use client";
import { useState, useEffect } from "react";
import {
  AiOutlineFileText,
  AiOutlineUser,
  AiOutlineEye,
  AiOutlineCloudServer,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
} from "react-icons/ai";

export default function StatsCards({
  data = { posts: 24, users: 120, views: 890, uptime: "99.9%" },
}) {
  const [animatedValues, setAnimatedValues] = useState({
    posts: 0,
    users: 0,
    views: 0,
    uptime: 0, // Empty string instead of data.uptime
  });

  // bars state for sparkline
  const [bars, setBars] = useState({});

  const cards = [
    {
      key: "posts",
      label: "تعداد پست‌ها",
      labelEn: "Total Posts",
      value: data.posts,
      icon: AiOutlineFileText,
      color: "accent",
      gradient: "from-accent to-purple-600",
      bgGradient: "from-primary-40 ",
      change: "+12%",
      changeType: "increase",
    },
    {
      key: "users",
      label: "کاربران فعال",
      labelEn: "Active Users",
      value: data.users,
      icon: AiOutlineUser,
      color: "accent",
      gradient: "from-accent to-blue-600",
      bgGradient: "from-primary-40 ",
      change: "+8%",
      changeType: "increase",
    },
    {
      key: "views",
      label: "بازدید امروز",
      labelEn: "Today's Views",
      value: data.views,
      icon: AiOutlineEye,
      color: "accent",
      gradient: "from-accent to-purple-700",
      bgGradient: "from-primary-40 ",
      change: "+23%",
      changeType: "increase",
    },
    {
      key: "uptime",
      label: "زمان فعالیت",
      labelEn: "Server Uptime",
      value: data.uptime,
      icon: AiOutlineCloudServer,
      color: "accent",
      gradient: "from-accent to-indigo-600",
      bgGradient: "from-primary-40 ",
      change: "+0.1%",
      changeType: "increase",
    },
  ];

  // Animate numbers on mount
  useEffect(() => {
    // Set uptime immediately without animation
    setAnimatedValues((prev) => ({
      ...prev,
      uptime: data.uptime,
    }));

    const animateNumber = (key, target) => {
      // Skip animation for non-numeric values
      if (typeof target !== "number") {
        return;
      }

      const duration = 2000;
      const steps = 60;
      const stepValue = target / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        setAnimatedValues((prev) => ({
          ...prev,
          [key]: Math.floor(current),
        }));
      }, duration / steps);
    };

    setTimeout(() => animateNumber("posts", data.posts), 100);
    setTimeout(() => animateNumber("users", data.users), 200);
    setTimeout(() => animateNumber("views", data.views), 300);
  }, [data]);

  // Generate sparkline bar heights only on client
  useEffect(() => {
    const newBars = {};
    cards.forEach((card) => {
      newBars[card.key] = Array.from(
        { length: 6 },
        () => Math.random() * 16 + 8,
      );
    });
    setBars(newBars);
  }, []);

  const getColorClasses = (color) => {
    return {
      icon: "text-accent",
      iconBg: "bg-accent/10",
      change: "text-accent",
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color);
        const displayValue =
          animatedValues[card.key] !== undefined
            ? animatedValues[card.key]
            : card.value;

        return (
          <div
            key={card.key}
            className={`border-light-white relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.bgGradient} group cursor-pointer shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-xl`}
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            {/* Animated background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
            />

            {/* Decorative elements */}
            <div className="bg-light-white absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full" />
            <div className="bg-light-white absolute bottom-0 left-0 h-20 w-20 -translate-x-10 translate-y-10 rounded-full" />

            <div className="relative p-6">
              {/* Header with icon */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-light-dark mb-1 text-sm font-medium">
                    {card.label}
                  </h3>
                  <p className="text-light-dark text-xs opacity-70">
                    {card.labelEn}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 ${colors.iconBg} shadow-sm transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>

              {/* Main value */}
              <div className="mb-3">
                <div className="text-secondary mb-1 text-3xl font-bold">
                  {typeof displayValue === "string" &&
                  displayValue.includes("%")
                    ? displayValue
                    : displayValue?.toLocaleString?.() || displayValue}
                </div>
              </div>

              {/* Change indicator */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    card.changeType === "increase"
                      ? "bg-accent/10 text-accent"
                      : "bg-red-100 text-red-700"
                  } `}
                >
                  {card.changeType === "increase" ? (
                    <AiOutlineArrowUp className="h-3 w-3" />
                  ) : (
                    <AiOutlineArrowDown className="h-3 w-3" />
                  )}
                  {card.change}
                </div>

                {/* Sparkline bars */}
                <div className="flex items-end gap-1 opacity-60">
                  {bars[card.key]?.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t ${card.gradient} rounded-full transition-all duration-300`}
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Hover effect border */}
            <div
              className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br ${card.gradient} pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              style={{
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
