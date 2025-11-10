// app/api/analytics/active-visitors/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/active-visitors?projectId=${process.env.VERCEL_PROJECT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      },
    );

    const data = await response.json();
    return NextResponse.json({ activeVisitors: data.activeVisitors || 0 });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ activeVisitors: 0 });
  }
}
