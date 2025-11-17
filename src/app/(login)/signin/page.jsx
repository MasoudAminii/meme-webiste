"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
        callbackUrl: "/dashboard", // Add this
      });

      console.log("SignIn result:", result); // Add logging

      if (result?.error) {
        console.error("SignIn error:", result.error);
        setError("نام کاربری یا رمز عبور اشتباه است");
        setLoading(false);
      } else if (result?.ok) {
        // Force a hard redirect to ensure session is loaded
        window.location.href = "/dashboard";
      } else {
        // Handle unexpected response
        setError("خطای غیرمنتظره رخ داده است");
        setLoading(false);
      }
    } catch (err) {
      console.error("SignIn catch error:", err);
      setError("خطایی رخ داده است. لطفا دوباره تلاش کنید");
      setLoading(false);
    }
  }

  return (
    <div className="bg-primary-40 relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="pulse-orb-1 absolute -top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#29209d] to-[#635ad9] blur-3xl md:-top-1/2 md:h-[800px] md:w-[800px]"></div>
        <div className="pulse-orb-2 absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#635ad9] to-[#29209d] blur-3xl md:-bottom-1/2 md:h-[800px] md:w-[800px]"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(79, 70, 229, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="animate-slide-up relative z-10 w-full max-w-md px-6">
        {/* Glass card with glow */}
        <div className="group relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#29209d] to-[#635ad9] opacity-30 blur-xl transition-opacity duration-500 group-hover:opacity-50"></div>

          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl">
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="relative mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#29209d] to-[#635ad9] shadow-lg">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  <svg
                    className="relative z-10 h-10 w-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#171717] md:text-4xl">
                  پنل مدیریت
                </h1>
                <p className="text-base text-[#6a6f6a]">
                  برای ورود به داشبورد مدیریتی وارد شوید
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* Username field */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-semibold text-[#171717]">
                    نام کاربری
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute top-1/2 right-4 -translate-y-1/2 transition-colors duration-300 ${
                        focusedField === "username"
                          ? "text-[#4f46e5]"
                          : "text-[#6a6f6a]"
                      }`}
                    >
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="نام کاربری خود را وارد کنید"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField("")}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                      className="focus:ring-opacity-20 hover:border-opacity-50 w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-12 pl-4 text-[#171717] placeholder-[#6a6f6a] transition-all duration-300 hover:border-[#4f46e5] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-semibold text-[#171717]">
                    رمز عبور
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute top-1/2 right-4 -translate-y-1/2 transition-colors duration-300 ${
                        focusedField === "password"
                          ? "text-[#4f46e5]"
                          : "text-[#6a6f6a]"
                      }`}
                    >
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      placeholder="رمز عبور خود را وارد کنید"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                      className="focus:ring-opacity-20 hover:border-opacity-50 w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-12 pl-4 text-[#171717] placeholder-[#6a6f6a] transition-all duration-300 hover:border-[#4f46e5] focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <label className="group flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]"
                    />
                    <span className="text-sm text-[#6a6f6a] transition-colors group-hover:text-[#171717]">
                      مرا به خاطر بسپار
                    </span>
                  </label>
                  <button className="text-sm font-medium text-[#4f46e5] transition-colors duration-300 hover:text-[#29209d]">
                    فراموشی رمز عبور
                  </button>
                </div>

                {/* Error message */}
                {error && (
                  <div className="animate-slide-up flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative w-full transform cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-[#29209d] to-[#635ad9] px-6 py-4 font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <span className="relative z-10 flex flex-row-reverse items-end justify-center gap-1 text-base">
                    {loading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        در حال ورود...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        ورود به پنل
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -skew-x-12 transform bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-20"></div>
                </button>
              </div>
            </div>

            {/* Bottom decorative element */}
            <div className="h-2 bg-gradient-to-r from-transparent via-[#4f46e5]/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
