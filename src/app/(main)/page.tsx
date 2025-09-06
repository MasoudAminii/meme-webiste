// app/page.tsx
import React from "react";
import Image from "next/image";
import prisma from "@/lib/db"; // adjust path if needed
import type { Link as PrismaLink } from "@prisma/client";
import { Suspense } from "react";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

function isTailwindBgClass(s: string | null | undefined) {
  if (!s) return false;
  // simple heuristic: user might store tailwind utility classes like "bg-gradient-to-r from-... to-..."
  return (
    s.includes("bg-") ||
    s.includes("from-") ||
    s.includes("to-") ||
    s.includes("gradient-to")
  );
}

export default async function Home() {
  // fetch links from your DB
  const links: PrismaLink[] = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  // chunk into groups of 6 (matches positionClasses array size)
  const groups = chunkArray(links, 6);

  return (
    <div>
      <div className="Banner">
        <div className="banner-image overflow-hidden rounded-[20px] drop-shadow-xl">
          <Image
            src="/banner/shia-meme-banner.jpg"
            alt="شیعه میم"
            width={1200}
            height={400}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            className="h-auto w-full rounded-[20px] object-contain"
          />
        </div>
      </div>

      <div dir="ltr" className="Links mt-4 max-lg:mb-28 md:mt-8">
        <Suspense fallback={<LinksGridSkeleton groups={groups} />}>
          <LinksGrid groups={groups} />
        </Suspense>
      </div>
    </div>
  );
}

type Groups = PrismaLink[][];

async function LinksGrid({ groups }: { groups: Groups }) {
  // kept the artificial delay you had for testing Suspense
  return (
    <>
      {groups.map((group, gIdx) => (
        <div
          key={gIdx}
          className="mb-4 grid gap-4 md:mb-6 md:gap-6 lg:grid-cols-2"
        >
          {group.map((link, i) => {
            const base =
              "Link-Item w-full flex min-h-[120px] gap-6 lg:items-center lg:flex-row flex-col justify-between rounded-3xl p-4 sm:p-6 lg:p-8 lg:py-10";
            const positionClasses =
              [
                "max-lg:col-span-2 max-lg:row-span-1",
                "max-lg:col-span-1 max-lg:row-span-1",
                "max-lg:col-span-3 max-lg:row-span-1 max-lg:flex-row items-center",
                "max-lg:col-span-2 max-lg:row-span-2",
                "max-lg:col-span-1 max-lg:row-span-1",
                "max-lg:col-span-1 max-lg:row-span-1",
              ][i] ?? "";

            const dbBg = (link?.backgroundCss || "").trim();
            const useTailwindBg = isTailwindBgClass(dbBg);
            const inlineStyle: React.CSSProperties = {};
            const bgClass = useTailwindBg ? dbBg : "";

            if (!useTailwindBg && dbBg) inlineStyle.background = dbBg;

            const textStyle: React.CSSProperties = {};
            if (link?.textColor) textStyle.color = link.textColor;

            const rawLogo = link?.logoUrl || "default.png";
            const logoPath = rawLogo.startsWith("/")
              ? rawLogo
              : `/logo/Links/${rawLogo}`;

            return (
              <a
                key={link.id}
                href={link.targetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`${base} ${positionClasses} ${bgClass}`}
                style={inlineStyle}
              >
                <div className="image-icon h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
                  <Image
                    src={logoPath}
                    alt={link.label || "Link Icon"}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex flex-col gap-2 text-right">
                  <span
                    className="truncate text-lg leading-tight font-semibold text-white sm:text-2xl"
                    style={textStyle}
                  >
                    {link.label || "Untitled Link"}
                  </span>
                  <span
                    className="font-normal text-white sm:text-xl"
                    style={textStyle}
                  >
                    {link.username || "No Username"}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}

function LinksGridSkeleton({ groups }: { groups: Groups }) {
  return (
    <>
      {groups.map((group, gIdx) => (
        <div
          key={gIdx}
          className="mb-4 grid gap-4 md:mb-6 md:gap-6 lg:grid-cols-2"
        >
          {group.map((_, i) => {
            const base =
              "Link-Item w-full reletive flex min-h-[120px] bg-gray-200 dark:bg-gray-700 gap-6 lg:items-center lg:flex-row flex-col justify-between rounded-3xl p-4 sm:p-6 lg:p-8 lg:py-10";
            const positionClasses =
              [
                "max-lg:col-span-2 max-lg:row-span-1",
                "max-lg:col-span-1 max-lg:row-span-1",
                "max-lg:col-span-3 max-lg:row-span-1 max-lg:flex-row items-center",
                "max-lg:col-span-2 max-lg:row-span-2",
                "max-lg:col-span-1 max-lg:row-span-1",
                "max-lg:col-span-1 max-lg:row-span-1",
              ][i] ?? "";

            return (
              <div
                key={i}
                className={`${base} ${positionClasses} `}
                aria-hidden
              >
                {/* image placeholder */}
                <div className="image-icon h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
                  <div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
                </div>

                {/* text placeholders */}
                <div className="flex flex-1 flex-col items-end justify-end gap-2 text-right">
                  <div className="h-5 w-1/2 animate-pulse rounded-md bg-gray-300" />
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
