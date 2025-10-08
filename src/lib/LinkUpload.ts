import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a banner image to the public/banner directory
 * @param file - The file to upload
 * @returns The filename (not full path) that was saved
 */
export async function uploadBannerImage(file: File): Promise<string> {
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create banner directory if it doesn't exist
  const bannerDir = path.join(process.cwd(), "public", "logo", "Links");
  if (!existsSync(bannerDir)) {
    await mkdir(bannerDir, { recursive: true });
  }

  // ✅ FIX: Get extension from file.name OR fallback to MIME type
  let fileExtension = path.extname(file.name);

  // If no extension found in filename, extract from MIME type
  if (!fileExtension) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };
    fileExtension = mimeToExt[file.type] || ".jpg"; // Default to .jpg if unknown
  }

  const filename = `${uuidv4()}${fileExtension}`;
  const filepath = path.join(bannerDir, filename);

  // Write file to disk
  await writeFile(filepath, buffer);

  // Return just the filename (not full path)
  // This is what gets stored in the database
  return filename;
}

/**
 * Deletes a banner image from the public/banner directory
 * @param filename - The filename to delete
 */
export async function deleteBannerImage(filename: string): Promise<void> {
  try {
    const filepath = path.join(process.cwd(), "public", "banner", filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
      console.log(`Deleted old banner: ${filename}`);
    }
  } catch (error) {
    console.error("Error deleting banner image:", error);
    // Don't throw error - file deletion failure shouldn't break the update
  }
}
