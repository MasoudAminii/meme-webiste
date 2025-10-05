// layout.tsx - Updated RootLayout

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "میم‌های شیعه - سرگرمی و طنز مذهبی",
    template: "میم‌های شیعه - %s",
  },
  description:
    "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
  keywords: [
    "میم شیعه",
    "طنز مذهبی",
    "میم‌های ایرانی",
    "سرگرمی شیعه",
    "خنده",
    "طنز اسلامی",
  ],
  authors: [{ name: "تیم میم‌های شیعه", url: "https://armanegar.com" }],
  creator: "میم‌های شیعه",

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
    date: false,
  },
  openGraph: {
    title: "میم‌های شیعه - سرگرمی و طنز مذهبی",
    description:
      "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
    siteName: "میم‌های شیعه",
    images: [
      {
        url: "/banner/shia-meme-banner.jpg",
        width: 1200,
        height: 630,
        alt: "میم‌های شیعه",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "میم‌های شیعه - سرگرمی و طنز مذهبی",
    description:
      "بهترین مجموعه میم‌های شیعه، لحظات خنده‌دار و آموزنده مذهبی برای همه‌ی دوستداران طنز و فرهنگ شیعی.",
    images: ["/banner/shia-meme-banner.jpg"],
    creator: "@yourtwitterhandle",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest", // Changed this
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "میم‌های شیعه", // Changed to your app name
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const estedad = localFont({
  variable: "--font-estedad",
  display: "swap",
  src: [
    {
      path: "../fonts/Estedad-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Estedad-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body
        className={`${estedad.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
