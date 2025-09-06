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
} from "lucide-react";
import { useEffect, useState } from "react";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");

  // Using theme token classes (these should map to your @theme inline tokens)
  const activityTypes = {
    login: {
      icon: <Users className="h-4 w-4" />,
      // uses theme tokens: text-accent for icon color, bg-primary-40 for badge bg
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
  };

  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: "login",
        user: "علی احمدی",
        action: "وارد سیستم شد",
        time: "2 دقیقه پیش",
        avatar: "👤",
      },
      {
        id: 2,
        type: "post",
        user: "سارا کریمی",
        action: "پست جدیدی منتشر کرد",
        time: "15 دقیقه پیش",
        avatar: "👩",
      },
      {
        id: 3,
        type: "comment",
        user: "محمد رضایی",
        action: "دیدگاهی ارسال کرد",
        time: "1 ساعت پیش",
        avatar: "👨",
      },
      {
        id: 4,
        type: "like",
        user: "زهرا محمدی",
        action: "پستی را پسندید",
        time: "2 ساعت پیش",
        avatar: "👩",
      },
      {
        id: 5,
        type: "share",
        user: "امیر حسینی",
        action: "محتوایی را به اشتراک گذاشت",
        time: "3 ساعت پیش",
        avatar: "👨",
      },
      {
        id: 6,
        type: "post",
        user: "فاطمه نوری",
        action: "مقاله‌ای آپلود کرد",
        time: "5 ساعت پیش",
        avatar: "👩",
      },
    ];
    setActivities(mockActivities);
  }, []);

  const filteredActivities =
    filter === "all" ? activities : activities.filter((a) => a.type === filter);

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
            onChange={(e) => setFilter(e.target.value)}
            className="border-light-white bg-primary-40 focus:ring-accent text-secondary rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="all">همه</option>
            <option value="login">ورود</option>
            <option value="post">پست</option>
            <option value="comment">دیدگاه</option>
            <option value="like">پسند</option>
            <option value="share">اشتراک</option>
          </select>

          <button className="hover:bg-primary-40 rounded-lg p-2 transition-colors">
            <RefreshCw className="text-light-dark h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Activities list */}
      <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
        {filteredActivities.map((activity, index) => (
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
                className={`absolute -right-1 -bottom-1 rounded-full p-1 ${activityTypes[activity.type].color}`}
                aria-hidden
              >
                {activityTypes[activity.type].icon}
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
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
