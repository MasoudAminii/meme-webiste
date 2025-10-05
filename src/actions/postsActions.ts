"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// You'll need to replace this with your actual Prisma client
// import { prisma } from "@/lib/prisma";

interface CreatePostData {
  slug: string;
  description?: string;
  author?: string;
}

/**
 * Uploads a media file (image or video) to the public/gallery directory
 * @param file - The file to upload
 * @returns The filename (not full path) that was saved
 */
export async function uploadMediaFile(file: File): Promise<string> {
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create gallery directory if it doesn't exist
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!existsSync(galleryDir)) {
    await mkdir(galleryDir, { recursive: true });
  }

  // Generate unique filename with original extension
  const fileExtension = path.extname(file.name);
  const filename = `${uuidv4()}${fileExtension}`;
  const filepath = path.join(galleryDir, filename);

  // Write file to disk
  await writeFile(filepath, buffer);

  // Return just the filename (not full path)
  return filename;
}

/**
 * Deletes a media file from the public/gallery directory
 * @param filename - The filename to delete
 */
export async function deleteMediaFile(filename: string): Promise<void> {
  try {
    const filepath = path.join(process.cwd(), "public", "gallery", filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
      console.log(`Deleted gallery file: ${filename}`);
    }
  } catch (error) {
    console.error("Error deleting gallery file:", error);
  }
}

/**
 * Creates a new post with optional media file
 */
export async function createPost(formData: FormData) {
  try {
    const slug = formData.get("slug") as string | null;
    const description = formData.get("description") as string;
    const author = formData.get("author") as string;
    const mediaFile = formData.get("media") as File | null;

    // Only validate slug uniqueness if user provided one
    if (slug?.trim()) {
      const existingPost = await prisma.mediaItem.findUnique({
        where: { slug: slug.trim() },
      });

      if (existingPost) {
        throw new Error(
          "این اسلاگ قبلاً استفاده شده است. لطفاً اسلاگ دیگری انتخاب کنید",
        );
      }
    }

    let mediaUrl: string | undefined;

    // Handle media file upload if provided
    if (mediaFile && mediaFile.size > 0) {
      // Validate file type (images and videos)
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
        throw new Error("فرمت فایل باید تصویر یا ویدیو باشد");
      }

      // Validate file size (max 50MB for videos, 10MB for images)
      const maxSize = mediaFile.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (mediaFile.size > maxSize) {
        const maxSizeMB = mediaFile.type.startsWith("video/") ? 50 : 10;
        throw new Error(`حجم فایل نباید بیشتر از ${maxSizeMB}MB باشد`);
      }

      mediaUrl = await uploadMediaFile(mediaFile);
    }

    // Create post in database
    // Create post in database
    const newPost = {
      slug: slug?.trim() || undefined, // Let DB use cuid() default if empty
      src: mediaUrl,
      description: description?.trim() || null,
      author: author?.trim() || null,
      likes: 0,
      shares: 0,
      views: 0,
    };

    // Uncomment and use your actual Prisma client
    const post = await prisma.mediaItem.create({
      data: newPost,
    });

    console.log("Created post:", post);

    // Revalidate multiple paths to show updated data
    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return {
      success: true,
      message: "پست با موفقیت ایجاد شد",
      data: post,
    };
  } catch (error) {
    console.error("Error creating post:", error);

    // Handle Prisma unique constraint errors specifically
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

/**
 * Updates an existing post
 */
export async function updatePost(id: number, formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const author = formData.get("author") as string;
    const mediaFile = formData.get("media") as File | null;
    const removeMedia = formData.get("removeMedia") === "true";

    if (!slug?.trim()) {
      throw new Error("اسلاگ/عنوان الزامی است");
    }

    // Get existing post to check for old media
    /* 
    const existingPost = await prisma.mediaItem.findUnique({
      where: { id }
    });

    if (!existingPost) {
      throw new Error("پست یافت نشد");
    }
    */

    let mediaUrl: string | undefined | null = undefined;

    // Handle media removal
    if (removeMedia) {
      // Delete old media file if exists
      /* 
      if (existingPost.src) {
        await deleteMediaFile(existingPost.src);
      }
      */
      mediaUrl = null;
    }
    // Handle new media upload
    else if (mediaFile && mediaFile.size > 0) {
      // Validate and upload new file
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
        throw new Error("فرمت فایل باید تصویر یا ویدیو باشد");
      }

      const maxSize = mediaFile.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (mediaFile.size > maxSize) {
        const maxSizeMB = mediaFile.type.startsWith("video/") ? 50 : 10;
        throw new Error(`حجم فایل نباید بیشتر از ${maxSizeMB}MB باشد`);
      }

      // Delete old media file if exists
      /* 
      if (existingPost.src) {
        await deleteMediaFile(existingPost.src);
      }
      */

      mediaUrl = await uploadMediaFile(mediaFile);
    }

    // Update post in database
    const updateData: any = {
      slug: slug.trim(),
      description: description?.trim() || null,
      author: author?.trim() || null,
      updatedAt: new Date(),
    };

    if (mediaUrl !== undefined) {
      updateData.src = mediaUrl;
    }

    /* 
    const updatedPost = await prisma.mediaItem.update({
      where: { id },
      data: updateData
    });
    */

    console.log("Updating post:", updateData);

    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return {
      success: true,
      message: "پست با موفقیت به‌روزرسانی شد",
      data: updateData,
    };
  } catch (error) {
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

export async function deletePost(id: number | string) {
  try {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return { success: false, message: "آیدی نامعتبر است" };
    }

    // Find the existing post
    const existingPost = await prisma.mediaItem.findUnique({
      where: { id: numericId },
    });

    if (!existingPost) {
      return { success: false, message: "پست یافت نشد" };
    }

    // Delete associated media file (best-effort)
    if (existingPost.src) {
      try {
        await deleteMediaFile(existingPost.src);
      } catch (fileErr) {
        console.error(
          "Failed to delete media file for post",
          numericId,
          fileErr,
        );
        // don't abort DB delete — we did our best to remove file
      }
    }

    // Delete post from database
    await prisma.mediaItem.delete({
      where: { id: numericId },
    });

    // Revalidate paths so cached pages update
    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return { success: true, message: "پست با موفقیت حذف شد" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در حذف پست",
    };
  }
}

export async function bulkDeletePosts(ids: Array<number | string>) {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: "هیچ پستی برای حذف انتخاب نشده" };
    }

    // Normalize IDs to numbers and filter invalid entries
    const idsToDelete = ids
      .map((i) => Number(i))
      .filter((n) => !Number.isNaN(n));

    if (idsToDelete.length === 0) {
      return { success: false, message: "هیچ آیدی معتبری برای حذف موجود نیست" };
    }

    // Fetch existing posts to delete media files
    const existingPosts = await prisma.mediaItem.findMany({
      where: { id: { in: idsToDelete } },
      select: { id: true, src: true },
    });

    // Delete associated files (best-effort)
    for (const p of existingPosts) {
      if (p.src) {
        try {
          await deleteMediaFile(p.src);
        } catch (fileErr) {
          console.error("Failed to delete media file for post", p.id, fileErr);
        }
      }
    }

    // Delete posts from DB
    const deleteResult = await prisma.mediaItem.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    // deleteResult.count gives number deleted (Prisma v4)
    revalidatePath("/dashboard/posts");
    revalidatePath("/gallery");
    revalidatePath("/reels");

    return {
      success: true,
      message: `${deleteResult.count ?? idsToDelete.length} پست با موفقیت حذف شد`,
    };
  } catch (error) {
    console.error("Error bulk deleting posts:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در حذف پست‌ها",
    };
  }
}
