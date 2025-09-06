"use client";

import React, { useState } from "react";
import { RiShareBoxLine } from "react-icons/ri";
import { FaInstagram, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { FiCopy, FiCheck } from "react-icons/fi";
import { IconType } from "react-icons";
// If your react-icons package supports the fa6 set you can keep this import.
// Otherwise swap for another X/Twitter icon available in your react-icons version.
import { FaSquareXTwitter } from "react-icons/fa6";

interface ShareButtonProps {
  src: string;
}

type SocialButton = {
  name: string;
  icon: IconType;
  color?: string;
  bg?: string;
  onClick: () => void;
  useGradientIcon?: boolean;
};

export default function ShareButton({ src }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const imageUrl =
    typeof window !== "undefined" ? window.location.origin + src : "";

  const openWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    const text = imageUrl;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    openWindow(url);
  };

  const shareTelegram = () => {
    const text = "این تصویر را ببین:";
    const url = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(
      text,
    )}`;
    openWindow(url);
  };

  const shareX = () => {
    const text = "این تصویر را ببین:";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      imageUrl,
    )}`;
    openWindow(url);
  };

  const shareInstagram = () => {
    const appUrl = `instagram://share?text=${encodeURIComponent(imageUrl)}`;
    const webUrl = "https://www.instagram.com/";

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // try opening app first
      window.location.href = appUrl;
      // fallback to web after a short delay
      setTimeout(() => openWindow(webUrl), 1200);
    } else {
      openWindow(webUrl);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      alert("کپی لینک با مشکل مواجه شد. لطفاً دستی کپی کنید.");
    }
  };

  const socialButtons: SocialButton[] = [
    {
      name: "واتساپ",
      icon: FaWhatsapp,
      color: "text-[#25D366]",
      bg: "hover:bg-[#25D366]/10",
      onClick: shareWhatsApp,
    },
    {
      name: "تلگرام",
      icon: FaTelegramPlane,
      color: "text-[#2CA5E0]",
      bg: "hover:bg-[#2CA5E0]/10",
      onClick: shareTelegram,
    },
    {
      name: "X",
      icon: FaSquareXTwitter as IconType,
      color: "text-black",
      bg: "hover:bg-[black]/10",
      onClick: shareX,
    },
    {
      name: "اینستاگرام",
      icon: FaInstagram,
      color: "text-[#E1306C]", // instagram-ish solid color
      bg: "hover:bg-[#E1306C]/10",
      onClick: shareInstagram,
    },
  ];

  return (
    <>
      {/* Share Button */}
      <button
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="group absolute right-3 bottom-3 hidden cursor-pointer rounded-xl bg-white p-3 shadow-lg group-hover:flex"
        title="اشتراک‌ گذاری تصویر"
        aria-label="اشتراک‌ گذاری تصویر"
      >
        <RiShareBoxLine size={18} className="text-gray-700" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="animate-in slide-in-from-bottom-4 zoom-in-95 relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <RiShareBoxLine size={20} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  اشتراک‌ گذاری تصویر
                </h3>
              </div>

              {/* URL Preview */}
              <div className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-3">
                <p className="mb-1 text-xs text-gray-500">آدرس تصویر:</p>
                <p className="font-mono text-sm break-all text-gray-700">
                  {imageUrl}
                </p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="mb-6">
              <p className="mb-4 text-sm font-medium text-gray-600">
                انتخاب پلتفرم:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {socialButtons.map((social, index) => (
                  <button
                    key={social.name}
                    onClick={social.onClick}
                    className={`group flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      social.bg ?? ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    type="button"
                  >
                    {social.useGradientIcon ? (
                      <span className="rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-2">
                        <social.icon size={18} className="text-white" />
                      </span>
                    ) : (
                      <social.icon size={20} className={social.color} />
                    )}

                    <span className="text-gray-700">{social.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="mb-6">
              <button
                onClick={handleCopy}
                disabled={copied}
                className={`flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  copied
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
                type="button"
              >
                {copied ? (
                  <>
                    <FiCheck size={18} />
                    <span>لینک کپی شد!</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={18} />
                    <span>کپی لینک</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
                type="button"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
