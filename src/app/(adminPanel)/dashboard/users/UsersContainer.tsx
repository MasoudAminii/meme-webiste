"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Edit,
  Edit3,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Calendar,
  User,
  Hash,
  MoreHorizontal,
  RefreshCw,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  Users,
  Shield,
  PenTool,
  Key,
  UserPlus,
  AlertTriangle,
  Save,
} from "lucide-react";

import {
  createUser,
  deleteUser,
  bulkDeleteUsers,
  updateUser,
} from "@/actions/usersActions"; // Import your server actions

// User type based on your Prisma schema
interface UserItem {
  id: number;
  username: string;
  password?: string; // Optional for security
  role: "ADMIN" | "WRITER";
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateFormProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  role: "ADMIN" | "WRITER";
  setRole: React.Dispatch<React.SetStateAction<"ADMIN" | "WRITER">>;
  isPending: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleCreateUser: (e?: React.FormEvent) => Promise<void> | void;
  resetForm: () => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  userName?: string;
  isLoading?: boolean;
  type?: "single" | "bulk";
  count?: number;
}

type SortField = "id" | "username" | "role" | "createdAt";
type SortOrder = "asc" | "desc";
type FilterType = "all" | "admin" | "writer";

/**
 * Custom Delete Confirmation Modal Component
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  userName,
  isLoading = false,
  type = "single",
  count = 1,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isLoading) {
      onClose();
    } else if (e.key === "Enter" && !isLoading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="relative mx-4 w-full max-w-md scale-100 transform rounded-2xl bg-white shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 id="modal-title" className="text-lg font-semibold text-white">
                {title}
              </h3>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Message */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>

            <p className="mb-4 leading-relaxed text-gray-700">{message}</p>

            {/* User Info Display */}
            {userName && type === "single" && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{userName}</span>
                </div>
              </div>
            )}

            {/* Bulk Delete Info */}
            {type === "bulk" && count > 0 && (
              <div className="mb-4 rounded-lg bg-red-50 p-3">
                <div className="text-sm text-red-800">
                  <span className="font-medium">{count}</span> کاربر انتخاب شده
                  برای حذف
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  این عملیات قابل بازگشت نیست و تمام اطلاعات به طور دائم حذف
                  خواهد شد.
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  حذف کردن
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Extracted CreateForm (module scope) — memoized so it stays stable across parent re-renders.
 */
const CreateFormInner: React.FC<CreateFormProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  role,
  setRole,
  isPending,
  error,
  setError,
  handleCreateUser,
  resetForm,
}) => {
  return (
    <div>
      <form className="space-y-8" onSubmit={handleCreateUser}>
        <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <UserPlus size={24} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold">ایجاد کاربر جدید</h3>
              <p className="text-light-dark mt-1 text-sm">
                اطلاعات کاربر جدید را وارد کنید
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-light-dark mb-2 flex text-base font-semibold">
                  نام کاربری *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری را وارد کنید..."
                  disabled={isPending}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-light-dark mb-2 flex text-base font-semibold">
                  نقش *
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "ADMIN" | "WRITER")
                  }
                  disabled={isPending}
                  className="bg-bg-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:outline-none disabled:opacity-50"
                >
                  <option value="WRITER">نویسنده</option>
                  <option value="ADMIN">مدیر</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-light-dark mb-2 flex text-base font-semibold">
                  رمز عبور *
                </label>
                <div className="relative">
                  <Key className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور را وارد کنید..."
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-sm transition-all focus:outline-none disabled:opacity-50"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  رمز عبور باید حداقل ۶ کاراکتر باشد
                </p>
              </div>

              <div>
                <label className="text-light-dark mb-2 flex text-base font-semibold">
                  تایید رمز عبور *
                </label>
                <div className="relative">
                  <Key className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="رمز عبور را مجدداً وارد کنید..."
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-sm transition-all focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending ? true : undefined}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}

                {/* Text */}
                <span>{isPending ? "در حال ذخیره..." : "ایجاد کاربر"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CreateForm = React.memo(CreateFormInner);

/**
 * UsersContainer (main component)
 */
const UsersContainer = ({ data }: { data: UserItem[] }) => {
  const [activeTab, setActiveTab] = useState<"preview" | "create">("preview");
  const [users, setUsers] = useState<UserItem[]>(data || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    user?: UserItem;
    userIds?: number[];
  }>({
    isOpen: false,
    type: "single",
  });

  // React transitions for server actions
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isBulkDeleting, startBulkDeletingTransition] = useTransition();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "WRITER">("WRITER");
  const [error, setError] = useState<string | null>(null);

  // Advanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = (() => {
        switch (filter) {
          case "admin":
            return user.role === "ADMIN";
          case "writer":
            return user.role === "WRITER";
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aVal: any = a[sortField as keyof UserItem];
      const bVal: any = b[sortField as keyof UserItem];
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * multiplier;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return (
          (new Date(aVal).getTime() - new Date(bVal).getTime()) * multiplier
        );
      }
      return (Number(aVal) - Number(bVal)) * multiplier;
    });
  }, [users, searchTerm, sortField, sortOrder, filter]);

  // Notification system
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Server Actions
  const handleEdit = async (id: number) => {
    // Navigate to edit page or open edit modal
    showNotification("success", `کاربر ${id} برای ویرایش باز شد`);
  };

  // Open delete confirmation modal for single user
  const handleDeleteClick = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setDeleteModal({
        isOpen: true,
        type: "single",
        user: user,
      });
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;

    setDeleteModal({
      isOpen: true,
      type: "bulk",
      userIds: [...selectedUsers],
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single" });
  };

  // Confirm single delete
  const confirmSingleDelete = async () => {
    if (!deleteModal.user) return;

    const user = deleteModal.user;

    // Check if this is the last admin before making any changes
    if (user.role === "ADMIN") {
      const adminCount = users.filter((u) => u.role === "ADMIN").length;
      if (adminCount <= 1) {
        showNotification("error", "نمی‌توانید آخرین مدیر سیستم را حذف کنید");
        closeDeleteModal();
        return;
      }
    }

    startDeletingTransition(() => {
      void (async () => {
        try {
          const result = await deleteUser(user.id);
          if (result?.success) {
            // Only update UI after successful server response
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            setSelectedUsers((prev) =>
              prev.filter((selectedId) => selectedId !== user.id),
            );
            showNotification("success", result.message || "کاربر حذف شد");
            closeDeleteModal();
          } else {
            showNotification("error", result?.message || "خطا در حذف کاربر");
            closeDeleteModal();
          }
        } catch (err) {
          console.error("deleteUser error:", err);
          showNotification("error", "خطای شبکه یا سرور در حذف کاربر");
          closeDeleteModal();
        }
      })();
    });
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (!deleteModal.userIds || deleteModal.userIds.length === 0) return;

    const idsToDelete = deleteModal.userIds;

    // Check if we're trying to delete all admins
    const currentAdmins = users.filter((u) => u.role === "ADMIN");
    const adminsToDelete = users.filter(
      (u) => idsToDelete.includes(u.id) && u.role === "ADMIN",
    );

    if (adminsToDelete.length >= currentAdmins.length) {
      showNotification(
        "error",
        "نمی‌توانید همه مدیران سیستم را حذف کنید. حداقل یک مدیر باید باقی بماند",
      );
      closeDeleteModal();
      return;
    }

    startBulkDeletingTransition(() => {
      void (async () => {
        try {
          const result = await bulkDeleteUsers(idsToDelete);
          if (result?.success) {
            // Only update UI after successful server response
            setUsers((prev) => prev.filter((u) => !idsToDelete.includes(u.id)));
            setSelectedUsers([]);
            showNotification(
              "success",
              result.message || `${idsToDelete.length} کاربر حذف شد`,
            );
            closeDeleteModal();
          } else {
            showNotification("error", result?.message || "خطا در حذف کاربران");
            closeDeleteModal();
          }
        } catch (err) {
          console.error("bulkDeleteUsers error:", err);
          showNotification("error", "خطای شبکه یا سرور در حذف کاربران");
          closeDeleteModal();
        }
      })();
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map((user) => user.id));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <SortAsc className="h-3 w-3 opacity-30" />;
    return sortOrder === "asc" ? (
      <SortAsc className="h-3 w-3" />
    ) : (
      <SortDesc className="h-3 w-3" />
    );
  };

  const getRoleIcon = (role: "ADMIN" | "WRITER") => {
    return role === "ADMIN" ? (
      <Shield className="h-4 w-4 text-red-600" />
    ) : (
      <PenTool className="h-4 w-4 text-blue-600" />
    );
  };

  const getRoleBadge = (role: "ADMIN" | "WRITER") => {
    return role === "ADMIN" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
        <Shield className="h-3 w-3" />
        مدیر
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
        <PenTool className="h-3 w-3" />
        نویسنده
      </span>
    );
  };

  // Create user handler with server action
  const handleCreateUser = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("لطفا نام کاربری را وارد کنید");
      return;
    }

    if (!password.trim()) {
      setError("لطفا رمز عبور را وارد کنید");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تایید آن یکسان نیستند");
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("password", password);
    formData.append("role", role);

    startTransition(async () => {
      const result = await createUser(formData);
      if (result.success) {
        // Use the actual user data returned from the database
        if (result.data) {
          const newUser: UserItem = {
            id: result.data.id,
            username: result.data.username,
            role: result.data.role,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          };
          setUsers((prev) => [newUser, ...prev]);
        }

        // Reset form
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setRole("WRITER");
        setActiveTab("preview");
        showNotification("success", result.message);
      } else {
        setError(result.message);
        showNotification("error", result.message);
      }
    });
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("WRITER");
    setError(null);
  };

  if (!users || users.length === 0) {
    return (
      <div className="bg-bg-1 rounded-2xl text-center">
        {activeTab === "create" ? (
          ""
        ) : (
          <div className="p-8">
            <Users className="mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-semibold">هیچ کاربری یافت نشد</h3>
            <p className="text-light-dark mb-6">
              با ایجاد اولین کاربر خود شروع کنید
            </p>
            <button
              onClick={() => setActiveTab("create")}
              className="mx-auto flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              ایجاد اولین کاربر
            </button>
          </div>
        )}

        {/* render create form here when requested */}
        {activeTab === "create" && (
          <div className="mt-8">
            <CreateForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              role={role}
              setRole={setRole}
              isPending={isPending}
              error={error}
              setError={setError}
              handleCreateUser={handleCreateUser}
              resetForm={resetForm}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={
          deleteModal.type === "single"
            ? confirmSingleDelete
            : confirmBulkDelete
        }
        title={
          deleteModal.type === "single" ? "حذف کاربر" : "حذف گروهی کاربران"
        }
        message={
          deleteModal.type === "single"
            ? `آیا از حذف کاربر مطمئن هستید؟`
            : `آیا از حذف ${deleteModal.userIds?.length || 0} کاربر انتخاب شده مطمئن هستید؟`
        }
        userName={deleteModal.user?.username}
        isLoading={deleteModal.type === "single" ? isDeleting : isBulkDeleting}
        type={deleteModal.type}
        count={deleteModal.userIds?.length || 0}
      />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg border-l-4 p-4 shadow-lg ${
            notification.type === "success"
              ? "border-green-400 bg-green-50 text-green-800"
              : "border-red-400 bg-red-50 text-red-800"
          } animate-in slide-in-from-top-2 transition-all duration-300`}
        >
          <div className="flex w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle className="mr-2 h-5 w-5" />
              ) : (
                <AlertCircle className="mr-2 h-5 w-5" />
              )}
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-black hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-all ${
            activeTab === "preview"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Eye size={16} /> پیش‌ نمایش
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-all ${
            activeTab === "create"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <UserPlus size={16} /> ایجاد کاربر
        </button>
      </div>

      {activeTab === "preview" && (
        <>
          {/* Controls */}
          <div className="bg-bg-1 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="relative min-w-64 flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در کاربران بر اساس شناسه، نام کاربری یا نقش..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="bg-bg-1 rounded-lg border border-gray-300 px-3 py-2 pr-5 text-sm"
                >
                  <option value="all">همه کاربران</option>
                  <option value="admin">مدیران</option>
                  <option value="writer">نویسندگان</option>
                </select>

                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  title="بارگذاری مجدد"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <button
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  title="خروجی"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="bg-primary-40 mt-4 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} کاربر انتخاب شده
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkDeleteClick}
                      disabled={isBulkDeleting}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {isBulkDeleting
                        ? "در حال حذف..."
                        : "حذف موارد انتخاب شده"}
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="rounded-lg bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
                    >
                      پاک کردن انتخاب
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="bg-bg-1 flex items-center justify-between rounded-lg px-4 py-2 text-sm">
            <span>
              نمایش {filteredAndSortedUsers.length} از {users.length} کاربر
              {searchTerm && ` برای "${searchTerm}"`}
            </span>
            <span className="text-xs">
              مرتب‌سازی شده بر اساس {sortField} (
              {sortOrder === "asc" ? "صعودی" : "نزولی"})
            </span>
          </div>

          {/* Table */}
          <div className="bg-bg-1 overflow-hidden rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="divide-light-white min-w-full divide-y">
                <thead className="bg-bg-1">
                  <tr>
                    <th className="px-6 py-4 text-right">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length ===
                            filteredAndSortedUsers.length &&
                          filteredAndSortedUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        شناسه
                        <SortIcon field="id" />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        نام کاربری
                        <SortIcon field="username" />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center gap-2">
                        نقش
                        <SortIcon field="role" />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        تاریخ ایجاد
                        <SortIcon field="createdAt" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg-1 divide-light-white divide-y">
                  {filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-primary-40 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedUsers((prev) =>
                                prev.filter((id) => id !== user.id),
                              );
                            }
                          }}
                          className="border-light-dark h-4 w-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="bg-primary-40 rounded px-2 py-1 text-sm font-bold">
                            #{user.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="max-w-32">
                            <div
                              className="text-light-dark truncate text-sm font-medium"
                              title={user.username}
                            >
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-light-dark px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="text-light-dark px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{formatDate(user.createdAt)}</span>
                          <span className="text-xs text-gray-400">
                            {Math.floor(
                              (Date.now() -
                                new Date(user.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            روز پیش
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(user.id)}
                            disabled={isPending || isDeleting}
                            className="rounded-lg p-2 text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-900 disabled:opacity-50"
                            title="ویرایش کاربر"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={isPending || isDeleting}
                            className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 hover:text-red-900 disabled:opacity-50"
                            title="حذف کاربر"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
                            title="گزینه‌های بیشتر"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No results */}
          {filteredAndSortedUsers.length === 0 && searchTerm && (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-600">
                هیچ کاربری یافت نشد
              </h3>
              <p className="text-gray-500">
                هیچ کاربری با معیارهای جستجوی شما مطابقت ندارد. سعی کنید عبارت
                جستجو یا فیلترها را تنظیم کنید.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="mt-4 font-medium text-blue-600 hover:text-blue-800"
              >
                پاک کردن همه فیلترها
              </button>
            </div>
          )}
        </>
      )}

      {/* Use the CreateForm component here when activeTab === "create" */}
      {activeTab === "create" && (
        <div>
          <CreateForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            role={role}
            setRole={setRole}
            isPending={isPending}
            error={error}
            setError={setError}
            handleCreateUser={handleCreateUser}
            resetForm={resetForm}
          />
        </div>
      )}
    </div>
  );
};

export default UsersContainer;
