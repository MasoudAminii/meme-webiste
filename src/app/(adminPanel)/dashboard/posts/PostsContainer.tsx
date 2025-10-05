"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Hash,
  Heart,
  Image as ImageIcon,
  MoreHorizontal,
  RefreshCw,
  Save,
  Search,
  Share2,
  SortAsc,
  SortDesc,
  Trash2,
  UploadCloud,
  User,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState, useTransition } from "react";

import {
  bulkDeletePosts,
  createPost,
  deletePost,
} from "@/actions/postsActions"; // Import your server actions

// MediaItem type based on your Prisma schema
interface MediaItem {
  id: number;
  slug: string | null; // Changed to allow null to match Prisma schema
  src?: string | null;
  description?: string | null;
  author?: string | null;
  likes: number;
  shares: number;
  views: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

type SortField =
  | "id"
  | "slug"
  | "author"
  | "likes"
  | "shares"
  | "views"
  | "createdAt";

type SortOrder = "asc" | "desc";

type FilterType = "all" | "with-media" | "no-media" | "popular";

const maxImageSizeMB = 10;
const maxVideoSizeMB = 50;

const isVideoFile = (filename?: string) => {
  if (!filename) return false;
  const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov"];
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

/**
 * Delete Confirmation Modal
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string | null; // Changed to allow null
  isLoading?: boolean;
  type?: "single" | "bulk";
  count?: number;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
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

            {/* Item Info Display */}
            {itemName && type === "single" && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {itemName || "بدون عنوان"}
                  </span>
                </div>
              </div>
            )}

            {/* Bulk Delete Info */}
            {type === "bulk" && count > 0 && (
              <div className="mb-4 rounded-lg bg-red-50 p-3">
                <div className="text-sm text-red-800">
                  <span className="font-medium">{count}</span> مورد انتخاب شده
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

const PostsContainer = ({ data }: { data: MediaItem[] }) => {
  const [activeTab, setActiveTab] = useState<"preview" | "create">("preview");
  const [posts, setPosts] = useState<MediaItem[]>(data || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    post?: MediaItem;
    postIds?: number[];
  }>({ isOpen: false, type: "single" });

  // React transitions for server actions
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isBulkDeleting, startBulkDeletingTransition] = useTransition();

  // Form state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: "image" | "video";
    file: File;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Basic post fields
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");

  // Advanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        (post.slug || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (post.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.id.toString().includes(searchTerm);

      const matchesFilter = (() => {
        switch (filter) {
          case "with-media":
            return !!post.src;
          case "no-media":
            return !post.src;
          case "popular":
            return post.views > 100 || post.likes > 10;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aVal: string | number | Date = a[sortField as keyof MediaItem] as
        | string
        | number
        | Date;
      const bVal: string | number | Date = b[sortField as keyof MediaItem] as
        | string
        | number
        | Date;
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
  }, [posts, searchTerm, sortField, sortOrder, filter]);

  // Notification system
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Server Actions
  const handleEdit = async (id: number) => {
    // Navigate to edit page or open edit modal
    showNotification("success", `پست ${id} برای ویرایش باز شد`);
  };

  // --- Delete modal handlers ---
  const handleDeleteClick = (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setDeleteModal({ isOpen: true, type: "single", post });
  };

  const handleBulkDeleteClick = () => {
    if (selectedPosts.length === 0) return;
    setDeleteModal({ isOpen: true, type: "bulk", postIds: [...selectedPosts] });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single" });
  };

  const confirmSingleDelete = async () => {
    if (!deleteModal.post) return;
    const post = deleteModal.post;

    // Optimistic UI: remove immediately, keep a snapshot for rollback
    const prevPosts = posts;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setSelectedPosts((prev) =>
      prev.filter((selectedId) => selectedId !== post.id),
    );

    startDeletingTransition(() => {
      void (async () => {
        try {
          const result = await deletePost(post.id);
          if (result?.success) {
            showNotification("success", result.message || "پست حذف شد");
            closeDeleteModal();
          } else {
            // rollback if server returned failure
            setPosts(prevPosts);
            showNotification("error", result?.message || "خطا در حذف پست");
            closeDeleteModal();
          }
        } catch (err) {
          // rollback on unexpected error
          setPosts(prevPosts);
          console.error("deletePost error:", err);
          showNotification("error", "خطای شبکه یا سرور در حذف پست");
          closeDeleteModal();
        }
      })();
    });
  };

  const confirmBulkDelete = async () => {
    if (!deleteModal.postIds || deleteModal.postIds.length === 0) return;
    const idsToDelete = deleteModal.postIds;

    // Optimistic UI: remove selected posts immediately, keep snapshot for rollback
    const prevPosts = posts;
    setPosts((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
    setSelectedPosts([]);

    startBulkDeletingTransition(() => {
      void (async () => {
        try {
          const result = await bulkDeletePosts(idsToDelete);
          if (result?.success) {
            showNotification(
              "success",
              result.message || `${idsToDelete.length} پست حذف شد`,
            );
            closeDeleteModal();
          } else {
            // rollback
            setPosts(prevPosts);
            showNotification("error", result?.message || "خطا در حذف پست‌ها");
            closeDeleteModal();
          }
        } catch (err) {
          setPosts(prevPosts);
          console.error("bulkDeletePosts error:", err);
          showNotification("error", "خطای شبکه یا سرور در حذف پست‌ها");
          closeDeleteModal();
        }
      })();
    });
  };

  // --- end modal handlers ---

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredAndSortedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredAndSortedPosts.map((post) => post.id));
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

  const openMedia = (src: string) => {
    window.open(`/gallery/${src}`, "_blank");
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

  const getEngagementRate = (post: MediaItem) => {
    if (post.views === 0) return 0;
    return ((post.likes + post.shares) / post.views) * 100;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <SortAsc className="h-3 w-3 opacity-30" />;
    return sortOrder === "asc" ? (
      <SortAsc className="h-3 w-3" />
    ) : (
      <SortDesc className="h-3 w-3" />
    );
  };

  // File & drag handlers
  const openFileDialog = () => {
    fileRef.current?.click();
  };

  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement> | FileList | null,
  ) => {
    setError(null);
    const file =
      e instanceof Event
        ? null
        : (e as React.ChangeEvent<HTMLInputElement>)?.target?.files?.[0] ||
          (e as FileList)?.[0] ||
          null;

    if (!file) return;

    // Check file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("فرمت فایل باید تصویر یا ویدیو باشد");
      return;
    }

    // Check file size
    const maxSize = isVideo ? maxVideoSizeMB : maxImageSizeMB;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم فایل نباید بیشتر از ${maxSize}MB باشد`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setMediaPreview({
        url: result,
        type: isVideo ? "video" : "image",
        file: file,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMediaUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Create post handler with server action
  const handleCreatePost = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const formData = new FormData();
    // Only append slug if user provided one, otherwise let DB generate cuid
    if (slug.trim()) {
      formData.append("slug", slug.trim());
    }
    if (description.trim()) formData.append("description", description.trim());
    if (author.trim()) formData.append("author", author.trim());
    if (mediaPreview?.file) formData.append("media", mediaPreview.file);

    startTransition(async () => {
      const result = await createPost(formData);
      if (result.success) {
        // Use the actual post data returned from the database
        if (result.data) {
          const newPost: MediaItem = {
            id: result.data.id,
            slug: result.data.slug,
            src: result.data.src,
            description: result.data.description,
            author: result.data.author,
            likes: result.data.likes || 0,
            shares: result.data.shares || 0,
            views: result.data.views || 0,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          };
          setPosts((prev) => [newPost, ...prev]);
        }

        // Reset form
        setSlug("");
        setDescription("");
        setAuthor("");
        removeMedia();
        setActiveTab("preview");
        showNotification("success", result.message);
      } else {
        showNotification("error", result.message);
      }
    });
  };

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
        title={deleteModal.type === "single" ? "حذف پست" : "حذف گروهی پست‌ها"}
        message={
          deleteModal.type === "single"
            ? `آیا از حذف این پست مطمئن هستید؟`
            : `آیا از حذف ${deleteModal.postIds?.length || 0} پست انتخاب شده مطمئن هستید؟`
        }
        itemName={deleteModal.post?.slug}
        isLoading={deleteModal.type === "single" ? isDeleting : isBulkDeleting}
        type={deleteModal.type}
        count={deleteModal.postIds?.length || 0}
      />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg border-l-4 p-4 shadow-lg ${"border-green-400 bg-green-50 text-green-800"} animate-in slide-in-from-top-2 transition-all duration-300`}
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

      {/* Header with Stats */}
      <div className="bg-bg-1 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">داشبورد صفحه درباره ما</h1>
            <p className="text-light-dark mt-1">
              نمایش و مدیریت محتوای صفحه درباره ما — (داده‌ها از سرور بارگذاری
              می‌شوند)
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{posts.length}</div>
              <div className="opacity-80">تعداد پست‌ها</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {posts.filter((p) => p.src).length}
              </div>
              <div className="opacity-80">دارای رسانه</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
              </div>
              <div className="opacity-80">بازدید کل</div>
            </div>
          </div>
        </div>
      </div>

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
          <Edit3 size={16} /> ایجاد کنید
        </button>
      </div>

      {activeTab === "preview" && (
        <>
          {/* Controls */}
          <div className="bg-bg-1 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="relative min-w-64 flex-1">
                <Search className="text-light-dark absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <input
                  type="text"
                  placeholder="جستجو در پست‌ها بر اساس شناسه، اسلاگ، توضیح یا نویسنده..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-light-dark w-full rounded-lg border py-2 pr-4 pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <Filter className="text-light-dark h-4 w-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="border-light-dark bg-bg-1 rounded-lg border px-3 py-2 pr-5 text-sm"
                >
                  <option value="all">همه پست‌ها</option>
                  <option value="with-media">دارای رسانه</option>
                  <option value="no-media">بدون رسانه</option>
                  <option value="popular">
                    محبوب (بیش از ۱۰۰ بازدید یا بیش از ۱۰ لایک)
                  </option>
                </select>

                <button
                  onClick={() => window.location.reload()}
                  className="text-light-dark rounded-lg p-2 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  title="بارگذاری مجدد"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <button
                  className="text-light-dark rounded-lg p-2 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  title="خروجی"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <div className="bg-primary-40 mt-4 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedPosts.length} پست انتخاب شده
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
                      onClick={() => setSelectedPosts([])}
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
              نمایش {filteredAndSortedPosts.length} از {posts.length} پست
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
                          selectedPosts.length ===
                            filteredAndSortedPosts.length &&
                          filteredAndSortedPosts.length > 0
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
                      onClick={() => handleSort("slug")}
                    >
                      <div className="flex items-center gap-2">
                        اسلاگ
                        <SortIcon field="slug" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      محتوا
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100"
                      onClick={() => handleSort("author")}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        نویسنده
                        <SortIcon field="author" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      نرخ تعامل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      رسانه
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
                  {filteredAndSortedPosts.map((post) => (
                    <tr
                      key={post.id}
                      className={`hover:bg-primary-40 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPosts((prev) => [...prev, post.id]);
                            } else {
                              setSelectedPosts((prev) =>
                                prev.filter((id) => id !== post.id),
                              );
                            }
                          }}
                          className="border-light-dark h-4 w-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="bg-primary-40 rounded px-2 py-1 text-sm font-bold">
                            #{post.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-32">
                          <div
                            className="text-light-dark truncate text-sm font-medium"
                            title={post.slug || ""}
                          >
                            {post.slug || (
                              <span className="text-gray-400 italic">
                                بدون عنوان
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-48">
                          <div
                            className="text-light-dark truncate text-sm"
                            title={post.description || ""}
                          >
                            {post.description || (
                              <span className="text-gray-400 italic">
                                بدون توضیح
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.author ? (
                            <div className="flex items-center gap-2">
                              <div className="from-accent flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r to-purple-500 text-xs font-semibold text-white">
                                {post.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-light-dark text-sm">
                                {post.author}
                              </span>
                            </div>
                          ) : (
                            <span className="text-light-dark italic">
                              ناشناخته
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-light-dark flex items-center gap-1">
                                <Eye className="mr-1 h-3 w-3" />
                                {post.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1 text-red-600">
                                <Heart className="mr-1 h-3 w-3" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Share2 className="mr-1 h-3 w-3" />
                                {post.shares}
                              </span>
                            </div>
                          </div>
                          <div className="h-1 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                              style={{
                                width: `${Math.min(getEngagementRate(post), 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {getEngagementRate(post).toFixed(1)}% نرخ تعامل
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.src ? (
                          <button
                            onClick={() => openMedia(post.src!)}
                            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 transition-colors hover:bg-green-200"
                            title="مشاهده رسانه"
                          >
                            {isVideoFile(post.src) ? (
                              <>
                                <Video className="mr-1 h-3 w-3" />
                                مشاهده ویدیو
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-1 h-3 w-3" />
                                مشاهده رسانه
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            بدون رسانه
                          </span>
                        )}
                      </td>
                      <td className="text-light-dark px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="text-xs text-gray-400">
                            {Math.floor(
                              (Date.now() -
                                new Date(post.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            روز پیش
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(post.id)}
                            disabled={isPending || isDeleting}
                            className="rounded-lg p-2 text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-900 disabled:opacity-50"
                            title="ویرایش پست"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post.id)}
                            disabled={isPending || isDeleting}
                            className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 hover:text-red-900 disabled:opacity-50"
                            title="حذف پست"
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
          {filteredAndSortedPosts.length === 0 && searchTerm && (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-600">
                هیچ پستی یافت نشد
              </h3>
              <p className="text-gray-500">
                هیچ پستی با معیارهای جستجوی شما مطابقت ندارد. سعی کنید عبارت
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

      {activeTab === "create" && (
        <div>
          <form className="space-y-8" onSubmit={handleCreatePost}>
            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <ImageIcon size={24} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">رسانه و محتوا</h3>
                  <p className="text-light-dark mt-1 text-sm">
                    تصویر یا ویدیو و توضیحات پست را مدیریت کنید
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <label className="text-light-dark mb-3 block text-base font-semibold">
                  فایل رسانه (تصویر یا ویدیو)
                </label>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Upload Section */}
                  <div className="image-upload w-full">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaUpload(e)}
                      className="hidden"
                      name="media"
                      disabled={isPending}
                    />

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={openFileDialog}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      aria-label="بارگذاری رسانه"
                      className={`group relative h-full cursor-pointer overflow-hidden rounded-xl border-2 py-20 transition-all duration-300 select-none ${dragActive ? "border-light-dark bg-bg-1 scale-[1.02] shadow-lg" : "bg-bg-1 border-light-dark hover:border-accent hover:bg-accent/10 border-dashed"}`}
                    >
                      <div className="h-full p-4 md:p-8">
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div
                            className={`mb-3 rounded-full p-3 transition-all duration-300 md:mb-4 md:p-4 ${dragActive ? "scale-110 bg-indigo-100" : "bg-gray-100 group-hover:scale-105 group-hover:bg-indigo-100"}`}
                          >
                            <UploadCloud
                              size={32}
                              className={`transition-colors duration-300 ${dragActive ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"}`}
                            />
                          </div>

                          <div className="space-y-1 md:space-y-2">
                            <h4 className="text-base font-semibold md:text-lg">
                              {dragActive
                                ? "فایل را رها کنید"
                                : "تصویر یا ویدیو را انتخاب کنید"}
                            </h4>
                            <p className="text-light-dark text-xs md:text-sm">
                              فایل را بکشید و رها کنید یا برای انتخاب کلیک کنید
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] md:mt-3 md:text-xs">
                              <span className="bg-primary-40 rounded-full border px-2 py-1">
                                تصویر: حداکثر {maxImageSizeMB}MB
                              </span>
                              <span className="bg-primary-40 rounded-full border px-2 py-1">
                                ویدیو: حداکثر {maxVideoSizeMB}MB
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover gradient */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-indigo-500/5 group-hover:to-purple-500/5" />
                    </div>

                    {error && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 md:mt-4 md:gap-3 md:px-4 md:py-3 md:text-sm">
                        <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 md:h-5 md:w-5">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-600 md:h-2 md:w-2"></div>
                        </div>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  {mediaPreview && (
                    <div className="bg-primary-40 w-full rounded-xl p-4 shadow-sm md:p-6">
                      <div className="flex flex-col gap-4 md:gap-6">
                        <div className="relative overflow-hidden rounded-lg shadow-md">
                          {mediaPreview.type === "image" ? (
                            <Image
                              src={mediaPreview.url}
                              alt="preview"
                              width={800}
                              height={600}
                              className="max-h-60 w-full object-contain md:max-h-80"
                            />
                          ) : (
                            <video
                              src={mediaPreview.url}
                              controls
                              className="max-h-60 w-full object-contain md:max-h-80"
                            >
                              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            </video>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 md:mb-4">
                            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold md:text-base">
                              {mediaPreview.type === "video" ? (
                                <>
                                  <Video size={16} />
                                  ویدیو انتخاب شده
                                </>
                              ) : (
                                <>
                                  <ImageIcon size={16} />
                                  تصویر انتخاب شده
                                </>
                              )}
                            </h4>
                            <p className="text-light-dark text-xs md:text-sm">
                              نام فایل: {mediaPreview.file.name}
                            </p>
                            <p className="text-light-dark text-xs md:text-sm">
                              اندازه:{" "}
                              {(mediaPreview.file.size / (1024 * 1024)).toFixed(
                                2,
                              )}{" "}
                              MB
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3">
                            <button
                              type="button"
                              onClick={() => !isPending && openFileDialog()}
                              disabled={isPending}
                              className="border-light-dark flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 md:px-4 md:text-sm"
                            >
                              <UploadCloud size={14} />
                              تغییر فایل
                            </button>

                            <button
                              type="button"
                              onClick={() => !isPending && removeMedia()}
                              disabled={isPending}
                              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 md:px-4 md:text-sm"
                            >
                              <Trash2 size={14} />
                              حذف
                            </button>

                            <div className="flex items-center gap-2 text-xs font-medium text-green-700 md:ml-auto md:text-sm">
                              <CheckCircle size={16} />
                              آماده برای ذخیره
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <FileText size={24} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">اطلاعات پایه پست</h3>
                  <p className="text-light-dark mt-1 text-sm">
                    عنوان، توضیحات و نویسنده پست را وارد کنید
                  </p>
                </div>
              </div>
              <div>
                <div className="mb-4 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-light-dark mb-2 block text-base font-semibold">
                      اسلاگ / عنوان پست *
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="عنوان یا اسلاگ پست را وارد کنید (اختیاری)..."
                        disabled={isPending}
                        className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-50`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-light-dark mb-2 block text-base font-semibold">
                      نویسنده
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="نام نویسنده..."
                        disabled={isPending}
                        className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-light-dark mb-2 block text-base font-semibold">
                    توضیحات
                  </label>
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="توضیحات پست را وارد کنید..."
                      disabled={isPending}
                      className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-50`}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    aria-busy={isPending ? true : undefined}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {/* Icon: spinner while isPending, save icon when not isPending */}
                    {isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden />
                    )}

                    {/* Text */}
                    <span> {isPending ? "در حال ذخیره..." : "ایجاد پست"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostsContainer;
