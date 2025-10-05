"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Animated gradient background */}
      <div className="animate-gradient-shift fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      </div>

      {/* Interactive floating orbs */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {[
          { size: 350, x: 10, y: 5, delay: 0, color: "from-purple-500/30" },
          { size: 250, x: 85, y: 75, delay: 1, color: "from-blue-500/30" },
          { size: 300, x: 65, y: 55, delay: 2, color: "from-pink-500/30" },
          { size: 200, x: 75, y: 25, delay: 1.5, color: "from-cyan-500/30" },
        ].map((orb, i) => (
          <div
            key={i}
            className={`animate-float-slow absolute rounded-full opacity-0 blur-3xl transition-opacity duration-1000 ${mounted ? "opacity-100" : ""}`}
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, ${orb.color === "from-purple-500/30" ? "rgba(168, 85, 247, 0.3)" : orb.color === "from-blue-500/30" ? "rgba(59, 130, 246, 0.3)" : orb.color === "from-pink-500/30" ? "rgba(236, 72, 153, 0.3)" : "rgba(6, 182, 212, 0.3)"} 0%, transparent 70%)`,
              animationDelay: `${orb.delay}s`,
              transform: mounted
                ? `translate(${(mousePos.x - window.innerWidth / 2) / 50}px, ${(mousePos.y - window.innerHeight / 2) / 50}px)`
                : "translate(0, 0)",
            }}
          />
        ))}
      </div>

      {/* Particle effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-[2]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8 max-sm:p-6">
        <div
          className={`w-full max-w-[650px] text-center transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          {/* Glowing 404 */}
          <div className="group relative mb-8 inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-75" />
            <div className="relative text-[clamp(7rem,22vw,16rem)] leading-none font-black tracking-tighter">
              {["۴", "۰", "۴"].map((digit, i) => (
                <span
                  key={i}
                  className="animate-pulse-slow inline-block cursor-default bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent transition-transform duration-300 hover:scale-110"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    textShadow: "0 0 80px rgba(168, 85, 247, 0.5)",
                  }}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          {/* Error message with glow */}
          <div className="mb-6 space-y-2">
            <h1 className="animate-fade-in-up bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-[clamp(1.75rem,4vw,3rem)] font-bold text-transparent">
              صفحه مورد نظر یافت نشد
            </h1>
            <div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          </div>

          {/* Description */}
          <p
            className="animate-fade-in-up mx-auto mb-10 max-w-[550px] text-[clamp(1rem,2.5vw,1.2rem)] leading-relaxed text-slate-300 opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا ممکن است جابجا
            شده باشد. لطفاً آدرس را بررسی کنید یا به صفحه اصلی بازگردید.
          </p>

          {/* Enhanced button */}
          <Link
            href="/"
            className="group animate-fade-in-up relative inline-flex items-center gap-3 overflow-hidden rounded-2xl px-12 py-5 text-lg font-semibold text-white opacity-0 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-95 max-sm:px-8 max-sm:py-4 max-sm:text-base"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-transform duration-500 group-hover:scale-110" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            {/* Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-2xl border border-white/20 transition-colors duration-500 group-hover:border-white/40" />

            {/* Icon */}
            <svg
              className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>

            {/* Text */}
            <span className="relative z-10">بازگشت به خانه</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </>
  );
}
