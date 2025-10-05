"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HoverVideoProps {
  src: string;
  href: string;
}

export default function HoverVideo({ src, href }: HoverVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Reset ready state when src changes
    setIsReady(false);
    setDuration(null);

    const onLoadedMeta = () => {
      setDuration(v.duration || null);
      console.log("Duration loaded:", v.duration); // Debug log
    };

    const onCanPlay = () => {
      setIsReady(true);
      console.log("Video ready to play"); // Debug log
    };

    const onError = (e: Event) => {
      console.error("Video error:", e);
      setIsReady(true); // Show even on error to prevent infinite skeleton
    };

    // Check if already loaded (cached video)
    if (v.readyState >= 1) {
      setDuration(v.duration || null);
    }
    if (v.readyState >= 3) {
      setIsReady(true);
    }

    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, [src]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl ${!isReady ? "bg-skeleton" : "bg-transparent"}`}
      onMouseEnter={() => {
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        videoRef.current?.pause();
      }}
      style={{ transform: "translateZ(0)" }}
    >
      <Link href={href} className="block">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          className="block w-full object-cover"
          style={{
            opacity: isReady ? 1 : 0,
            transition: "opacity 180ms ease-in",
            display: "block",
            height: "auto",
          }}
        />
        <div className="absolute inset-0 hidden flex-col items-center justify-center gap-4 group-hover:flex group-hover:bg-black/30">
          <span className="text-xl font-bold text-white">باز کن</span>
        </div>
      </Link>

      {/* Duration badge - always visible when duration is available */}
      {duration !== null && !isNaN(duration) && duration > 0 && (
        <div className="pointer-events-none absolute top-2 left-2 z-20 rounded bg-black/80 px-2 py-1 font-mono text-xs font-semibold text-white shadow-lg select-none">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
}
