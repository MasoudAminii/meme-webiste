// app/admin/dashboard/page.jsx
import StatsCardsWrapper from "@/Components/AdminPanel/StatsCardsWrapper";
import QuickActions from "@/Components/AdminPanel/QuickActions";
import RecentActivity from "@/Components/AdminPanel/RecentActivity";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { getActivities } from "@/actions/activityActions";
import { Suspense } from "react";
import prisma from "@/lib/db"; // ADD THIS LINE

// Skeleton loading component for StatsCards
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border-light-white from-primary-40 relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-lg backdrop-blur-sm"
        >
          {/* Decorative elements */}
          <div className="bg-light-white absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full opacity-50" />
          <div className="bg-light-white absolute bottom-0 left-0 h-20 w-20 -translate-x-10 translate-y-10 rounded-full opacity-50" />

          <div className="relative p-6">
            {/* Header with icon */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="bg-skeleton h-4 w-24 animate-pulse rounded" />
                <div className="bg-skeleton-highlight h-3 w-20 animate-pulse rounded" />
              </div>

              <div className="bg-accent/10 rounded-xl p-3 shadow-sm">
                <div className="bg-skeleton h-6 w-6 animate-pulse rounded" />
              </div>
            </div>

            {/* Main value */}
            <div className="mb-3">
              <div className="bg-skeleton h-9 w-20 animate-pulse rounded" />
            </div>

            {/* Change indicator and sparkline */}
            <div className="flex items-center justify-between">
              <div className="bg-skeleton h-6 w-16 animate-pulse rounded-full" />

              {/* Sparkline bars skeleton */}
              <div className="flex items-end gap-1 opacity-60">
                {[12, 16, 10, 14, 18, 13].map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-skeleton w-1 animate-pulse rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loading component for RecentActivity
function RecentActivitySkeleton() {
  return (
    <div className="border-light-white bg-bg-1 rounded-2xl border p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-skeleton h-6 w-32 animate-pulse rounded" />
          <div className="bg-skeleton h-6 w-12 animate-pulse rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-skeleton h-8 w-24 animate-pulse rounded-lg" />
          <div className="bg-skeleton h-8 w-8 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Activities list skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl p-3">
            {/* Avatar with badge */}
            <div className="relative">
              <div className="bg-skeleton h-10 w-10 animate-pulse rounded-full" />
              <div className="bg-skeleton-highlight absolute -right-1 -bottom-1 h-5 w-5 animate-pulse rounded-full" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="bg-skeleton h-4 w-48 animate-pulse rounded" />
                  <div className="bg-skeleton-highlight h-3 w-32 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrapper component for RecentActivity that fetches data
async function RecentActivityWrapper() {
  const activitiesResult = await getActivities("all", 20);
  const initialActivities = activitiesResult.activities || [];

  return <RecentActivity initialActivities={initialActivities} />;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/signin");
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { id: true },
    });

    if (!userExists) {
      redirect("/signin");
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    redirect("/signin");
  }

  return (
    <div className="max-lg:mb-24 max-sm:mb-20">
      <div className="bg-bg-1 mb-6 flex items-center justify-between rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
          <p className="text-light-dark mt-1">نمای کلی آمار و عملکرد سیستم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-bg-1 rounded-2xl p-4 shadow-sm">
            <Suspense fallback={<StatsCardsSkeleton />}>
              <StatsCardsWrapper />
            </Suspense>
          </div>

          <div className="bg-bg-1 rounded-2xl p-4 shadow-sm">
            <Suspense fallback={<RecentActivitySkeleton />}>
              <RecentActivityWrapper />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-bg-1 rounded-2xl shadow-sm">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
