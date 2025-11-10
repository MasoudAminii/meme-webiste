"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Pwa from "../../../public/logo/icons/pwa.svg";

// Define the type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // Only render if prompt is available
  if (!deferredPrompt) return null;

  return (
    <>
      <div className="pwa rounded-xl bg-[#D6EAF8] p-6 text-center max-lg:hidden">
        <h5 className="mb-2 text-[21px] font-semibold text-black">
          استفاده از در حالت PWA
        </h5>
        <p className="py-3 leading-relaxed font-semibold text-black">
          برای استفاده بهتر و دسترسی راحت‌تر از حالت اپلیکیشن استفاده کنید.
        </p>
        <button
          onClick={handleInstallClick}
          className="btn–gradient mt-2 w-full cursor-pointer rounded-xl py-4 text-lg font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          دانلود نسخه PWA
        </button>
      </div>
      <div>
        <button
          onClick={handleInstallClick}
          className="image-logo relative overflow-hidden rounded-lg bg-[#FFFFFF] p-2 shadow-lg lg:hidden dark:bg-white/20"
        >
          <Image
            src={Pwa}
            alt="Logo"
            width={28}
            height={28}
            priority
            className="object-contain"
          />
        </button>
      </div>
    </>
  );
}
