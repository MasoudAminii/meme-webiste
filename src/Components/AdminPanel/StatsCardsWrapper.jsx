import StatsCards from "./StatsCards";
import prisma from "@/lib/db";

async function getPosts() {
  return await prisma.mediaItem.findMany();
}

async function getAnalytics() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const visitorsResponse = await fetch(`${baseUrl}/api/analytics/visitors`, {
      cache: "no-store",
    });

    const activeResponse = await fetch(`${baseUrl}/api/analytics/visitors`, {
      method: "POST",
      cache: "no-store",
    });

    const visitorsData = visitorsResponse.ok
      ? await visitorsResponse.json()
      : { visitorsToday: 0 };
    const activeData = activeResponse.ok
      ? await activeResponse.json()
      : { activeVisitors: 0 };

    return {
      visitorsToday: visitorsData.visitorsToday || 0,
      activeVisitors: activeData.activeVisitors || 0,
    };
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return {
      visitorsToday: 0,
      activeVisitors: 0,
    };
  }
}

function calculateUptime() {
  const launchDate = new Date(process.env.WEBSITE_LAUNCH_DATE || "2024-01-01");
  const now = new Date();
  const diffMs = now.getTime() - launchDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function StatsCardsWrapper() {
  const [posts, analytics, uptime] = await Promise.all([
    getPosts(),
    getAnalytics(),
    calculateUptime(),
  ]);

  return (
    <StatsCards
      data={{
        posts: posts.length,
        users: analytics.activeVisitors,
        views: analytics.visitorsToday,
        uptime: uptime,
      }}
    />
  );
}
