// app/gallery/[slug]/loading.tsx
import React from "react";

export default function ReelsLoading() {
  // Match the same clamp used in ReelsFeed

  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center lg:h-[calc(100vh-4rem)] lg:max-w-[600px] lg:px-4">
      <div
        className="reel-item flex h-full w-full flex-none snap-start items-center justify-center overflow-hidden lg:rounded-2xl"
        style={{ height: "100%" }}
      >
        {/* Main media area skeleton (fills parent's height) */}
        <div className="bg-skeleton relative h-full w-full animate-pulse overflow-hidden lg:rounded-2xl">
          {/* Inner caption/author hint (bottom center) */}

          {/* Top controls skeleton (mute + views) */}
          <div className="pointer-events-none absolute top-6 right-4 left-4 z-20 flex items-center justify-between md:right-6 md:left-6">
            <div className="flex items-center gap-3">
              {/* mute button skeleton */}
              <div className="bg-skeleton-fg relative h-12 w-12 rounded-full" />

              {/* views pill skeleton */}
              <div className="bg-skeleton/20 flex items-center gap-3 rounded-full px-2 py-4 text-sm font-semibold shadow-md">
                <div className="bg-skeleton-fg h-4 w-4 rounded-full" />
                <div className="bg-skeleton-fg h-4 w-12 rounded-md" />
              </div>
            </div>

            {/* play/pause button skeleton (top-right) */}
            <div className="h-14 w-14 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Action column skeleton (left bottom) */}
          <div className="pointer-events-none absolute bottom-8 left-4 z-20 flex flex-col items-center gap-5 md:left-6">
            {/* like button skeleton (large circular) */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-skeleton-fg relative flex h-16 w-16 items-center justify-center rounded-full" />
              <div className="bg-skeleton-fg h-3 w-8 rounded-md" />
            </div>

            {/* share button skeleton */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-skeleton-fg relative flex h-16 w-16 items-center justify-center rounded-full" />
              <div className="bg-skeleton-fg h-3 w-12 rounded-md" />
            </div>
          </div>

          {/* Optional center "big-heart" hint (keeps layout visually consistent) */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-transparent opacity-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
