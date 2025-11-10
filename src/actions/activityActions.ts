// app/actions/activityActions.ts
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper function to format time ago in Persian
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الان";
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
  return `${Math.floor(diffDays / 30)} ماه پیش`;
}

// Simple avatar generator based on name
function getAvatarForUser(name: string): string {
  const avatars = ["👤", "👨", "👩", "🧑", "👨‍💼", "👩‍💼"];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
}

interface Activity {
  id: number;
  type: string;
  user: string;
  action: string;
  time: string;
  timestamp: string;
  avatar: string;
  metadata: any;
}

interface GetActivitiesResult {
  activities?: Activity[];
  error?: string;
}

// Get activities with optional filter
export async function getActivities(
  filter: string = "all",
  limit: number = 20
): Promise<GetActivitiesResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { error: "Unauthorized" };
    }

    const where = filter && filter !== "all" ? { type: filter } : {};

    const activities = await prisma.activity.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    // Format activities for the frontend
    const formattedActivities: Activity[] = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      user: activity.userName,
      action: activity.action,
      time: formatTimeAgo(activity.createdAt),
      timestamp: activity.createdAt.toISOString(),
      avatar: getAvatarForUser(activity.userName),
      metadata: activity.metadata,
    }));

    return { activities: formattedActivities };
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { error: "Failed to fetch activities" };
  }
}

interface LogActivityParams {
  type: string;
  userId?: number;
  userName: string;
  action: string;
  metadata?: any;
}

// Log an activity (internal use)
export async function logActivity({
  type,
  userId,
  userName,
  action,
  metadata = null,
}: LogActivityParams): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.activity.create({
      data: {
        type,
        userId,
        userName,
        action,
        metadata,
      },
    });

    // Revalidate the dashboard to show new activity
    revalidatePath("/admin/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Failed to log activity" };
  }
}