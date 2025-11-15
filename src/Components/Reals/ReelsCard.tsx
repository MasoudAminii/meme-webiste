"use client";

import {
  incrementLike,
  decrementLike,
  incrementView,
} from "@/actions/postsActions";
import { FaShare, FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { FaHeart, FaEye, FaPause, FaPlay, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* ----------------------- Types ----------------------- */
// In ReelsCard.tsx, update the ReelsCardProps type (around line 15-28):
type ReelsCardProps = {
  postId: number;
  src: string;
  isVideo?: boolean;
  poster?: string | null;
  initialLikes?: number;
  initialViews?: number;
  initialLiked?: boolean;
  caption?: string;
  isActive?: boolean;
  author?: string | null; // CHANGE THIS LINE - was: string
  createdAt?: Date | string | null;
};
/* ----------------------- Helper: format seconds to mm:ss ----------------------- */
const formatTimeAgo = (date?: Date | string | null) => {
  if (!date) return "just now";

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
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
  author,
  createdAt,
}: ReelsCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Single state that tracks both actual and optimistic values
  // Simple state - no useOptimistic
  const [likeData, setLikeData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`liked_${postId}`);
      return {
        liked: stored === "true",
        likes: initialLikes,
      };
    }
    return {
      liked: initialLiked,
      likes: initialLikes,
    };
  });

  const [views, setViews] = useState<number>(initialViews);
  const [hasViewed, setHasViewed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`viewed_${postId}`) === "true";
    }
    return false;
  });

  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

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
      localStorage.setItem(`viewed_${postId}`, "true");

      // Call server action to increment view
      incrementView(postId).then((result) => {
        if (result.success) {
          setViews((prev) => prev + 1);
        }
      });
    }
  }, [isActive, hasViewed, postId]);

  // sync playing/paused state
  // Find the useEffect that handles video play/pause (around line 130) and update it:
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;

    v.muted = muted;

    if (isActive) {
      // Reset video to start when becoming active
      v.currentTime = 0;
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0; // ADD THIS - reset when not active
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

    const wasLiked = likeData.liked;

    // Optimistic update - instant UI feedback
    setLikeData((prev) => ({
      liked: !prev.liked,
      likes: prev.likes + (prev.liked ? -1 : 1),
    }));

    // Save to localStorage
    localStorage.setItem(`liked_${postId}`, (!wasLiked).toString());

    // Call server in background
    if (wasLiked) {
      decrementLike(postId).then((result) => {
        if (result.success) {
          setLikeData((prev) => ({
            ...prev,
            likes: result.likes,
          }));
        }
      });
    } else {
      incrementLike(postId).then((result) => {
        if (result.success) {
          setLikeData((prev) => ({
            ...prev,
            likes: result.likes,
          }));
        }
      });
    }
  }, [postId, likeData.liked]);

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
        // Video is playing, so pause it and show PAUSE icon
        v.pause();
        setShowPlayPauseIcon(true);
        setTimeout(() => setShowPlayPauseIcon(false), 1000);
      } else {
        // Video is paused, so play it and show PLAY icon
        v.play().catch(() => {});
        setShowPlayPauseIcon(true);
        setTimeout(() => setShowPlayPauseIcon(false), 1000);
      }
    },
    [isVideo],
  );

  const handleClickMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // near top of your component
  const progressColor = "#4f46e5";

  return (
    <div className="relative h-full w-full bg-black text-white lg:rounded-3xl">
      {/* MEDIA */}

      {isVideo ? (
        <video
          ref={(el) => {
            if (el && videoRef.current) {
              // Sync background video with main video
              const syncPlayback = () => {
                if (!videoRef.current || !el) return;
                if (videoRef.current.paused) {
                  el.pause();
                } else {
                  el.play().catch(() => {});
                }
                el.currentTime = videoRef.current.currentTime;
              };

              videoRef.current.addEventListener("play", syncPlayback);
              videoRef.current.addEventListener("pause", syncPlayback);
              videoRef.current.addEventListener("seeked", syncPlayback);
            }
          }}
          src={src}
          poster={poster ?? undefined}
          loop
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-contain opacity-60 blur-[80px] brightness-75"
          style={{ pointerEvents: "none" }}
        />
      ) : (
        <div className="absolute inset-0 scale-[1.15] opacity-60 blur-[80px] brightness-75">
          <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}

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
            togglePlayPause(e);
          }}
          className="absolute inset-0 z-10 h-full w-full overflow-hidden object-contain"
        />
      ) : (
        <div
          onClick={handleClickMedia}
          onTouchEnd={(e) => {
            e.stopPropagation();
            const now = Date.now();
            lastTouchTime.current = now;
          }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={caption || "media"}
              fill
              sizes="(min-width:1024px) 500px, 100vw"
              priority={isActive}
              className="object-contain"
            />
          </div>
        </div>
      )}
      {/* overlays */}
      {/* Play/Pause indicator - shows for 1 second */}
      {isVideo && showPlayPauseIcon && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-black/60 backdrop-blur-md"
          >
            {!isPlaying ? (
              <FaPause className="text-3xl text-white" />
            ) : (
              <FaPlay className="ml-1 text-3xl text-white" />
            )}
          </motion.div>
        </div>
      )}

      {/* Static pause button when video is paused */}
      {isVideo && !isPlaying && !showPlayPauseIcon && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="group pointer-events-auto relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-white/30 bg-black/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-black/80"
            aria-label="play"
          >
            <FaPlay className="ml-1 text-3xl text-white" />
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
          <FaArrowLeft className="text-base text-white md:text-xl" />
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
            {muted ? (
              <FaVolumeXmark className="text-base text-white/90 md:text-xl" />
            ) : (
              <FaVolumeHigh className="text-base text-white/90 md:text-xl" />
            )}
            <div className="absolute inset-0 rounded-full border-2 border-transparent" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-white/30 bg-black/50 px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md">
            <FaEye className="text-base text-white md:text-lg" />
            <span className="font-bold tracking-wide text-white">{views}</span>
          </div>
        </div>
      </div>
      {/* Action column - Mobile: inside, Desktop: outside */}
      <div className="absolute bottom-10 left-4 z-20 flex flex-col items-center gap-6 lg:hidden">
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className="group relative flex flex-col items-center gap-1"
          aria-label="like"
        >
          <motion.div
            animate={likeData.liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-11 w-11 items-center justify-center"
          >
            <FaHeart
              className={`text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors duration-200 ${
                likeData.liked ? "text-red-500" : "text-white"
              }`}
            />
          </motion.div>
          <span className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {likeData.likes}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="group relative flex flex-col items-center gap-1"
          aria-label="share"
        >
          <div className="flex h-11 w-11 items-center justify-center">
            <FaShare className="text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Share
          </span>

          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 -left-24 rounded-lg bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-800 shadow-lg"
            >
              Link copied
              <div className="absolute top-1/2 right-[-6px] h-3 w-3 -translate-y-1/2 rotate-45 bg-white" />
            </motion.div>
          )}
        </button>
      </div>

      {/* Caption section */}
      <div className="absolute right-4 bottom-10 left-4 z-20 lg:hidden">
        <div className="relative mb-3 flex items-center gap-2.5">
          {/* Avatar with animated gradient ring - smaller */}
          <div className="relative">
            <div className="animate-spin-slow absolute -inset-0.5 rounded-full bg-[#4f46e5] opacity-75 blur-sm" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#4f46e5] ring-2 ring-white/20">
              <span className="text-sm font-bold tracking-tight text-white drop-shadow-lg">
                {author ? author.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          </div>
          {/* Author name with enhanced styling - smaller */}
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {author || "Anonymous User"}
            </span>
            <span className="text-[10px] font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {createdAt ? formatTimeAgo(createdAt) : "just now"}
            </span>
          </div>
        </div>
        <p className="relative line-clamp-3 text-sm leading-relaxed font-normal tracking-wide text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {caption || "No caption provided"}
        </p>
      </div>

      {/* Desktop action buttons - left bottom */}

      {isVideo && (
        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 lg:inset-x-5"
          dir="rtl"
        >
          {/* Enhanced progress bar container */}
          <div
            className="group relative cursor-pointer py-3"
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
                document.removeEventListener("pointermove", handlePointerMove);
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
              if (seeking) return;

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
            <div className="absolute right-0 bottom-0 h-[2px] w-full rounded-full bg-white/20 transition-all duration-200 ease-out group-hover:h-[4px] group-hover:bg-white/25" />

            {/* Buffer track */}
            <div
              className="absolute right-0 bottom-0 h-[2px] rounded-full bg-white/30 transition-all duration-300 ease-out group-hover:h-[4px]"
              style={{
                width: `${Math.min(100, Math.max(0, Math.round(progress * 100) + 15))}%`,
                transition: "width 0.5s ease-out, height 0.2s ease-out",
              }}
            />

            {/* Main progress track */}
            <div
              className="absolute right-0 bottom-0 rounded-full transition-all duration-75 ease-out group-hover:h-[4px]"
              style={{
                height: seeking ? "4px" : "3px",
                width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                background: progressColor,
                filter: "brightness(1.1)",
              }}
            />

            {/* Glow effect */}
            <div
              className="absolute right-0 bottom-0 h-[3px] rounded-full opacity-40 blur-[1px] transition-all duration-75 ease-out group-hover:h-[4px] group-hover:opacity-60"
              style={{
                width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                background: progressColor,
                opacity: 0.4,
              }}
            />

            {/* Animated thumb (circle) */}
            <div
              className={`absolute -bottom-1 rounded-full transition-all duration-150 ease-out ${
                seeking
                  ? "scale-110 opacity-100"
                  : "scale-100 opacity-0 group-hover:opacity-100"
              }`}
              style={{
                right: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                transform: `translate(50%, 0%) ${seeking ? "scale(1.1)" : "scale(1)"}`,
                width: seeking ? "16px" : "14px",
                height: seeking ? "16px" : "14px",
                background: "#4f46e5", // ✅ solid main color
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
