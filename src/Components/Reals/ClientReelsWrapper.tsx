// components/Reals/ClientReelsWrapper.tsx
"use client";

import { StaticImageData } from "next/image";
import ReelsFeed from "./ReelsFeed";

type Post = {
  id: number;
  slug: string | null;
  src: string;
  isVideo: boolean;
  poster?: string | null;
  initialLikes: number;
  initialViews: number;
  initialLiked?: boolean; // ADD THIS
  caption: string;
  author?: string | null;
  // accept Date or ISO string (defensive)
  createdAt?: Date | string | null;
};

type Props = {
  initialPosts: Post[]; // Changed from 'posts'
  hasMore: boolean; // New prop
  initialIndex?: number;
};

// Helper function to resolve file paths
const resolveMediaPath = (src: string | StaticImageData): string => {
  if (typeof src !== "string") {
    return (src as StaticImageData).src;
  }

  // If it's already a full path (starts with http or /), return as is
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }

  // If it's just a filename, prepend with /gallery/
  return `/gallery/${src}`;
};

// Helper function to detect if file is video based on extension
const isVideoFile = (src: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".mkv"];
  return videoExtensions.some((ext) => src.toLowerCase().includes(ext));
};

export default function ClientReelsWrapper({
  initialPosts,
  hasMore: initialHasMore,
  initialIndex = 0,
}: Props) {
  // ADD THIS DEFENSIVE CHECK AT THE TOP
  if (
    !initialPosts ||
    !Array.isArray(initialPosts) ||
    initialPosts.length === 0
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>No reels available</p>
      </div>
    );
  }

  const loadMorePosts = async (cursor: number) => {
    const { getReelsPaginated } = await import("@/actions/postsActions");
    const result = await getReelsPaginated({ cursor, limit: 2 });
    return result;
  };
  const transformedPosts = initialPosts.map((post) => {
    const resolvedSrc = resolveMediaPath(post.src);

    return {
      id: post.id,
      slug: post.slug,
      src: resolvedSrc,
      isVideo: post.isVideo ?? isVideoFile(resolvedSrc),
      poster: post.poster ?? null,
      initialLikes: post.initialLikes ?? 0,
      initialViews: post.initialViews ?? 0,
      initialLiked: post.initialLiked ?? false,
      caption: post.caption ?? "",
      author: post.author ?? "Unknown",
      createdAt: post.createdAt,
    };
  });

  return (
    <ReelsFeed
      initialPosts={transformedPosts}
      initialHasMore={initialHasMore}
      loadMorePosts={loadMorePosts}
      initialIndex={initialIndex}
    />
  );
}
