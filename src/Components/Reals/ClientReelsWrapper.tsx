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
  author: string;
};

type Props = {
  posts: Post[];
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

export default function ClientReelsWrapper({ posts, initialIndex = 0 }: Props) {
  const transformedPosts = posts.map((post) => {
    const resolvedSrc = resolveMediaPath(post.src);

    return {
      ...post,
      src: resolvedSrc,
      isVideo:
        post.isVideo ??
        (typeof post.src === "string" ? isVideoFile(resolvedSrc) : false),
      initialLikes: post.initialLikes ?? 0,
      initialViews: post.initialViews ?? 0,
      initialLiked: post.initialLiked ?? false, // This line is correct
      caption: post.caption ?? "",
      author: post.author ?? "Unknown",
    };
  });

  return <ReelsFeed posts={transformedPosts} initialIndex={initialIndex} />;
}
