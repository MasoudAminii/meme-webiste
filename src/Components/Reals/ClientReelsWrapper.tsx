// components/Reals/ClientReelsWrapper.tsx
"use client";


import { StaticImageData } from "next/image";
import ReelsFeed from "./ReelsFeed";

type Post = {
  id: number;
  slug: string;
  src: string | StaticImageData;
  isVideo?: boolean;
  poster?: string;
  initialLikes?: number;
  initialViews?: number;
  caption?: string;
  author?: string;
};

type Props = {
  posts: Post[];
  initialIndex?: number;
};

export default function ClientReelsWrapper({ posts, initialIndex = 0 }: Props) {
  return <ReelsFeed posts={posts} initialIndex={initialIndex} />;
}
