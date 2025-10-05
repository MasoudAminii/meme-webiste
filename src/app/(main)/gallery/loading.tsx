// app/gallery/loading.tsx
import React from "react";

export default function LoadingGallery() {
  // some heights to mimic real posts
  const heights = ["h-48", "h-64", "h-80", "h-96"];

  return (
    <div className="Gallery mb-28 lg:mb-8">
      <div className="columns-2 gap-4 md:columns-3 2xl:columns-4">
        {Array.from({ length: 20 }).map((_, i) => {
          const heightClass = heights[i % heights.length];
          return (
            <div
              key={i}
              className={`bg-skeleton mb-4 w-full animate-pulse overflow-hidden rounded-2xl duration-300 ${heightClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
