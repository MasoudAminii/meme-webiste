"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // You'll need to install bcryptjs: npm install bcryptjs @types/bcryptjs

// You can replace this with your actual Prisma client import
// import { prisma } from "@/lib/prisma";

interface CreateUserData {
  username: string;
  password: string;
  role: "ADMIN" | "WRITER";
}

/**
 * Creates a new user with hashed password
 */
export async function createUser(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "WRITER";

    // Validate required fields
    if (!username?.trim()) {
      throw new Error("نام کاربری الزامی است");
    }

    if (!password?.trim()) {
      throw new Error("رمز عبور الزامی است");
    }

    if (password.length < 6) {
      throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد");
    }

    if (!role || !["ADMIN", "WRITER"].includes(role)) {
      throw new Error("نقش کاربری نامعتبر است");
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      throw new Error(
        "این نام کاربری قبلاً استفاده شده است. لطفاً نام کاربری دیگری انتخاب کنید",
      );
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const newUser = {
      username: username.trim(),
      password: hashedPassword,
      role: role,
    };

    const user = await prisma.user.create({
      data: newUser,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash
      },
    });

    console.log("Created user:", user);

    // Revalidate paths to show updated data
    revalidatePath("/dashboard/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "کاربر با موفقیت ایجاد شد",
      data: user,
    };
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle Prisma unique constraint errors specifically
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return {
        success: false,
        message:
          "این نام کاربری قبلاً استفاده شده است. لطفاً نام کاربری دیگری انتخاب کنید",
        data: null,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطای غیرمنتظره در ایجاد کاربر",
      data: null,
    };
  }
}

/**
 * Updates an existing user
 */
export async function updateUser(id: number, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "WRITER";
    const updatePassword = formData.get("updatePassword") === "true";

    if (!username?.trim()) {
      throw new Error("نام کاربری الزامی است");
    }

    if (!role || !["ADMIN", "WRITER"].includes(role)) {
      throw new Error("نقش کاربری نامعتبر است");
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("کاربر یافت نشد");
    }

    // Check if username is taken by another user
    if (username.trim() !== existingUser.username) {
      const userWithSameUsername = await prisma.user.findUnique({
        where: { username: username.trim() },
      });

      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new Error(
          "این نام کاربری قبلاً توسط کاربر دیگری استفاده شده است",
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      username: username.trim(),
      role: role,
      updatedAt: new Date(),
    };

    // Handle password update if requested
    if (updatePassword && password?.trim()) {
      if (password.length < 6) {
        throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد");
      }

      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash
      },
    });

    console.log("Updated user:", updatedUser);

    revalidatePath("/dashboard/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "کاربر با موفقیت به‌روزرسانی شد",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطای غیرمنتظره در به‌روزرسانی کاربر",
      data: null,
    };
  }
}

/**
 * Deletes a single user
 */
export async function deleteUser(id: number | string) {
  try {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return { success: false, message: "آیدی نامعتبر است" };
    }

    // Find the existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!existingUser) {
      return { success: false, message: "کاربر یافت نشد" };
    }

    // Optional: Prevent deleting the last admin user
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          message: "نمی‌توان آخرین مدیر سیستم را حذف کرد",
        };
      }
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id: numericId },
    });

    // Revalidate paths so cached pages update
    revalidatePath("/dashboard/users");
    revalidatePath("/admin/users");

    return { success: true, message: "کاربر با موفقیت حذف شد" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "خطای غیرمنتظره در حذف کاربر",
    };
  }
}

/**
 * Bulk delete multiple users
 */
export async function bulkDeleteUsers(ids: Array<number | string>) {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: "هیچ کاربری برای حذف انتخاب نشده" };
    }

    // Normalize IDs to numbers and filter invalid entries
    const idsToDelete = ids
      .map((i) => Number(i))
      .filter((n) => !Number.isNaN(n));

    if (idsToDelete.length === 0) {
      return { success: false, message: "هیچ آیدی معتبری برای حذف موجود نیست" };
    }

    // Check if we're trying to delete all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const adminIds = adminUsers.map((u) => u.id);
    const adminsToDelete = idsToDelete.filter((id) => adminIds.includes(id));
    const remainingAdmins = adminIds.filter((id) => !idsToDelete.includes(id));

    if (adminsToDelete.length > 0 && remainingAdmins.length === 0) {
      return {
        success: false,
        message:
          "نمی‌توان همه مدیران سیستم را حذف کرد. حداقل یک مدیر باید باقی بماند",
      };
    }

    // Fetch existing users for logging
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: idsToDelete } },
      select: { id: true, username: true, role: true },
    });

    // Delete users from DB
    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    console.log(
      `Bulk deleted ${deleteResult.count} users:`,
      existingUsers.map((u) => u.username),
    );

    revalidatePath("/dashboard/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${deleteResult.count ?? idsToDelete.length} کاربر با موفقیت حذف شد`,
    };
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطای غیرمنتظره در حذف کاربران",
    };
  }
}

/**
 * Get user by ID (useful for edit forms)
 */
export async function getUserById(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash
      },
    });

    if (!user) {
      return { success: false, message: "کاربر یافت نشد", data: null };
    }

    return { success: true, message: "کاربر یافت شد", data: user };
  } catch (error) {
    console.error("Error getting user:", error);
    return {
      success: false,
      message: "خطای غیرمنتظره در دریافت اطلاعات کاربر",
      data: null,
    };
  }
}

/**
 * Get all users (for the container component)
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, message: "کاربران دریافت شد", data: users };
  } catch (error) {
    console.error("Error getting users:", error);
    return {
      success: false,
      message: "خطای غیرمنتظره در دریافت لیست کاربران",
      data: [],
    };
  }
}

/**
 * Change user password (separate action for security)
 */
export async function changeUserPassword(id: number, formData: FormData) {
  try {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword?.trim() || !newPassword?.trim()) {
      throw new Error("رمز عبور فعلی و جدید الزامی است");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("رمز عبور جدید و تایید آن یکسان نیستند");
    }

    if (newPassword.length < 6) {
      throw new Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("کاربر یافت نشد");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new Error("رمز عبور فعلی نادرست است");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/users");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "خطای غیرمنتظره در تغییر رمز عبور",
    };
  }
}
