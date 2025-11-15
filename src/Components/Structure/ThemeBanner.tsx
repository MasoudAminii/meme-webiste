// app/components/ThemeBanner.tsx
"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeBanner() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bannerSrc =
    resolvedTheme === "dark"
      ? "/banner/shia-meme-banner-black.jpg"
      : "/banner/shia-meme-banner-white.jpg";

  return (
    <div className="Banner" suppressHydrationWarning>
      <div
        className="banner-image overflow-hidden rounded-[20px]"
        style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}
        suppressHydrationWarning
      >
        {!mounted ? (
          <div className="bg-skeleton h-64 sm:h-80" suppressHydrationWarning />
        ) : (
          <Image
            key={resolvedTheme}
            src={bannerSrc}
            alt="شیعه میم"
            width={1200}
            height={400}
            unoptimized
            priority
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
            className="h-64 sm:h-80"
          />
        )}
      </div>
    </div>
  );
}
