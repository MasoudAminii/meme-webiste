// app/reels/[slug]/page.tsx
import React from "react";
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "سرگرمی و طنز مذهبی",
  description:
    "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
};

export const dynamic = "force-dynamic";

// Only pre-generate the most popular posts
export async function generateStaticParams() {
  try {
    const items = await prisma.mediaItem.findMany({
      where: {
        src: { not: null },
        slug: { not: null },
      },
      select: { slug: true },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      take: 15,
    });

    return items
      .filter((item) => item.slug !== null)
      .map((item) => ({
        slug: item.slug as string,
      }));
  } catch (error) {
    console.warn("Failed to generate static params:", error);
    return [];
  }
}

// Helper to get like state from cookies
async function getLikeStates(postIds: number[]) {
  try {
    const cookieStore = await cookies();
    const likeStates = new Map<number, boolean>();

    for (const id of postIds) {
      const likedCookie = cookieStore.get(`liked_${id}`);
      likeStates.set(id, likedCookie?.value === "true"); // ← This line is already correct!
    }

    return likeStates;
  } catch (error) {
    console.error("Error getting like states:", error);
    return new Map<number, boolean>();
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Single optimized query to fetch all reels
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
    orderBy: [{ createdAt: "desc" }],
  });

  if (!reels || reels.length === 0) {
    return (
      <div className="RealsMedia min-h-[calc(100vh-9.5rem)]">
        <p className="mt-2 text-base font-normal">No reels found</p>
      </div>
    );
  }

  // Get all like states in one go
  const postIds = reels.map((r) => r.id);
  const likeStates = await getLikeStates(postIds);

  // Transform data - no extra queries needed
  const allPosts = reels.map((r) => ({
    id: r.id,
    slug: r.slug!,
    src: r.src!,
    isVideo: r.src!.toLowerCase().endsWith(".mp4"),
    poster: null,
    initialLikes: r.likes,
    initialViews: r.views,
    initialLiked: likeStates.get(r.id) ?? false,
    caption: r.description ?? "",
    author: r.author ?? "@uploader",
  }));

  // Find the current post index
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);

  // If slug not found, show 404
  if (currentIndex === -1) {
    notFound();
  }

  // Reorder: current post first, then rest in order
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
