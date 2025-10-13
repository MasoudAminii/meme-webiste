// ReelsFeed.tsx - Improved performance for initial scroll / faster URL updates
"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import ReelsCard from "./ReelsCard";
import type { StaticImageData } from "next/image";

type Post = {
  id: number;
  slug: string | null;
  src: string | StaticImageData;
  isVideo?: boolean;
  poster?: string | null; // Change this to allow null
  initialLikes?: number;
  initialViews?: number;
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
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // URL/history helpers (dynamic route detection)
  const urlTimeoutRef = useRef<number | null>(null);
  const lastUrlRef = useRef<string>("");

  // route is always /reels here
  const getRoutePrefix = useCallback(() => "/reels", []);

  const updateUrl = useCallback(
    (slug: string, usePush = true) => {
      if (lastUrlRef.current === slug) return;
      if (urlTimeoutRef.current) {
        window.clearTimeout(urlTimeoutRef.current);
      }
      // smaller debounce so URL reflects the new slug faster
      urlTimeoutRef.current = window.setTimeout(() => {
        const routePrefix = getRoutePrefix();
        const path = `${routePrefix}/${slug}`;
        if (usePush) {
          window.history.pushState({ slug }, "", path);
        } else {
          window.history.replaceState({ slug }, "", path);
        }
        lastUrlRef.current = slug;
      }, 100); // 100ms (was 250)
    },
    [getRoutePrefix],
  );

  /**
   * Scroll to an index.
   * opts.behavior: 'auto' for instant (used on initial navigation), 'smooth' for user navigation
   */
  const scrollToIndex = useCallback(
    (idx: number, opts?: { behavior?: ScrollBehavior }) => {
      const container = containerRef.current;
      const selector = `.reel-item[data-index="${idx}"]`;
      const el =
        (container?.querySelector<HTMLElement>(selector) as HTMLElement) ??
        (document.querySelector<HTMLElement>(selector) as HTMLElement);
      if (!el) return;

      const behavior = opts?.behavior ?? "smooth";

      // Prefer scrolling the container directly (faster and more predictable)
      if (container) {
        // offsetTop is relative to the container when the container is the offset parent.
        // To be safe compute top relative to container's scrollTop
        const top =
          el.offsetTop -
          (container.offsetTop
            ? container.offsetTop
            : container.getBoundingClientRect().top -
              container.getBoundingClientRect().top);
        try {
          container.scrollTo({ top, behavior });
        } catch {
          // fallback
          el.scrollIntoView({ behavior, block: "start" });
        }
        return;
      }

      // fallback if no container found
      el.scrollIntoView({ behavior, block: "start" });
    },
    [],
  );

  // initial scroll + replaceState — make initial scroll instant to avoid perceived slowness
  useEffect(() => {
    // Use a tiny delay to let layout settle but avoid long waits.
    const t = window.setTimeout(() => {
      // Use 'auto' so the initial jump is instant on navigation from gallery
      scrollToIndex(initialIndex, { behavior: "auto" });

      if (posts[initialIndex]?.slug) {
        lastUrlRef.current = posts[initialIndex].slug;
        const routePrefix = getRoutePrefix();
        window.history.replaceState(
          { slug: posts[initialIndex].slug },
          "",
          `${routePrefix}/${posts[initialIndex].slug}`,
        );
      }
    }, 0); // set to 0 (was 40ms)
    return () => window.clearTimeout(t);
  }, [initialIndex, posts, scrollToIndex, getRoutePrefix]);

  // IntersectionObserver (root = container so visibility is measured correctly)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.index ?? 0);

          // Always update active state based on visibility
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            if (idx !== currentIndexRef.current) {
              setCurrentIndex(idx);
              currentIndexRef.current = idx;
              const slug = posts[idx]?.slug;
              if (slug) updateUrl(slug, true);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6, 0.7], // Add multiple thresholds
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    const items = container.querySelectorAll<HTMLElement>(".reel-item");
    items.forEach((item) => observerRef.current?.observe(item));

    return () => observerRef.current?.disconnect();
  }, [posts, updateUrl]);

  // Natural touch scrolling with snap points
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let isTouchScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;

      touchStartY = e.touches[0].clientY;
      isTouchScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;

      const touchY = e.touches[0].clientY;
      const deltaY = Math.abs(touchStartY - touchY);

      if (deltaY > 10) {
        isTouchScrolling = true;
      }
    };

    const handleTouchEnd = () => {
      isTouchScrolling = false;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // popstate handling (handles both reels/ and gallery/ URLs)
  useEffect(() => {
    const onPop = () => {
      const pathSegments = window.location.pathname.split("/").filter(Boolean);
      const reelsIndex = pathSegments.indexOf("reels");
      const galleryIndex = pathSegments.indexOf("gallery");

      let slugFromPath = "";
      if (reelsIndex >= 0 && pathSegments[reelsIndex + 1]) {
        slugFromPath = pathSegments[reelsIndex + 1];
      } else if (galleryIndex >= 0 && pathSegments[galleryIndex + 1]) {
        slugFromPath = pathSegments[galleryIndex + 1];
      }

      if (!slugFromPath) return;
      const idx = posts.findIndex((p) => p.slug === slugFromPath);
      if (idx >= 0 && idx !== currentIndexRef.current) {
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
        // use instant scroll when popping state (avoid flicker)
        scrollToIndex(idx, { behavior: "auto" });
        lastUrlRef.current = slugFromPath;
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [posts, scrollToIndex]);

  // keyboard nav — keep smooth for a pleasant user feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent action if already scrolling
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

  // cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (urlTimeoutRef.current) window.clearTimeout(urlTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="no-scrollbar -webkit-overflow-scrolling-touch mx-auto flex h-[100dvh] w-full snap-y snap-mandatory flex-col overflow-y-auto lg:h-[calc(100vh-4rem)] lg:gap-6"
        role="list"
      >
        {posts.map((p, i) => {
          new Promise((r) => setTimeout(r, 0));
          // The src should already be resolved by ClientReelsWrapper
          const resolvedSrc =
            typeof p.src === "string" ? p.src : (p.src as StaticImageData).src;

          return (
            <div
              key={p.id}
              data-index={i}
              data-slug={p.slug}
              className="reel-item flex h-[100dvh] w-full flex-none snap-start items-center justify-center overflow-hidden lg:h-[calc(100vh-4rem)]"
              role="listitem"
            >
              <div className="relative h-full w-full lg:max-w-[600px]">
                <ReelsCard
                  src={resolvedSrc}
                  isVideo={p.isVideo}
                  poster={p.poster}
                  initialLikes={p.initialLikes}
                  initialViews={p.initialViews}
                  caption={p.caption}
                  isActive={i === currentIndex}
                />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
