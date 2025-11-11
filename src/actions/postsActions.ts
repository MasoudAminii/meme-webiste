"use server";

import prisma from "@/lib/db";
import type { MediaItem } from "@prisma/client";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@prisma/client";

// Helper function to log activity
async function logActivity({
  type,
  userId,
  userName,
  action,
  metadata,
}: {
  type: string;
  userId?: number;
  userName: string;
  action: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.activity.create({
      data: {
        type,
        userId,
        userName,
        action,
        ...(metadata !== undefined && metadata !== null && { metadata }),
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging shouldn't break the main operation
  }
}

export async function incrementView(postId: number) {
  try {
    const cookieStore = await cookies();
    const viewedPosts = cookieStore.get(`viewed_${postId}`);

    if (viewedPosts) {
      return { success: true, alreadyViewed: true };
    }

    await prisma.mediaItem.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    cookieStore.set(`viewed_${postId}`, "true", {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    return { success: true, alreadyViewed: false };
  } catch (error) {
    console.error("Error incrementing view:", error);
    return { success: false, error: "Failed to increment view" };
  }
}

export async function toggleLike(postId: number) {
  try {
    const cookieStore = await cookies();
    const cookieName = `liked_${postId}`;
    const isCurrentlyLiked = cookieStore.get(cookieName)?.value === "true";

    const updatedPost = await prisma.mediaItem.update({
      where: { id: postId },
      data: {
        likes: {
          increment: isCurrentlyLiked ? -1 : 1,
        },
      },
      select: { likes: true },
    });

    (await cookies()).set(cookieName, isCurrentlyLiked ? "false" : "true", {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    return {
      success: true,
      liked: !isCurrentlyLiked,
      likes: updatedPost.likes,
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      liked: false,
      likes: 0,
    };
  }
}

export async function getClientLikeState(postId: number) {
  const cookieStore = await cookies();
  const liked = cookieStore.get(`liked_${postId}`)?.value === "true";
  return { liked };
}

export async function getInitialLikeState(postId: number) {
  try {
    const cookieStore = await cookies();
    const likedCookie = cookieStore.get(`liked_${postId}`);

    return {
      liked: likedCookie?.value === "true",
    };
  } catch {
    return { liked: false };
  }
}

export async function uploadMediaFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!existsSync(galleryDir)) {
    await mkdir(galleryDir, { recursive: true });
  }

  const fileExtension = path.extname(file.name);
  const filename = `${uuidv4()}${fileExtension}`;
  const filepath = path.join(galleryDir, filename);

  await writeFile(filepath, buffer);
  return filename;
}

export async function deleteMediaFile(filename: string): Promise<void> {
  try {
    const filepath = path.join(process.cwd(), "public", "gallery", filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
      console.log(`Deleted gallery file: ${filename}`);
    }
  } catch (err) {
    console.error("Error deleting gallery file:", err);
  }
}

type CreatePostResult =
  | { success: true; message: string; data: MediaItem }
  | { success: false; message: string; data: null };

export async function createPost(
  formData: FormData,
): Promise<CreatePostResult> {
  try {
    // Get session for activity logging
    const session = await getServerSession(authOptions);

    const slug = (formData.get("slug") as string | null)?.trim() ?? "";
    const description =
      (formData.get("description") as string | null)?.trim() ?? null;
    const author = (formData.get("author") as string | null)?.trim() ?? null;
    const mediaFile = formData.get("media") as File | null;

    if (slug) {
      const existingPost = await prisma.mediaItem.findUnique({
        where: { slug },
      });

      if (existingPost) {
        return {
          success: false,
          message:
            "این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری انتخاب کنید",
          data: null,
        };
      }
    }

    let mediaUrl: string | undefined;

    if (mediaFile && mediaFile.size > 0) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
      ];

      if (!validTypes.includes(mediaFile.type)) {
        return {
          success: false,
          message: "فرمت فایل باید تصویر یا ویدیو باشد",
          data: null,
        };
      }

      const maxSize = mediaFile.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (mediaFile.size > maxSize) {
        const maxSizeMB = mediaFile.type.startsWith("video/") ? 50 : 10;
        return {
          success: false,
          message: `حجم فایل نباید بیشتر از ${maxSizeMB}MB باشد`,
          data: null,
        };
      }

      mediaUrl = await uploadMediaFile(mediaFile);
    }

    const newPostData: Omit<MediaItem, "id" | "createdAt" | "updatedAt"> &
      Partial<Pick<MediaItem, "createdAt" | "updatedAt">> = {
      slug: slug || (undefined as unknown as string),
      src: mediaUrl ?? null,
      description: description ?? null,
      author: author ?? null,
      likes: 0 as number,
      shares: 0 as number,
      views: 0 as number,
    };

    const post = await prisma.mediaItem.create({
      data: newPostData,
    });

    console.log("Created post:", post);

    // Log activity
    if (session?.user) {
      await logActivity({
        type: "post",
        userId: Number(session.user.id),
        userName: session.user.username,
        action: "پست جدیدی منتشر کرد",
        metadata: { postId: post.id, slug: post.slug },
      });
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return { success: true, message: "پست با موفقیت ایجاد شد", data: post };
  } catch (error: unknown) {
    console.error("Error creating post:", error);

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return {
        success: false,
        message:
          "این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری انتخاب کنید",
        data: null,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در ایجاد پست",
      data: null,
    };
  }
}

type UpdatePostResult =
  | { success: true; message: string; data: Partial<MediaItem> }
  | { success: false; message: string; data: null };

export async function updatePost(
  id: number,
  formData: FormData,
): Promise<UpdatePostResult> {
  try {
    // Get session for activity logging
    const session = await getServerSession(authOptions);

    const slug = (formData.get("slug") as string | null)?.trim() ?? "";
    const description =
      (formData.get("description") as string | null)?.trim() ?? null;
    const author = (formData.get("author") as string | null)?.trim() ?? null;
    const mediaFile = formData.get("media") as File | null;
    const removeMedia = formData.get("removeMedia") === "true";

    if (!slug) {
      return { success: false, message: "اسلاگ/عنوان الزامی است", data: null };
    }

    const existingPost = await prisma.mediaItem.findUnique({ where: { id } });
    if (!existingPost) {
      return { success: false, message: "پست یافت نشد", data: null };
    }

    let mediaUrl: string | undefined | null = undefined;

    if (removeMedia) {
      if (existingPost.src) {
        try {
          await deleteMediaFile(existingPost.src);
        } catch (fileErr) {
          console.error("Failed to delete old media file:", fileErr);
        }
      }
      mediaUrl = null;
    } else if (mediaFile && mediaFile.size > 0) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
      ];

      if (!validTypes.includes(mediaFile.type)) {
        return {
          success: false,
          message: "فرمت فایل باید تصویر یا ویدیو باشد",
          data: null,
        };
      }

      const maxSize = mediaFile.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (mediaFile.size > maxSize) {
        const maxSizeMB = mediaFile.type.startsWith("video/") ? 50 : 10;
        return {
          success: false,
          message: `حجم فایل نباید بیشتر از ${maxSizeMB}MB باشد`,
          data: null,
        };
      }

      if (existingPost.src) {
        try {
          await deleteMediaFile(existingPost.src);
        } catch (fileErr) {
          console.error("Failed to delete previous media file:", fileErr);
        }
      }

      mediaUrl = await uploadMediaFile(mediaFile);
    }

    const updateData: Partial<MediaItem> = {
      slug,
      description: description ?? null,
      author: author ?? null,
      updatedAt: new Date(),
    };

    if (mediaUrl !== undefined) {
      updateData.src = mediaUrl;
    }

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    if (session?.user) {
      await logActivity({
        type: "edit",
        userId: Number(session.user.id),
        userName: session.user.username,
        action: "پستی را ویرایش کرد",
        metadata: { postId: updated.id, slug: updated.slug },
      });
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return {
      success: true,
      message: "پست با موفقیت به‌روزرسانی شد",
      data: updated,
    };
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطای غیرمنتظره در به‌روزرسانی پست",
      data: null,
    };
  }
}

export async function deletePost(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Get session for activity logging
    const session = await getServerSession(authOptions);

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return { success: false, message: "آیدی نامعتبر است" };
    }

    const existingPost = await prisma.mediaItem.findUnique({
      where: { id: numericId },
    });

    if (!existingPost) {
      return { success: false, message: "پست یافت نشد" };
    }

    if (existingPost.src) {
      try {
        await deleteMediaFile(existingPost.src);
      } catch (fileErr) {
        console.error(
          "Failed to delete media file for post",
          numericId,
          fileErr,
        );
      }
    }

    await prisma.mediaItem.delete({
      where: { id: numericId },
    });

    // Log activity
    if (session?.user) {
      await logActivity({
        type: "delete",
        userId: Number(session.user.id),
        userName: session.user.username,
        action: "پستی را حذف کرد",
        metadata: { postId: numericId, slug: existingPost.slug },
      });
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return { success: true, message: "پست با موفقیت حذف شد" };
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در حذف پست",
    };
  }
}

export async function bulkDeletePosts(
  ids: Array<number | string>,
): Promise<{ success: boolean; message: string }> {
  try {
    // Get session for activity logging
    const session = await getServerSession(authOptions);

    if (!ids || ids.length === 0) {
      return { success: false, message: "هیچ پستی برای حذف انتخاب نشده" };
    }

    const idsToDelete = ids
      .map((i) => Number(i))
      .filter((n) => !Number.isNaN(n));

    if (idsToDelete.length === 0) {
      return { success: false, message: "هیچ آیدی معتبری برای حذف موجود نیست" };
    }

    const existingPosts = await prisma.mediaItem.findMany({
      where: { id: { in: idsToDelete } },
      select: { id: true, src: true },
    });

    for (const p of existingPosts) {
      if (p.src) {
        try {
          await deleteMediaFile(p.src);
        } catch (fileErr) {
          console.error("Failed to delete media file for post", p.id, fileErr);
        }
      }
    }

    const deleteResult = await prisma.mediaItem.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    // Log activity
    if (session?.user) {
      await logActivity({
        type: "delete",
        userId: Number(session.user.id),
        userName: session.user.username,
        action: `${deleteResult.count} پست را به صورت گروهی حذف کرد`,
        metadata: { postIds: idsToDelete, count: deleteResult.count },
      });
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return {
      success: true,
      message: `${deleteResult.count ?? idsToDelete.length} پست با موفقیت حذف شد`,
    };
  } catch (error: unknown) {
    console.error("Error bulk deleting posts:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در حذف پست‌ها",
    };
  }
}
