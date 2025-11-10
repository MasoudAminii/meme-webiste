// app/reels/page.tsx
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "حلقه فیلم",
  description:
    "جدیدترین رئال‌ها و ویدیوهای طنز و سرگرمی را در حلقه فیلم مشاهده کنید.",
};

export const dynamic = "force-dynamic";

async function getLikeStates(postIds: number[]) {
  try {
    const cookieStore = await cookies();
    const likeStates = new Map<number, boolean>();

    for (const id of postIds) {
      const likedCookie = cookieStore.get(`liked_${id}`);
      likeStates.set(id, likedCookie?.value === "true");
    }

    return likeStates;
  } catch (error) {
    console.error("Error getting like states:", error);
    return new Map<number, boolean>();
  }
}

export default async function Reels() {
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

  const postIds = reels.map((r) => r.id);
  const likeStates = await getLikeStates(postIds);

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

  // Random start for main page
  const startIndex = Math.floor(Math.random() * allPosts.length);
  const reorderedPosts = [
    ...allPosts.slice(startIndex),
    ...allPosts.slice(0, startIndex),
  ];

  return (
    <div className="RealsMedia">
      <ClientReelsWrapper posts={reorderedPosts} initialIndex={0} />
    </div>
  );
}
