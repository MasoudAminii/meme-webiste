// app/reels/[slug]/page.tsx
import React from "react";
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سرگرمی و طنز مذهبی",
  description:
    "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
};

// Generate static params for popular/recent posts only
export async function generateStaticParams() {
  try {
    // Only pre-generate the most popular or recent 10-20 posts
    const items = await prisma.mediaItem.findMany({
      where: {
        src: { not: null },
      },
      select: { slug: true },
      orderBy: [
        { views: "desc" }, // Most viewed first
        { createdAt: "desc" }, // Then most recent
      ],
      take: 15, // Pre-generate only top 15 posts
    });

    return items.map((item) => ({
      slug: item.slug,
    }));
  } catch (error) {
    console.warn("Failed to generate static params:", error);
    return []; // Fallback to dynamic rendering
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch a set of reels (adjust order / limit as you want)
  const reels = await prisma.mediaItem.findMany({
    where: {
      src: { not: null },
      slug: { not: null },
    },
    select: {
      id: true,
      slug: true,
      src: true,
      description: true,
      likes: true,
      views: true,
      author: true,
      createdAt: true,
    },
  });

  if (!reels || reels.length === 0) {
    return (
      <div className="RealsMedia min-h-[calc(100vh-9.5rem)]">
        <p className="mt-2 text-base font-normal">No reels found</p>
      </div>
    );
  }

  // remove items with null src before mapping
  const validReels = reels.filter((r) => !!r.src);

  const allPosts = reels.map((r) => ({
    id: r.id,
    slug: r.slug!,
    src: r.src!,
    isVideo: r.src!.toLowerCase().endsWith(".mp4"),
    poster: null, // Change from undefined to null (or remove this line entirely)
    initialLikes: r.likes ?? 0,
    initialViews: r.views ?? 0,
    caption: r.description ?? "",
    author: r.author ?? "@uploader",
  }));

  if (allPosts.length === 0) {
    return (
      <div className="RealsMedia min-h-[calc(100vh-9.5rem)]">
        <p className="mt-2 text-base font-normal">No valid media to show</p>
      </div>
    );
  }

  // Find the index of the current slug
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);

  // If slug not found, default to first post
  if (currentIndex === -1) {
    return (
      <div className="RealsMedia">
        <ClientReelsWrapper posts={allPosts} initialIndex={0} />
      </div>
    );
  }

  // Reorder posts: current post first, then all others in sequence
  const reorderedPosts = [
    allPosts[currentIndex],
    ...allPosts.slice(currentIndex + 1),
    ...allPosts.slice(0, currentIndex),
  ];

  return (
    <div className="RealsMedia">
      <ClientReelsWrapper posts={reorderedPosts} initialIndex={0} />
    </div>
  );
}
