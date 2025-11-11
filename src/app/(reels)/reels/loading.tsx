// app/reels/[slug]/loading.tsx
import React from "react";

export default function ReelsLoading() {
  return (
    <div className="mx-auto flex h-[100dvh] w-full snap-y snap-mandatory flex-col justify-center overflow-y-hidden lg:h-[calc(100vh)] lg:gap-6">
      <div className="reel-item relative flex h-[100dvh] w-full flex-none snap-start items-end overflow-hidden lg:mb-8 lg:h-[calc(100vh-2.5rem)] lg:overflow-visible lg:py-6 lg:pb-1">
        {/* Desktop sidebar skeleton - hidden on mobile */}
        <div className="z-10 hidden max-w-xs min-w-xs lg:block">
          <div className="group relative overflow-hidden rounded-3xl p-6">
            {/* Author section skeleton */}
            <div className="relative mb-4 flex items-center gap-3.5">
              {/* Avatar skeleton */}
              <div className="relative">
                <div className="bg-skeleton-highlight/50 absolute -inset-1 animate-pulse rounded-full blur-md" />
                <div className="bg-skeleton relative h-12 w-12 animate-pulse rounded-full" />
              </div>

              {/* Author name skeleton */}
              <div className="flex flex-col gap-2">
                <div className="bg-skeleton h-5 w-32 animate-pulse rounded-md" />
                <div className="bg-skeleton/60 h-3 w-20 animate-pulse rounded-md" />
              </div>
            </div>

            {/* Caption skeleton */}
            <div className="relative mb-5 space-y-2">
              <div className="bg-skeleton h-4 w-full animate-pulse rounded-md" />
              <div className="bg-skeleton h-4 w-5/6 animate-pulse rounded-md" />
              <div className="bg-skeleton h-4 w-4/6 animate-pulse rounded-md" />
            </div>

            {/* Desktop action buttons skeleton */}
            <div className="flex items-center gap-3">
              <div className="bg-skeleton/60 h-12 w-24 animate-pulse rounded-full" />
              <div className="bg-skeleton/60 h-12 w-28 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Main video area */}
        <div className="relative h-full w-full sm:min-w-[400px] lg:max-w-[600px] lg:rounded-3xl">
          <div className="bg-skeleton-fg relative h-full w-full animate-pulse lg:rounded-3xl">
            {/* Top controls skeleton */}
            <div className="absolute top-6 right-4 left-4 z-20 flex flex-row-reverse items-center justify-between md:right-6 md:left-6 lg:justify-end">
              {/* Back button - mobile only */}
              <div className="bg-skeleton/40 h-12 w-12 animate-pulse rounded-full lg:hidden" />

              {/* Right side - Mute and views */}
              <div className="flex gap-3">
                <div className="bg-skeleton/40 h-12 w-12 animate-pulse rounded-full" />
                <div className="bg-skeleton/40 flex h-12 w-24 animate-pulse items-center gap-3 rounded-full px-4" />
              </div>
            </div>

            {/* Mobile like/share buttons - left side */}
            <div className="absolute bottom-10 left-4 z-20 flex flex-col gap-6 lg:hidden">
              {/* Like button skeleton */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center">
                  <div className="bg-skeleton h-8 w-8 animate-pulse rounded-full" />
                </div>
                <div className="bg-skeleton h-3 w-8 animate-pulse rounded-md" />
              </div>

              {/* Share button skeleton */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center">
                  <div className="bg-skeleton h-8 w-8 animate-pulse rounded-full" />
                </div>
                <div className="bg-skeleton h-3 w-12 animate-pulse rounded-md" />
              </div>
            </div>

            {/* Mobile caption section - bottom */}
            <div className="absolute right-4 bottom-10 left-4 z-20 lg:hidden">
              <div className="relative mb-3 flex items-center gap-2.5">
                {/* Avatar skeleton - smaller */}
                <div className="relative">
                  <div className="bg-skeleton-highlight/50 absolute -inset-0.5 animate-pulse rounded-full blur-sm" />
                  <div className="bg-skeleton relative h-9 w-9 animate-pulse rounded-full" />
                </div>

                {/* Author name skeleton - smaller */}
                <div className="flex flex-col gap-1.5">
                  <div className="bg-skeleton h-4 w-28 animate-pulse rounded-md" />
                  <div className="bg-skeleton/60 h-2.5 w-16 animate-pulse rounded-md" />
                </div>
              </div>

              {/* Caption skeleton - smaller */}
              <div className="space-y-2">
                <div className="bg-skeleton h-3.5 w-1/3 animate-pulse rounded-md" />
                <div className="bg-skeleton h-3.5 w-2/3 animate-pulse rounded-md" />
              </div>
            </div>

            {/* Progress bar skeleton - bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 lg:inset-x-5">
              <div className="relative py-3">
                <div className="bg-skeleton/40 absolute right-0 bottom-0 h-[2px] w-full animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
