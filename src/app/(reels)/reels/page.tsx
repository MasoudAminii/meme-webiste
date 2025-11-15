// app/reels/page.tsx
import ClientReelsWrapper from "@/Components/Reals/ClientReelsWrapper";
import { getReelsPaginated } from "@/actions/postsActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حلقه فیلم",
  description:
    "جدیدترین رئال‌ها و ویدیوهای طنز و سرگرمی را در حلقه فیلم مشاهده کنید.",
};

export const dynamic = "force-dynamic";

export default async function Reels() {
  const initialData = await getReelsPaginated({ limit: 10 });

  // ADD THIS CHECK
  if (!initialData || !initialData.posts || initialData.posts.length === 0) {
    return (
      <div className="RealsMedia min-h-[calc(100vh-9.5rem)]">
        <p className="mt-2 text-base font-normal">No reels found</p>
      </div>
    );
  }

  return (
    <div className="RealsMedia">
      <ClientReelsWrapper
        initialPosts={initialData.posts}
        hasMore={initialData.hasMore}
        initialIndex={0}
      />
    </div>
  );
}
