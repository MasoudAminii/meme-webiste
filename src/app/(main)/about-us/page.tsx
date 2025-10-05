import Image from "next/image";
import type { Metadata } from "next";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "با تیم میم‌های شیعه آشنا شوید و بهترین میم‌های مذهبی و طنز شیعی را مشاهده کنید.",
};

export default async function AboutUs() {
  const data = await prisma.aboutUs.findFirst();

  // handle case where table is empty (shouldn't happen if you always have one row)
  if (!data) {
    return (
      <div className="AboutUs">
        <p>اطلاعات درباره ما پیدا نشد.</p>
      </div>
    );
  }

  return (
    <div className="AboutUs">
      <div className="Banner mb-6 md:mb-8">
        <div
          className="banner-image overflow-hidden rounded-[20px]"
          style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}
        >
          {" "}
          <Image
            src={`/banner/${data?.BannerUrl ?? "shia-meme-banner.jpg"}`}
            alt={data?.BannerUrl ?? "بنر میم شیعه"}
            width={1200}
            height={400}
            unoptimized
            priority
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
            className="h-64 sm:h-80"
          />
        </div>
      </div>

      <div className="description mb-6 md:mb-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">درباره ما</h1>
        <div className="mt-4 text-base leading-relaxed font-normal whitespace-pre-wrap sm:text-lg">
          {data?.description
            ?.split("\n")
            .map((paragraph, index) => <span key={index}>{paragraph}</span>) ??
            "میم‌های شیعه یک پلتفرم آنلاین است که به ارائه میم‌های مذهبی و طنز شیعی می‌پردازد. هدف ما ایجاد فضایی سرگرم‌کننده و آموزنده برای کاربران است تا از طریق میم‌ها با مفاهیم دینی آشنا شوند و لحظاتی شاد را تجربه کنند."}
        </div>
      </div>

      <div className="mb-28 lg:mb-8">
        <div className="flex w-full flex-col items-stretch justify-between rounded-2xl bg-gradient-to-r from-[#29209D] to-[#635AD9] p-4 text-white md:flex-row md:p-6">
          {/* Item 1 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 border-b border-white/10 py-4 md:border-b-0">
            <p className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {data.overviewContent}
            </p>
            <span className="text-base font-semibold sm:text-lg md:text-xl">
              {data.overviewLabel}
            </span>
          </div>

          {/* Item 2 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 border-b border-white/10 py-4 md:border-r md:border-b-0">
            <p className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {data.siteInfoContent}+
            </p>
            <span className="text-base font-semibold sm:text-lg md:text-xl">
              {data.siteInfoLabel}
            </span>
          </div>

          {/* Item 3 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 border-b border-white/10 py-4 md:border-r md:border-b-0">
            <p className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {data.statisticsContent}+
            </p>
            <span className="text-base font-semibold sm:text-lg md:text-xl">
              {data.statisticsLabel}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-1 flex-col gap-3 border-white/10 py-4 sm:flex-row sm:justify-center md:flex-col md:items-center md:justify-center md:border-r">
            <a
              className="w-full min-w-[147px] rounded-2xl border border-white px-4 py-3 text-center text-base sm:w-auto sm:text-lg"
              href={data.contactAdminUrl ?? "#"}
              target="_blank"
            >
              {data.contactAdminLabel ?? "ارتباط با ادمین"}
            </a>
            <a
              className="w-full min-w-[147px] rounded-2xl border border-white px-4 py-3 text-center text-base sm:w-auto sm:text-lg"
              href={data.financialSupportUrl ?? "#"}
              target="_blank"
            >
              {data.financialSupportLabel ?? "حمایت مالی"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
