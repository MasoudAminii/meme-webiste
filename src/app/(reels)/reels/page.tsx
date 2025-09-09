// app/reels/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حلقه فیلم",
  description:
    "جدیدترین رئال‌ها و ویدیوهای طنز و سرگرمی را در حلقه فیلم مشاهده کنید.",
};

export default async function Reels() {
  // Fetch all available slugs
  const items = await prisma.mediaItem.findMany({
    where: {
      src: {
        not: null,
      },
    },
    select: { slug: true },
  });

  // If no items found, show error message
  if (!items || items.length === 0) {
    return (
      <div className="RealsMedia min-h-[calc(100vh-9.5rem)]">
        <p className="mt-2 text-base font-normal">No reels found</p>
      </div>
    );
  }

  // Pick a random slug
  const randomIndex = Math.floor(Math.random() * items.length);
  const randomSlug = items[randomIndex].slug;

  // Redirect to the random slug
  redirect(`/reels/${randomSlug}`);
}
