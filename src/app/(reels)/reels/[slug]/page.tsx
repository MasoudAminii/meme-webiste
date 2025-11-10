// app/reels/[slug]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.mediaItem.findUnique({
    where: { slug },
    select: { description: true },
  });

  return {
    title: post ? `${slug} | حلقه فیلم` : "حلقه فیلم",
    description: post?.description || "مشاهده رئال‌ها و ویدیوهای سرگرمی",
  };
}

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

export default async function ReelSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get all reels
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
    notFound();
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

  // Find the index of the requested slug
  const foundIndex = allPosts.findIndex((p) => p.slug === slug);

  // If slug doesn't exist, show 404
  if (foundIndex === -1) {
    notFound();
  }

  // Reorder posts to start from the found slug
  const reorderedPosts = [
    ...allPosts.slice(foundIndex),
    ...allPosts.slice(0, foundIndex),
  ];

  return (
    <div className="RealsMedia">
      <ClientReelsWrapper posts={reorderedPosts} initialIndex={0} />
    </div>
  );
}
