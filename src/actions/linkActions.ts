"use server";

import prisma from "@/lib/db";
import { uploadBannerImage, deleteBannerImage } from "@/lib/LinkUpload";
import { revalidatePath } from "next/cache";
import type { Link } from "@prisma/client";

type ActionResult = {
  success?: true;
  error?: string;
  message?: string;
  link?: Link | null;
};

/**
 * Server action to create or update a Link using Prisma.
 * - Accepts FormData (client-side form submission via Server Actions).
 * - If a file input named "logoFile" is present it will be uploaded with uploadBannerImage().
 * - If an existing record with the same slug exists, the record will be updated (and old uploaded image deleted).
 *
 * Returns an object shaped like ActionResult.
 */
export async function createLink(
  prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Normalize & trim values
    const slug = String(formData.get("slug") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const backgroundCss = String(formData.get("backgroundCss") || "").trim();
    const textColor = String(formData.get("textColor") || "").trim();
    const label = String(formData.get("label") || "").trim();
    const targetUrl = String(formData.get("targetUrl") || "").trim();

    // Validate required fields
    if (!slug || !username || !label || !targetUrl) {
      return { error: "تمام فیلدهای اجباری باید پر شوند" };
    }

    // Get possible values for logo
    let logoFilename = String(formData.get("logoUrl") || "default.png").trim();

    const maybeFile = formData.get("logoFile") as File | null;

    // Find existing link (if any) by slug so we can update or remove old image
    const existing = await prisma.link.findUnique({ where: { slug } });

    // If a file was uploaded, process it (upload and set resulting filename)
    if (
      maybeFile &&
      typeof maybeFile === "object" &&
      (maybeFile as File).size > 0
    ) {
      const file = maybeFile as File;

      // Basic validation
      if (!file.type.startsWith("image/")) {
        return { error: "لطفا یک فایل تصویر معتبر انتخاب کنید." };
      }
      const MAX_MB = 10; // adjust as needed
      if (file.size > MAX_MB * 1024 * 1024) {
        return { error: `حجم فایل بیشتر از ${MAX_MB}MB است.` };
      }

      // Upload via your helper (returns filename)
      try {
        const uploaded = await uploadBannerImage(file);
        logoFilename = uploaded;

        // If updating and old file exists (and is not default), attempt deletion
        if (
          existing &&
          existing.logoUrl &&
          existing.logoUrl !== "default.png" &&
          existing.logoUrl !== logoFilename
        ) {
          try {
            await deleteBannerImage(existing.logoUrl);
          } catch (delErr: unknown) {
            // Log and continue — do not block user action for deletion failure
            console.error("Failed to delete previous image:", delErr);
          }
        }
      } catch (uploadErr: unknown) {
        console.error("Upload error:", uploadErr);
        return { error: "خطا در بارگذاری تصویر" };
      }
    }

    // Prepare data for create/update (convert empty strings to undefined where appropriate)
    const dataForWrite = {
      username: username || undefined,
      logoUrl: logoFilename || undefined,
      backgroundCss: backgroundCss || undefined,
      textColor: textColor || undefined,
      label: label || undefined,
      targetUrl, // required
    };

    // If record exists -> update, otherwise create
    if (existing) {
      const updated = await prisma.link.update({
        where: { slug },
        data: dataForWrite,
      });

      // Revalidate paths after successful update
      revalidatePath("/dashboard/links");
      revalidatePath("/");
      revalidatePath(`/l/${slug}`); // If you have individual link pages

      return {
        success: true,
        message: "لینک با موفقیت بروزرسانی شد",
        link: updated,
      };
    }

    // Create new record
    const created = await prisma.link.create({
      data: {
        slug,
        username: dataForWrite.username ?? "",
        logoUrl: dataForWrite.logoUrl ?? "default.png",
        backgroundCss:
          dataForWrite.backgroundCss ??
          "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
        textColor: dataForWrite.textColor ?? "#ffffff",
        label: dataForWrite.label ?? "",
        targetUrl: dataForWrite.targetUrl,
      },
    });

    // Revalidate paths after successful creation
    revalidatePath("/dashboard/links");
    revalidatePath("/");
    revalidatePath(`/l/${slug}`); // If you have individual link pages

    return { success: true, message: "لینک با موفقیت ایجاد شد", link: created };
  } catch (error: unknown) {
    console.error("createLink server action error:", error);

    // Check for Prisma unique constraint error code (P2002)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { error: "این شناسه قبلاً استفاده شده است" };
    }

    return { error: "خطا در ایجاد یا بروزرسانی لینک" };
  }
}

export async function deleteLink(linkId: number): Promise<ActionResult> {
  try {
    // First, get the link to check if it has an uploaded image
    const existingLink = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!existingLink) {
      return { error: "لینک یافت نشد" };
    }

    // Store slug for revalidation before deletion
    const linkSlug = existingLink.slug;

    // If the link has an uploaded image (not default), delete it
    if (existingLink.logoUrl && existingLink.logoUrl !== "default.png") {
      try {
        await deleteBannerImage(existingLink.logoUrl);
      } catch (delErr: unknown) {
        console.error("Failed to delete image file:", delErr);
        // Continue with link deletion even if image deletion fails
      }
    }

    // Delete the link from database
    await prisma.link.delete({
      where: { id: linkId },
    });

    // Revalidate paths after successful deletion
    revalidatePath("/dashboard/links");
    revalidatePath("/");
    if (linkSlug) {
      revalidatePath(`/l/${linkSlug}`); // If you have individual link pages
    }

    return { success: true, message: "لینک با موفقیت حذف شد" };
  } catch (error: unknown) {
    console.error("deleteLink server action error:", error);
    return { error: "خطا در حذف لینک" };
  }
}

export async function reorderLinks(
  updates: { id: number; position: number }[],
): Promise<ActionResult> {
  try {
    // Use transaction to update all positions atomically
    await prisma.$transaction(
      updates.map(({ id, position }) =>
        prisma.link.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    revalidatePath("/dashboard/links");
    return { success: true };
  } catch (error: unknown) {
    console.error("reorderLinks error:", error);
    return { error: "خطا در بروزرسانی ترتیب" };
  }
}
