"use client";

import { useState, useRef, useEffect } from "react";
import ShareButton from "./ShareButton";
import Link from "next/link";

interface HoverVideoProps {
  src: string;
  href: string;
}

export default function HoverVideo({ src, href }: HoverVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [src]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      // no reset currentTime to keep position
    }
  };

  return (
    <div
      className="group relative mb-4 overflow-hidden rounded-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href}>
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          preload="metadata"
          className="h-auto w-full object-contain transition-transform duration-300"
          playsInline
        />

        {/* Duration: show only if not hovered */}
        {!isHovered && duration !== null && (
          <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 font-mono text-xs text-white select-none">
            {formatDuration(duration)}
          </div>
        )}
        {/* Hover Overlay */}
        <div className="absolute inset-0 hidden flex-col items-center justify-center gap-4 group-hover:flex group-hover:bg-black/30">
          <span className="text-xl font-bold text-white">باز کن</span>
        </div>
      </Link>
      <ShareButton src={src} />
    </div>
  );
}
