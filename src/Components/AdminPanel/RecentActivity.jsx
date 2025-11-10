// components/AdminPanel/RecentActivity.jsx
"use client";
import {
  FileText,
  Heart,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Share2,
  Users,
  Edit,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getActivities } from "@/actions/activityActions";

const RecentActivity = ({ initialActivities = [] }) => {
  const [activities, setActivities] = useState(initialActivities);
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const activityTypes = {
    login: {
      icon: <Users className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    post: {
      icon: <FileText className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    comment: {
      icon: <MessageSquare className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    like: {
      icon: <Heart className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    share: {
      icon: <Share2 className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    edit: {
      icon: <Edit className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
    delete: {
      icon: <Trash2 className="h-4 w-4" />,
      color: "text-accent bg-primary-40",
    },
  };

  const fetchActivities = async () => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await getActivities(filter);

        if (result.error) {
          setError(result.error);
        } else {
          setActivities(result.activities || []);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("خطا در بارگذاری فعالیت‌ها");
      }
    });
  };

  useEffect(() => {
    fetchActivities();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  const handleRefresh = () => {
    fetchActivities();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="border-light-white bg-bg-1 rounded-2xl border p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-secondary text-lg font-semibold">
            فعالیت‌های اخیر
          </h3>
          <span className="bg-primary-40 text-accent rounded-full px-2 py-1 text-xs font-medium">
            زنده
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            disabled={isPending}
            className="border-light-white bg-primary-40 focus:ring-accent text-secondary rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          >
            <option value="all">همه</option>
            <option value="login">ورود</option>
            <option value="post">پست</option>
            <option value="edit">ویرایش</option>
            <option value="delete">حذف</option>
            <option value="comment">دیدگاه</option>
            <option value="like">پسند</option>
            <option value="share">اشتراک</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="hover:bg-primary-40 rounded-lg p-2 transition-colors disabled:opacity-50"
            title="بروزرسانی"
          >
            <RefreshCw
              className={`text-light-dark h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Activities list */}
      <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-light-dark py-8 text-center">
            {isPending ? (
              <RefreshCw className="mx-auto h-6 w-6 animate-spin" />
            ) : (
              "فعالیتی یافت نشد"
            )}
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group hover:bg-light-white flex items-start gap-3 rounded-xl p-3 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar & small badge */}
              <div className="relative">
                <div className="bg-light-white text-secondary flex h-10 w-10 items-center justify-center rounded-full text-lg">
                  {activity.avatar}
                </div>

                <div
                  className={`absolute -right-1 -bottom-1 rounded-full p-1 ${
                    activityTypes[activity.type]?.color ||
                    "text-accent bg-primary-40"
                  }`}
                  aria-hidden
                >
                  {activityTypes[activity.type]?.icon || (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-secondary font-medium">
                      {activity.user}
                    </span>
                    <span className="text-light-dark mr-2 text-sm">
                      {activity.action}
                    </span>
                  </div>
                  <button className="opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreVertical className="text-light-dark h-4 w-4" />
                  </button>
                </div>
                <span className="text-light-dark text-xs">{activity.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
