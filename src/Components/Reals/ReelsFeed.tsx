// ReelsFeed.tsx - Fixed version with no refresh issues
"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ReelsCard from "./ReelsCard";
import type { StaticImageData } from "next/image";

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
  author?: string;
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

  const getRoutePrefix = useCallback(() => "/reels", []);

  const updateUrl = useCallback(
    (slug: string, usePush = true) => {
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
          // ALWAYS use replaceState to prevent navigation/refresh
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
      }, 150); // Increased delay to prevent rapid updates
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
                if (slug) updateUrl(slug, true);
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
      className="no-scrollbar -webkit-overflow-scrolling-touch mx-auto flex h-[100dvh] w-full snap-y snap-mandatory flex-col overflow-y-auto lg:h-[calc(100vh-4rem)] lg:gap-6"
      role="list"
    >
      {posts.map((p, i) => {
        const resolvedSrc =
          typeof p.src === "string" ? p.src : (p.src as StaticImageData).src;

        return (
          <div
            key={p.id}
            data-index={i}
            data-slug={p.slug}
            className="reel-item flex h-[100dvh] w-full flex-none snap-start items-center justify-center overflow-hidden lg:h-[calc(100vh-4rem)] lg:overflow-visible"
            role="listitem"
          >
            <div className="relative h-full w-full lg:max-w-[600px]">
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
          </div>
        );
      })}
    </div>
  );
}
