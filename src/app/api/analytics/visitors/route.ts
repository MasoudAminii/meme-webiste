// app/api/analytics/visitors/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const isProduction =
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL_ENV === "production";

export async function GET() {
  try {
    // In production with Vercel token, use Vercel API
    if (
      isProduction &&
      process.env.VERCEL_TOKEN &&
      process.env.VERCEL_PROJECT_ID
    ) {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startTimestamp = startOfDay.getTime();
      const endTimestamp = now.getTime();

      const response = await fetch(
        `https://api.vercel.com/v1/analytics/visitors?projectId=${process.env.VERCEL_PROJECT_ID}&from=${startTimestamp}&to=${endTimestamp}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const totalVisitors =
          data.data?.reduce(
            (sum: number, entry: any) => sum + (entry.visitors || 0),
            0,
          ) || 0;
        return NextResponse.json({ visitorsToday: totalVisitors });
      }
    }

    // Fallback to database count (works in dev and production)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const activitiesToday = await prisma.activity.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    return NextResponse.json({ visitorsToday: activitiesToday });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ visitorsToday: 0 });
  }
}

export async function POST() {
  try {
    // In production with Vercel token, use Vercel API
    if (
      isProduction &&
      process.env.VERCEL_TOKEN &&
      process.env.VERCEL_PROJECT_ID
    ) {
      const response = await fetch(
        `https://api.vercel.com/v1/analytics/active-visitors?projectId=${process.env.VERCEL_PROJECT_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ activeVisitors: data.activeVisitors || 0 });
      }
    }

    // Fallback to database count
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const uniqueActiveUsers = await prisma.activity.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
        userId: {
          not: null,
        },
      },
    });

    return NextResponse.json({ activeVisitors: uniqueActiveUsers.length });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ activeVisitors: 0 });
  }
}
