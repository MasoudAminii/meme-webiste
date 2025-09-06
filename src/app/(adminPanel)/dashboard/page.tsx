// app/admin/dashboard.jsx  (or wherever)
import StatsCards from "@/components/AdminPanel/StatsCards";
import QuickActions from "@/components/AdminPanel/QuickActions";
import RecentActivity from "@/components/AdminPanel/RecentActivity";

export default function Dashboard() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">داشبورد مدیریت</h1>
        <p className="text-light-dark">نمای کلی آمار و عملکرد سیستم</p>
      </div>

      {/* Stats + QuickActions row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: StatsCards then RecentActivity */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-bg-1 rounded-2xl p-4 shadow-sm">
            <StatsCards
              data={{ posts: 247, users: 1420, views: 8903, uptime: "99.9%" }}
            />
          </div>

          <div className="bg-bg-1 rounded-2xl p-4 shadow-sm">
            <RecentActivity />
          </div>
        </div>

        {/* Right column: QuickActions then TopPosts */}
        <div className="space-y-6">
          <div className="bg-bg-1 rounded-2xl shadow-sm">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Main content row (kept empty since layout done above) */}
    </div>
  );
}
