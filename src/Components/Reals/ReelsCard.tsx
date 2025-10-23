"use client";

import { incrementView, toggleLike } from "@/actions/postsActions";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface HeartIconProps {
  size?: number;
  filled?: boolean;
}
const HeartIcon = ({ size = 28, filled = false }: HeartIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface VolumeIconProps {
  muted?: boolean;
  size?: number;
}
const VolumeIcon = ({ muted = false, size = 20 }: VolumeIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <polygon
      points="11,5 6,9 2,9 2,15 6,15 11,19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      opacity={muted ? "0.5" : "1"}
    />
    {!muted && (
      <>
        <path
          d="m19.07 4.93-1.41 1.41A6 6 0 0 1 19 12a6 6 0 0 1-1.34 5.66l1.41 1.41A8 8 0 0 0 21 12a8 8 0 0 0-1.93-7.07z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M15.54 8.46a4 4 0 0 1 0 7.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    )}
    {muted && (
      <line
        x1="23"
        y1="9"
        x2="17"
        y2="15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

interface PlayPauseIconProps {
  isPlaying?: boolean;
  size?: number;
}
const PlayPauseIcon = ({
  isPlaying = false,
  size = 24,
}: PlayPauseIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    {isPlaying ? (
      <>
        <rect x="6" y="4" width="4" height="16" rx="2" fill="currentColor" />
        <rect x="14" y="4" width="4" height="16" rx="2" fill="currentColor" />
      </>
    ) : (
      <polygon points="5,3 19,12 5,21" fill="currentColor" />
    )}
  </svg>
);

/* ----------------------- Types ----------------------- */
type ReelsCardProps = {
  postId: number;
  src: string;
  isVideo?: boolean;
  poster?: string | null;
  initialLikes?: number;
  initialViews?: number;
  initialLiked?: boolean; // ADD THIS
  caption?: string;
  isActive?: boolean;
};
/* ----------------------- Helper: format seconds to mm:ss ----------------------- */
const formatTime = (s: number) => {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/* ----------------------- ReelsCard (with scrubber) ----------------------- */
export default function ReelsCard({
  postId,
  src,
  isVideo = false,
  poster,
  initialLikes = 0,
  initialViews = 0,
  initialLiked = false,
  caption = "",
  isActive = false,
}: ReelsCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Single state that tracks both actual and optimistic values
  // Simple state - no useOptimistic
  const [likeData, setLikeData] = useState({
    liked: initialLiked,
    likes: initialLikes,
  });

  const [views, setViews] = useState<number>(initialViews);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  // Progress / seeking state
  const [progress, setProgress] = useState<number>(0); // 0..1
  const [duration, setDuration] = useState<number>(0);
  const [seeking, setSeeking] = useState<boolean>(false);

  const lastTouchTime = useRef<number>(0);
  const likeThrottleRef = useRef<boolean>(false);

  // Track view when component becomes active
  useEffect(() => {
    if (isActive && !hasViewed) {
      setHasViewed(true);

      // Call server action to increment view
      incrementView(postId).then((result) => {
        if (result.success && !result.alreadyViewed) {
          setViews((prev) => prev + 1);
        }
      });
    }
  }, [isActive, hasViewed, postId]);

  // sync playing/paused state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // when the parent says this is active, start playing
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;

    v.muted = muted;

    if (isActive) {
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [isActive, isVideo, muted]);

  // attach timeupdate / loadedmetadata handlers to update progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;

    const onLoaded = () => {
      setDuration(isFinite(v.duration) ? v.duration : 0);
      setProgress(v.duration > 0 ? v.currentTime / v.duration : 0);
    };

    const onTime = () => {
      if (!seeking && v.duration > 0) {
        setProgress(v.currentTime / v.duration);
      }
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);

    // if metadata already loaded
    if (v.readyState >= 1) onLoaded();

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [isVideo, seeking]);

  const handleToggleLike = useCallback(() => {
    if (likeThrottleRef.current) return;

    likeThrottleRef.current = true;
    setTimeout(() => (likeThrottleRef.current = false), 600);

    // Optimistic update - instant UI feedback
    setLikeData((prev) => ({
      liked: !prev.liked,
      likes: prev.likes + (prev.liked ? -1 : 1),
    }));

    // Call server in background
    toggleLike(postId).then((result) => {
      if (result.success) {
        // Update with actual server values
        setLikeData({
          liked: result.liked,
          likes: result.likes,
        });
      }
    });
  }, [postId]);

  const togglePlayPause = useCallback(
    (e?: React.SyntheticEvent) => {
      if (
        e &&
        typeof (e as React.SyntheticEvent).stopPropagation === "function"
      ) {
        (e as React.SyntheticEvent).stopPropagation();
      }
      if (!isVideo) return;
      const v = videoRef.current;
      if (!v) return;
      if (!v.paused && !v.ended) {
        v.pause();
      } else {
        v.play().catch(() => {});
      }
    },
    [isVideo],
  );

  const handleClickMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTouchTime.current < 600) return; // ignore ghost clicks
    togglePlayPause();
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: caption || "Share", url: shareUrl });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (error) {
        console.log("Copy failed:", error);
      }
    }
  };

  const applySeek = useCallback(
    (p: number) => {
      const v = videoRef.current;
      if (!v || !isVideo) return;
      const target = Math.max(
        0,
        Math.min(
          v.duration || duration || 0,
          p * (v.duration || duration || 0),
        ),
      );
      try {
        v.currentTime = target;
      } catch {}
    },
    [duration, isVideo],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white lg:rounded-3xl lg:shadow-2xl">
      {/* MEDIA */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster ?? undefined}
          loop
          playsInline
          preload="metadata"
          onClick={handleClickMedia}
          onTouchEnd={(e) => {
            e.stopPropagation();
            const now = Date.now();
            lastTouchTime.current = now;
            // handleTap();
          }}
          className="absolute inset-0 h-full w-full object-contain shadow-2xl lg:rounded-3xl"
        />
      ) : (
        <div
          onClick={handleClickMedia}
          onTouchEnd={(e) => {
            e.stopPropagation();
            const now = Date.now();
            lastTouchTime.current = now;
            // handleTap();
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={caption || "media"}
              fill
              sizes="(min-width:1024px) 500px, 100vw"
              priority={isActive}
              className="object-contain shadow-2xl lg:rounded-3xl"
            />
          </div>
        </div>
      )}
      {/* overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />
      {/* Big Heart */}

      {isVideo && !isPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="group pointer-events-auto relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-white/30 bg-black/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-black/80"
            aria-label="play"
          >
            <PlayPauseIcon isPlaying={false} size={36} />
          </button>
        </div>
      )}
      {/* Top controls */}
      <div className="absolute top-6 right-4 left-4 z-20 flex flex-row-reverse items-center justify-between md:right-6 md:left-6 lg:justify-end">
        {/* Left side - Return button */}
        <Link
          href="/"
          className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/50 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-black/70 lg:hidden"
          aria-label="return to home"
        >
          <div className="absolute inset-0 rounded-full bg-white/10" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* Right side - Mute and views */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setMuted((m) => {
                const next = !m;
                if (videoRef.current)
                  try {
                    videoRef.current.muted = next;
                  } catch {}
                return next;
              });
            }}
            className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/50 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-black/70"
            aria-label="toggle mute"
          >
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <VolumeIcon muted={muted} size={22} />
            <div className="absolute inset-0 rounded-full border-2 border-transparent" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md">
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-white"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="rgba(255,255,255,0.06)"
                />
              </svg>
            </div>
            <span className="font-bold tracking-wide text-white">{views}</span>
          </div>
        </div>
      </div>
      {/* Action column */}
      <div className="absolute bottom-24 left-4 z-20 flex flex-col items-center gap-5 md:left-6 lg:left-6">
        <button
          onClick={handleToggleLike}
          className="group relative flex flex-col items-center gap-2"
          aria-label="like"
        >
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-2xl backdrop-blur-md transition-all duration-500 ${likeData.liked ? "border-red-400/60 bg-red-600/20" : "border-white/30 bg-black/40 hover:border-white/50 hover:bg-black/60"}`}
          >
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <motion.div
              key={`heart-pulse-${likeData.likes}`}
              animate={likeData.liked ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <HeartIcon size={32} filled={likeData.liked} />
            </motion.div>
          </div>
          <span className="text-sm font-bold tracking-wide drop-shadow-lg">
            {likeData.likes}
          </span>
        </button>
        <button
          onClick={handleShare}
          className="group relative flex flex-col items-center gap-2"
          aria-label="share"
        >
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-black/40 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-cyan-400/60 hover:bg-black/60">
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="16,6 12,2 8,6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 rounded-full border border-transparent" />
          </div>
          <span className="text-sm font-bold tracking-wide drop-shadow-lg">
            Share
          </span>
          {copied && (
            <div className="absolute -top-20 rounded-xl border border-green-400/50 bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-2xl">
              <div className="flex items-center gap-2">
                <span>✓</span>Link Copied!
              </div>
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-green-600" />
            </div>
          )}
        </button>
      </div>
      {isVideo && (
        <div
          className="pointer-events-auto absolute right-4 bottom-4 left-4 z-30 md:right-6 md:left-6"
          dir="rtl"
        >
          <div className="flex items-center gap-4">
            {/* Total duration (now on the right in RTL) */}
            <div className="min-w-[44px] text-xs font-semibold tracking-wide text-white tabular-nums drop-shadow-lg">
              {formatTime(duration)}
            </div>

            {/* Enhanced progress bar container */}
            <div
              className="group relative flex-1 cursor-pointer py-3"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSeeking(true);

                const element = e.currentTarget;
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const x = rect.right - e.clientX;
                const newProgress = Math.max(0, Math.min(1, x / rect.width));
                setProgress(newProgress);
                applySeek(newProgress);

                const handlePointerMove = (moveEvent: PointerEvent) => {
                  if (!element) return;
                  const rect = element.getBoundingClientRect();
                  const x = rect.right - moveEvent.clientX;
                  const newProgress = Math.max(0, Math.min(1, x / rect.width));
                  setProgress(newProgress);
                  applySeek(newProgress);
                };

                const handlePointerUp = () => {
                  setSeeking(false);
                  document.removeEventListener(
                    "pointermove",
                    handlePointerMove,
                  );
                  document.removeEventListener("pointerup", handlePointerUp);
                };

                document.addEventListener("pointermove", handlePointerMove);
                document.addEventListener("pointerup", handlePointerUp);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSeeking(true);

                const element = e.currentTarget;
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const touch = e.touches[0];
                if (!touch) return;

                const x = rect.right - touch.clientX;
                const newProgress = Math.max(0, Math.min(1, x / rect.width));
                setProgress(newProgress);
                applySeek(newProgress);

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  moveEvent.preventDefault();
                  if (!element) return;

                  const rect = element.getBoundingClientRect();
                  const touch = moveEvent.touches[0];
                  if (!touch) return;

                  const x = rect.right - touch.clientX;
                  const newProgress = Math.max(0, Math.min(1, x / rect.width));
                  setProgress(newProgress);
                  applySeek(newProgress);
                };

                const handleTouchEnd = () => {
                  setSeeking(false);
                  document.removeEventListener("touchmove", handleTouchMove);
                  document.removeEventListener("touchend", handleTouchEnd);
                };

                document.addEventListener("touchmove", handleTouchMove, {
                  passive: false,
                });
                document.addEventListener("touchend", handleTouchEnd);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (seeking) return; // Don't handle click if we were dragging

                const element = e.currentTarget;
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const x = rect.right - e.clientX;
                const newProgress = Math.max(0, Math.min(1, x / rect.width));
                setProgress(newProgress);
                applySeek(newProgress);
              }}
              role="slider"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              {/* Background track */}
              <div className="absolute top-1/2 right-0 h-[2px] w-full -translate-y-1/2 rounded-full bg-white/20 transition-all duration-200 ease-out group-hover:h-[4px] group-hover:bg-white/25" />

              {/* Buffer track (shows loaded content) - RTL */}
              <div
                className="absolute top-1/2 right-0 h-[2px] -translate-y-1/2 rounded-full bg-white/30 transition-all duration-300 ease-out group-hover:h-[4px]"
                style={{
                  width: `${Math.min(100, Math.max(0, Math.round(progress * 100) + 15))}%`,
                  transition: "width 0.5s ease-out, height 0.2s ease-out",
                }}
              />

              {/* Main progress track - RTL */}
              <div
                className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white transition-all duration-75 ease-out group-hover:h-[4px]"
                style={{
                  height: seeking ? "4px" : "3px",
                  width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                  boxShadow: "0 0 6px rgba(255,255,255,0.4)",
                  filter: "brightness(1.1)",
                }}
              />

              {/* Glow effect - RTL */}
              <div
                className="absolute top-1/2 right-0 h-[3px] -translate-y-1/2 rounded-full bg-white opacity-40 blur-[1px] transition-all duration-75 ease-out group-hover:h-[4px] group-hover:opacity-60"
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                }}
              />

              {/* Animated thumb - RTL positioning */}
              <div
                className={`absolute top-1/2 rounded-full border-2 border-white/10 bg-white shadow-lg transition-all duration-150 ease-out ${
                  seeking
                    ? "scale-110 opacity-100"
                    : "scale-100 opacity-0 group-hover:opacity-100"
                }`}
                style={{
                  right: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                  transform: `translate(50%, -50%) ${seeking ? "scale(1.1)" : "scale(1)"}`,
                  width: seeking ? "16px" : "14px",
                  height: seeking ? "16px" : "14px",
                  boxShadow: seeking
                    ? "0 0 0 4px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.3)"
                    : "0 0 0 2px rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.2)",
                  backdropFilter: "blur(4px)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                }}
              />

              {/* Keyboard focus indicator */}
              <div className="absolute inset-0 rounded-full opacity-0 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent transition-opacity duration-200 focus-within:opacity-100" />
            </div>

            {/* Elapsed time (now on the left in RTL) */}
            <div className="min-w-[44px] text-xs font-semibold tracking-wide text-white tabular-nums drop-shadow-lg">
              {formatTime((duration || 0) * progress)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
