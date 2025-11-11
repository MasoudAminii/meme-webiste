// ReelsFeed.tsx - Fixed version with no refresh issues
"use client";

import { toggleLike } from "@/actions/postsActions";
import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaHeart, FaShare } from "react-icons/fa";
import ReelsCard from "./ReelsCard";

type Post = {
  id: number;
  slug: string | null;
  src: string | StaticImageData;
  isVideo?: boolean;
  poster?: string | null;
  initialLikes?: number;
  initialViews?: number;
  initialLiked?: boolean;
  caption?: string;
  // allow null because DB may return null
  author?: string | null;
  // accept Date or ISO string (defensive)
  createdAt?: Date | string | null;
};

type Props = {
  posts: Post[];
  initialIndex?: number;
};

export default function ReelsFeed({ posts, initialIndex = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(initialIndex);

  // Track if we're currently updating to prevent duplicate updates
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // URL/history helpers
  const urlTimeoutRef = useRef<number | null>(null);
  const lastUrlRef = useRef<string>("");
  const hasInitializedRef = useRef(false);

  const [postsLikeData, setPostsLikeData] = useState(() =>
    posts.reduce(
      (acc, post) => {
        acc[post.id] = {
          liked: post.initialLiked || false,
          likes: post.initialLikes || 0,
        };
        return acc;
      },
      {} as Record<number, { liked: boolean; likes: number }>,
    ),
  );

  const likeThrottleRef = useRef<Record<number, boolean>>({});

  const handleToggleLike = useCallback((postId: number) => {
    if (likeThrottleRef.current[postId]) return;

    likeThrottleRef.current[postId] = true;
    setTimeout(() => {
      likeThrottleRef.current[postId] = false;
    }, 600);

    // Optimistic update
    setPostsLikeData((prev) => ({
      ...prev,
      [postId]: {
        liked: !prev[postId].liked,
        likes: prev[postId].likes + (prev[postId].liked ? -1 : 1),
      },
    }));

    // Call server in background
    toggleLike(postId).then((result) => {
      if (result.success) {
        setPostsLikeData((prev) => ({
          ...prev,
          [postId]: {
            liked: result.liked,
            likes: result.likes,
          },
        }));
      }
    });
  }, []);

  const formatTimeAgo = (date?: Date | string | null) => {
    if (!date) return "همین الان";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} سال پیش`;
    if (months > 0) return `${months} ماه پیش`;
    if (days > 0) return `${days} روز پیش`;
    if (hours > 0) return `${hours} ساعت پیش`;
    if (minutes > 0) return `${minutes} دقیقه پیش`;
    return "همین الان";
  };

  const getRoutePrefix = useCallback(() => "/reels", []);

  const updateUrl = useCallback(
    (slug: string) => {
      // Prevent duplicate URL updates
      if (lastUrlRef.current === slug || isUpdatingRef.current) return;

      if (urlTimeoutRef.current) {
        window.clearTimeout(urlTimeoutRef.current);
      }

      isUpdatingRef.current = true;

      urlTimeoutRef.current = window.setTimeout(() => {
        const routePrefix = getRoutePrefix();
        const path = `${routePrefix}/${slug}`;

        try {
          // ALWAYS use replaceState - NEVER use pushState
          window.history.replaceState(
            { slug, scrollPos: window.scrollY },
            "",
            path,
          );
          lastUrlRef.current = slug;
        } catch (err) {
          console.error("Failed to update URL:", err);
        } finally {
          isUpdatingRef.current = false;
        }
      }, 200); // Increased delay to 200ms
    },
    [getRoutePrefix],
  );

  const scrollToIndex = useCallback(
    (idx: number, opts?: { behavior?: ScrollBehavior }) => {
      const container = containerRef.current;
      const selector = `.reel-item[data-index="${idx}"]`;
      const el = container?.querySelector<HTMLElement>(selector);

      if (!el) return;

      const behavior = opts?.behavior ?? "smooth";

      if (container) {
        const top = el.offsetTop;
        try {
          container.scrollTo({ top, behavior });
        } catch {
          el.scrollIntoView({ behavior, block: "start" });
        }
        return;
      }

      el.scrollIntoView({ behavior, block: "start" });
    },
    [],
  );

  // Initial scroll - only run once
  // Initial scroll - only run once
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const t = window.setTimeout(() => {
      scrollToIndex(initialIndex, { behavior: "auto" });

      if (posts[initialIndex]?.slug) {
        lastUrlRef.current = posts[initialIndex].slug;
        const routePrefix = getRoutePrefix();
        window.history.replaceState(
          { slug: posts[initialIndex].slug, scrollPos: 0 },
          "",
          `${routePrefix}/${posts[initialIndex].slug}`,
        );
      }
    }, 0);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount

  // IntersectionObserver - with better throttling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current?.disconnect();

    // Debounce mechanism for intersection updates
    let updateTimeout: number | null = null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Only process if not currently scrolling programmatically
        if (isScrollingRef.current || isUpdatingRef.current) return;

        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.index ?? 0);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            if (idx !== currentIndexRef.current) {
              // Clear any pending updates
              if (updateTimeout) window.clearTimeout(updateTimeout);

              // Debounce the update
              updateTimeout = window.setTimeout(() => {
                setCurrentIndex(idx);
                currentIndexRef.current = idx;
                const slug = posts[idx]?.slug;
                if (slug) updateUrl(slug);
              }, 100);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.7, 0.8, 0.9], // More aggressive threshold
        rootMargin: "-5% 0px -5% 0px", // Smaller margin
      },
    );

    const items = container.querySelectorAll<HTMLElement>(".reel-item");
    items.forEach((item) => observerRef.current?.observe(item));

    return () => {
      if (updateTimeout) window.clearTimeout(updateTimeout);
      observerRef.current?.disconnect();
    };
  }, [posts, updateUrl]);

  // Natural touch scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;
      // Touch handling - currently just preventing interference with buttons/links
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Popstate handling
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      e.preventDefault(); // Prevent browser navigation
      const state = e.state;
      if (!state?.slug) return;

      const idx = posts.findIndex((p) => p.slug === state.slug);
      if (idx >= 0 && idx !== currentIndexRef.current) {
        isScrollingRef.current = true;
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
        scrollToIndex(idx, { behavior: "auto" });
        lastUrlRef.current = state.slug;

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [posts, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;

      if (["ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        isScrollingRef.current = true;

        const next = Math.min(currentIndexRef.current + 1, posts.length - 1);
        scrollToIndex(next, { behavior: "smooth" });

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        isScrollingRef.current = true;

        const prev = Math.max(currentIndexRef.current - 1, 0);
        scrollToIndex(prev, { behavior: "smooth" });

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posts.length, scrollToIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (urlTimeoutRef.current) window.clearTimeout(urlTimeoutRef.current);
      if (scrollTimeoutRef.current)
        window.clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar -webkit-overflow-scrolling-touch mx-auto flex h-[100dvh] w-full snap-y snap-mandatory flex-col justify-center overflow-y-auto lg:h-[calc(100vh)] lg:gap-6"
      style={{ overscrollBehavior: "contain" }}
      role="list"
    >
      {posts.map((p, i) => {
        const handleShare = async () => {
          const shareUrl =
            typeof window !== "undefined" ? window.location.href : "";
          if (navigator.share) {
            try {
              await navigator.share({
                title: p.caption || "Share",
                url: shareUrl,
              });
            } catch (error) {
              console.log("Share failed:", error);
            }
          } else {
            try {
              await navigator.clipboard.writeText(shareUrl);
            } catch (error) {
              console.log("Copy failed:", error);
            }
          }
        };

        const resolvedSrc =
          typeof p.src === "string" ? p.src : (p.src as StaticImageData).src;

        return (
          <div
            key={p.id}
            data-index={i}
            data-slug={p.slug}
            className="reel-item relative flex h-[100dvh] w-full flex-none snap-start items-end overflow-hidden lg:mb-8 lg:h-[calc(100vh-2.5rem)] lg:overflow-visible lg:py-6 lg:pb-1"
            role="listitem"
          >
            {(p.caption || p.author) && (
              <div className="z-10 max-w-xs min-w-xs max-lg:hidden">
                <div className="group relative overflow-hidden rounded-3xl p-6">
                  {/* Shimmer effect on hover */}

                  {/* Author section */}
                  <div className="relative mb-4 flex items-center gap-3.5">
                    {/* Avatar with animated gradient ring */}
                    <div className="relative">
                      <div className="animate-spin-slow absolute -inset-1 rounded-full bg-[#4f46e5] opacity-75 blur-md" />
                      <div className="ring-light-white relative flex h-12 w-12 items-center justify-center rounded-full bg-[#4f46e5] ring-2">
                        <span className="text-primary text-lg font-bold tracking-tight drop-shadow-lg">
                          {p.author ? p.author.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    </div>

                    {/* Author name with enhanced styling */}
                    <div className="flex flex-col">
                      <span className="text-secondary text-base font-bold tracking-tight lg:text-lg">
                        {p.author || "Anonymous User"}
                      </span>
                      <span className="text-light-dark text-xs font-medium">
                        {p.createdAt ? formatTimeAgo(p.createdAt) : "همین الان"}
                      </span>
                    </div>
                  </div>

                  <p className="text-light-dark relative mb-5 line-clamp-3 text-[15px] leading-relaxed font-normal tracking-wide lg:text-base lg:leading-relaxed">
                    {p.caption}
                  </p>

                  {/* Desktop action buttons with enhanced design */}
                  <div className="hidden items-center gap-3 lg:flex">
                    <button
                      onClick={() => handleToggleLike(p.id)}
                      className="group/btn relative flex items-center gap-3 overflow-hidden rounded-full px-5 py-3 transition-all duration-300"
                      aria-label="like"
                    >
                      <div
                        className={`absolute inset-0 transition-all duration-500 ${
                          postsLikeData[p.id]?.liked
                            ? "bg-gradient-to-r from-rose-600/30 to-pink-600/30"
                            : "group-hover/btn:bg-primary-40"
                        }`}
                      />
                      <div
                        className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
                          postsLikeData[p.id]?.liked
                            ? "border-rose-400/50"
                            : "border-light-dark/20 group-hover/btn:border-light-dark/40"
                        }`}
                      />

                      <FaHeart
                        className={`relative text-xl transition-all duration-300 ${
                          postsLikeData[p.id]?.liked
                            ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "text-light-dark group-hover/btn:text-secondary group-hover/btn:scale-110"
                        }`}
                      />

                      <span className="text-light-dark group-hover/btn:text-secondary relative text-sm font-bold tracking-wide drop-shadow-lg">
                        {postsLikeData[p.id]?.likes || 0}
                      </span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="group/btn relative flex items-center gap-3 overflow-hidden rounded-full px-5 py-3 transition-all duration-300"
                      aria-label="share"
                    >
                      <div className="group-hover/btn:bg-accent/20 absolute inset-0 transition-all duration-300" />
                      <div className="border-light-dark/20 group-hover/btn:border-accent/50 absolute inset-0 rounded-full border-2 transition-colors duration-300" />

                      <FaShare className="text-light-dark group-hover/btn:text-accent relative text-lg transition-all duration-300 group-hover/btn:scale-110" />
                      <span className="text-light-dark group-hover/btn:text-accent relative text-sm font-bold tracking-wide drop-shadow-lg">
                        Share
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative h-full w-full bg-black sm:min-w-[400px] lg:max-w-[600px] lg:rounded-3xl">
              <ReelsCard
                postId={p.id}
                src={resolvedSrc}
                isVideo={p.isVideo}
                poster={p.poster}
                initialLikes={p.initialLikes}
                initialViews={p.initialViews}
                initialLiked={p.initialLiked}
                caption={p.caption}
                isActive={i === currentIndex}
              />
            </div>

            {/* Desktop action buttons */}
          </div>
        );
      })}
    </div>
  );
}
