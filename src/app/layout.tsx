// layout.tsx - Fixed Metadata

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME_FA = "شیعه‌ میم";

const KEYWORDS_FA = [
  "میم شیعه",
  "شیعه میم",
  "میم مذهبی",
  "میم اسلامی",
  "طنز مذهبی",
  "طنز شیعی",
  "میم فارسی",
  "میم ایرانی",
  "محرم",
  "اربعین",
  "عاشورا",
  "میم امام حسین",
  "میم اهل بیت",
  "میم علی",
  "طنز اسلامی",
  "شوخی مذهبی",
  "میم حلال",
  "سرگرمی مذهبی",
  "فرهنگ شیعی",
  "محتوای شیعی",
  "رسانه شیعی",
  "میم ساز",
  "ساخت میم",
  "جوک مذهبی",
  "لطیفه اسلامی",
  "میم تشیع",
];

const KEYWORDS_EN = [
  "shia meme",
  "islamic meme",
  "muslim meme",
  "shia humor",
  "islamic humor",
  "religious meme",
  "halal meme",
  "shia content",
  "muharram meme",
  "ashura meme",
  "arbaeen meme",
  "imam hussain",
  "ahlulbayt",
  "shia media",
  "islamic entertainment",
  "persian meme",
  "iranian meme",
];

const DESCRIPTION_FA =
  "شیعه‌میم؛ بزرگترین پلتفرم ساخت و اشتراک میم‌های شیعی و اسلامی. مرجع کامل محتوای طنز مذهبی، میم‌های اهل‌بیت، محرم، عاشورا و اربعین. با ابزار رایگان میم‌ساز، هزاران میم حلال و آموزنده.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // عناوین چندزبانه و بهینه شده
  title: {
    default: `${SITE_NAME_FA} | رسانه و مرجع میم‌های شیعی و اسلامی`,
    template: `%s | ${SITE_NAME_FA}`,
  },

  description: DESCRIPTION_FA,

  keywords: [...KEYWORDS_FA, ...KEYWORDS_EN],

  other: {
    "og:locale": "fa_IR",
    "og:locale:alternate": "en_US",
  },

  authors: [
    {
      name: `تیم ${SITE_NAME_FA}`,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME_FA,
  publisher: SITE_NAME_FA,

  // اضافه کردن canonical و alternates
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fa-IR": SITE_URL,
      "en-US": `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
    },
  },

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
    date: false,
  },

  // OpenGraph بهبود یافته
  openGraph: {
    title: `${SITE_NAME_FA} - رسانه و مرجع میم‌های شیعی`,
    description: DESCRIPTION_FA,
    siteName: SITE_NAME_FA,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/banner/main-banner.jpeg`, // ✅ FIXED
        width: 1200,
        height: 630,
        alt: `${SITE_NAME_FA} - میم‌های شیعی و اسلامی`,
        type: "image/jpeg",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },

  // Twitter/X بهبود یافته
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME_FA} - رسانه میم‌های شیعی`,
    description: DESCRIPTION_FA,
    images: [`${SITE_URL}/banner/main-banner.jpeg`], // ✅ Add SITE_URL
    creator: "@shiameme",
    site: "@shiameme",
  },

  // آیکون‌ها و تصاویر اپلیکیشن
  icons: {
    icon: [{ url: "./favicon.ico", sizes: "any" }],
    apple: [{ url: "./favicon.ico", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.webmanifest",

  // تنظیمات PWA برای اپل
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME_FA,
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.jpg",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1668-2388.jpg",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },

  // تنظیمات ربات‌ها
  robots: {
    index: true,
    follow: true,
    nocache: false, // بهتر است false باشد برای کش شدن
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
      noimageindex: false,
    },
  },

  // دسته‌بندی
  category: "Entertainment",
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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta property="og:locale" content="fa_IR" />
        <meta httpEquiv="Content-Language" content="fa" />
        <meta name="language" content="Persian" />
        <meta
          property="og:image"
          content={`${SITE_URL}/banner/main-banner.jpeg`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
      </head>
      <body
        className={`${estedad.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
