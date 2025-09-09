// app/gallery/loading.tsx
import React from "react";

export default function LoadingGallery() {
  // some heights to mimic real posts
  const heights = ["h-48", "h-64", "h-80", "h-96"];

  return (
    <div className="Gallery mb-28 lg:mb-8">
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const heightClass = heights[i % heights.length];
          return (
            <div
              key={i}
              className={`mb-4 w-full animate-pulse overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 ${heightClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
