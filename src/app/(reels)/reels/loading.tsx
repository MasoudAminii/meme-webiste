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
        <div className="relative h-full w-full animate-pulse overflow-hidden bg-gray-200 lg:rounded-2xl dark:bg-gray-700">
          {/* Inner caption/author hint (bottom center) */}

          {/* Top controls skeleton (mute + views) */}
          <div className="pointer-events-none absolute top-6 right-4 left-4 z-20 flex items-center justify-between md:right-6 md:left-6">
            <div className="flex items-center gap-3">
              {/* mute button skeleton */}
              <div className="relative h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />

              {/* views pill skeleton */}
              <div className="flex items-center gap-3 rounded-full bg-gray-300/80 px-2 py-4 text-sm font-semibold shadow-md">
                <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* play/pause button skeleton (top-right) */}
            <div className="h-14 w-14 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Action column skeleton (left bottom) */}
          <div className="pointer-events-none absolute bottom-8 left-4 z-20 flex flex-col items-center gap-5 md:left-6">
            {/* like button skeleton (large circular) */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="h-3 w-8 rounded-md bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* share button skeleton */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="h-3 w-12 rounded-md bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>

          {/* Description box skeleton (bottom-right) */}
          <div className="pointer-events-none absolute right-4 bottom-8 z-20 max-w-xs md:right-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5">
              <div className="mb-3 flex items-center gap-3">
                {/* avatar skeleton */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-lg font-bold text-white shadow-lg dark:bg-gray-600" />

                <div className="flex flex-col">
                  {/* name skeleton */}
                  <div className="mb-1 h-4 w-28 rounded-md bg-gray-300 dark:bg-gray-600" />
                  {/* role skeleton */}
                  <div className="h-3 w-20 rounded-md bg-gray-300 dark:bg-gray-600" />
                </div>
              </div>

              {/* caption skeleton lines */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded-md bg-gray-300 dark:bg-gray-600" />
                <div className="h-3 w-5/6 rounded-md bg-gray-300 dark:bg-gray-600" />
              </div>
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
