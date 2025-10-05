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
  slug: string | null; // Changed from string | undefined to string | null
  createdAt: Date;
};
// Helper function to get the full media path
const getMediaPath = (src: string): string => {
  // If it's already a full path, return as is
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }

  // If it's just a filename, prepend with /gallery/
  return `/gallery/${src}`;
};

// Helper function to detect video files
const isVideoFile = (filename: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".mkv"];
  return videoExtensions.some((ext) => filename.toLowerCase().includes(ext));
};

export default async function GalleryPage() {
  let items: MediaItem[] = [];

  try {
    items = await prisma.mediaItem.findMany({
      where: {
        src: {
          not: null, // Only get items with media
        },
      },
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
      <div className="columns-2 gap-4 md:columns-3 2xl:columns-4">
        {items.map((item, index) => {
          const src = item.src;
          if (!src) return null;

          // Get the full media path
          const fullMediaPath = getMediaPath(src);
          const isVideo = isVideoFile(src);

          // <- changed to point to /reels
          const href = `/reels/${item.slug ?? String(item.id)}`;

          if (!isVideo) {
            return (
              <div
                key={index}
                className="group relative mb-4 overflow-hidden rounded-2xl"
              >
                <Link href={href} className="block">
                  <Image
                    src={fullMediaPath}
                    alt={`Gallery image ${index + 1}`}
                    width={500}
                    height={500}
                    quality={100}
                    className="block h-full w-full object-cover transition-transform duration-300" // removed rounded-2xl here
                  />
                  <div className="absolute inset-0 hidden flex-col items-center justify-center gap-4 group-hover:flex group-hover:bg-black/30">
                    <span className="text-xl font-bold text-white">باز کن</span>
                  </div>
                </Link>
                <ShareButton src={fullMediaPath} />
                {/* Pass full path to share button too */}
              </div>
            );
          }

          return (
            <div key={index} className="mb-4 rounded-2xl">
              <HoverVideo src={fullMediaPath} href={href} />{" "}
            </div>
          );
        })}
      </div>
    </div>
  );
}
