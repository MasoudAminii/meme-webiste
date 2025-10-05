import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "میم‌های شیعه",
    short_name: "میم شیعه",
    description:
      "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    dir: "rtl",
    lang: "fa",
    orientation: "portrait",
    icons: [
      {
        src: "/logo/shia-meme.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", // Changed from "any maskable"
      },
      {
        src: "/logo/shia-meme.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // Changed from "any maskable"
      },
      {
        src: "/logo/shia-meme.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any", // Added separate icon for "any" purpose
      },
      {
        src: "/logo/shia-meme.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any", // Added separate icon for "any" purpose
      },
    ],
  };
}
