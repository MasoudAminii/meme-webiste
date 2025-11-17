// app/reels/[slug]/page.tsx
import { getReelsPaginated } from "@/actions/postsActions";
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Generate metadata for the page
// Modify your generateMetadata function
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.mediaItem.findUnique({
    where: { slug },
    select: {
      description: true,
      src: true,
    },
  });

  const ogImage = post?.src
    ? `/gallery/${post.src}` // Absolute URL
    : `/banner/main-banner.jpg`; // Fallback

  return {
    metadataBase: new URL(SITE_URL),
    title: post ? `${slug}` : "حلقه فیلم", // Removed extra " | "
    description: post?.description || "مشاهده رئال‌ها و ویدیوهای سرگرمی",
    openGraph: {
      title: post ? `${slug}` : "حلقه فیلم",
      description: post?.description || "مشاهده رئال‌ها و ویدیوهای سرگرمی",
      images: [
        {
          url: ogImage, // ✅ Use the fixed absolute URL
          width: 1200,
          height: 630,
          alt: slug,
        },
      ],
      type: "video.other", // ✅ Better OG type for video content
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function ReelSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get initial batch
  const initialData = await getReelsPaginated({ limit: 20 });

  // ADD THIS CHECK
  if (!initialData || !initialData.posts || initialData.posts.length === 0) {
    notFound();
  }

  // Find the requested slug
  const foundIndex = initialData.posts.findIndex((p) => p.slug === slug);

  if (foundIndex === -1) {
    notFound();
  }

  // Reorder to start from the found slug
  const reorderedPosts = [
    ...initialData.posts.slice(foundIndex),
    ...initialData.posts.slice(0, foundIndex),
  ];

  return (
    <div className="RealsMedia">
      <ClientReelsWrapper
        initialPosts={reorderedPosts}
        hasMore={initialData.hasMore}
        initialIndex={0}
      />
    </div>
  );
}
