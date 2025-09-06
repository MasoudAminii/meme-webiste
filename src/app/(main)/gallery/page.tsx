// app/gallery/page.tsx
import Link from "next/link";
import ShareButton from "./ShareButton"; // adjust path if different
import HoverVideo from "./HoverVideo"; // adjust path if different
import Image from "next/image";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "گالری میم‌ها",
  description:
    "به گالری میم‌های شیعه خوش آمدید. مجموعه‌ای از بهترین میم‌ها و پست‌های طنز مذهبی را در اینجا مشاهده کنید.",
};

type MediaItem = {
  id: number;
  src: string | null;
  slug?: string;
  createdAt: Date;
};

export default async function GalleryPage() {
  let items: MediaItem[] = [];

  try {
    items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        src: true,
        slug: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Prisma fetch failed, using fallback media.", error);
    // items remains empty
  }

  return (
    <div className="Gallery mb-28 lg:mb-8">
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {items.map((item, index) => {
          const src = item.src;
          if (!src) return null;

          const isVideo = src.toLowerCase().endsWith(".mp4");
          // <- changed to point to /reels
          const href = `/reels/${item.slug ?? String(item.id)}`;

          if (!isVideo) {
            return (
              <div
                key={item.id ?? index}
                className="group relative mb-4 overflow-hidden rounded-2xl"
              >
                <Link href={href} className="block">
                  <Image
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    width={500}
                    height={500}
                    quality={100}
                    className="h-auto w-full object-contain transition-transform duration-300"
                  />
                  <div className="absolute inset-0 hidden flex-col items-center justify-center gap-4 group-hover:flex group-hover:bg-black/30">
                    <span className="text-xl font-bold text-white">باز کن</span>
                  </div>
                </Link>
                <ShareButton src={src} />
              </div>
            );
          }

          return (
            <div key={item.id ?? index} className="mb-4">
              <HoverVideo src={src} href={href} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
