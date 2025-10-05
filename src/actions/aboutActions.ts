"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadBannerImage, deleteBannerImage } from "@/lib/upload";

// Define the return type to match what useActionState expects
type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

export async function UpdateAboutInfo(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const bannerField = formData.get("banner");
    let bannerUrl: string | null = null;

    // Handle banner image upload
    if (bannerField instanceof File && bannerField.size > 0) {
      try {
        console.log("Processing banner upload...");

        // Get current data to potentially delete old banner
        const currentData = await prisma.aboutUs.findUnique({
          where: { id: 1 },
          select: { BannerUrl: true },
        });

        // Upload new file and get filename
        bannerUrl = await uploadBannerImage(bannerField);
        console.log(`New banner uploaded: ${bannerUrl}`);

        // Delete old banner if it exists and is not a data URL
        if (
          currentData?.BannerUrl &&
          !currentData.BannerUrl.startsWith("data:") &&
          currentData.BannerUrl !== bannerUrl
        ) {
          await deleteBannerImage(currentData.BannerUrl);
        }
      } catch (error) {
        console.error("File upload error:", error);
        return {
          success: false,
          error: "Failed to upload banner image",
        };
      }
    } else if (typeof bannerField === "string" && bannerField.length > 0) {
      // Handle data URL or existing filename
      bannerUrl = bannerField;
    } else {
      // No banner provided
      bannerUrl = null;
    }

    // Process text fields
    const descriptionRaw = formData.get("description");
    const description =
      typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
        ? descriptionRaw
        : undefined;

    const overviewLabelRaw = formData.get("overviewLabel");
    const overviewLabel =
      typeof overviewLabelRaw === "string" && overviewLabelRaw.trim().length > 0
        ? overviewLabelRaw
        : undefined;

    const statisticsLabelRaw = formData.get("statisticsLabel");
    const statisticsLabel =
      typeof statisticsLabelRaw === "string" &&
      statisticsLabelRaw.trim().length > 0
        ? statisticsLabelRaw
        : undefined;

    const siteInfoLabelRaw = formData.get("siteInfoLabel");
    const siteInfoLabel =
      typeof siteInfoLabelRaw === "string" && siteInfoLabelRaw.trim().length > 0
        ? siteInfoLabelRaw
        : undefined;

    const contactAdminLabelRaw = formData.get("contactAdminLabel");
    const contactAdminLabel =
      typeof contactAdminLabelRaw === "string" &&
      contactAdminLabelRaw.trim().length > 0
        ? contactAdminLabelRaw
        : undefined;

    const contactAdminUrlRaw = formData.get("contactAdminUrl");
    const contactAdminUrl =
      typeof contactAdminUrlRaw === "string" &&
      contactAdminUrlRaw.trim().length > 0
        ? contactAdminUrlRaw
        : undefined;

    const financialSupportLabelRaw = formData.get("financialSupportLabel");
    const financialSupportLabel =
      typeof financialSupportLabelRaw === "string" &&
      financialSupportLabelRaw.trim().length > 0
        ? financialSupportLabelRaw
        : undefined;

    const financialSupportUrlRaw = formData.get("financialSupportUrl");
    const financialSupportUrl =
      typeof financialSupportUrlRaw === "string" &&
      financialSupportUrlRaw.trim().length > 0
        ? financialSupportUrlRaw
        : undefined;

    // Parse numeric fields
    const parseMaybeInt = (v: FormDataEntryValue | null) => {
      if (typeof v !== "string") return undefined;
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : undefined;
    };

    const overviewContent = parseMaybeInt(formData.get("overviewContent"));
    const statisticsContent = parseMaybeInt(formData.get("statisticsContent"));
    const siteInfoContent = parseMaybeInt(formData.get("siteInfoContent"));

    // Update database
    console.log("Updating database...");

    await prisma.aboutUs.update({
      where: { id: 1 },
      data: {
        // Only pass BannerUrl when we have a string (undefined will be ignored)
        BannerUrl: bannerUrl ?? undefined,
        // Same pattern for strings: use undefined for "not provided"
        description,
        ...(overviewLabel ? { overviewLabel } : {}),
        ...(overviewContent !== undefined ? { overviewContent } : {}),
        ...(statisticsLabel ? { statisticsLabel } : {}),
        ...(statisticsContent !== undefined ? { statisticsContent } : {}),
        ...(siteInfoLabel ? { siteInfoLabel } : {}),
        ...(siteInfoContent !== undefined ? { siteInfoContent } : {}),
        ...(contactAdminLabel ? { contactAdminLabel } : {}),
        ...(contactAdminUrl ? { contactAdminUrl } : {}),
        ...(financialSupportLabel ? { financialSupportLabel } : {}),
        ...(financialSupportUrl ? { financialSupportUrl } : {}),
      },
    });

    console.log("Database updated successfully");

    // Revalidate the page cache
    revalidatePath("/about-us");

    // Return success state
    return {
      success: true,
      message: "اطلاعات با موفقیت به‌روزرسانی شد",
    };
  } catch (error) {
    console.error("UpdateAboutInfo database error:", error);

    // Return error state
    return {
      success: false,
      error: "خطا در به‌روزرسانی اطلاعات. لطفا دوباره تلاش کنید.",
    };
  }
}
