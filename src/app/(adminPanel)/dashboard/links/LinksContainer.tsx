"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import imageCompression from "browser-image-compression";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Copy,
  Edit,
  Edit3,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import React, {
  Suspense,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

// Import your actual server actions
import { createLink, deleteLink, reorderLinks } from "@/actions/linkActions"; // Adjust path as needed

type ActionState = {
  success?: true; // Changed from boolean to true
  error?: string;
  message?: string;
};

type Link = {
  id: number;
  label?: string | null;
  username?: string | null;
  logoUrl?: string | null;
  backgroundCss?: string | null;
  textColor?: string | null;
  slug?: string | null;
  targetUrl?: string | null;
};

// --- helpers ---
function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

/**
 * Delete Confirmation Modal
 */
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  // allow null because Link fields are `string | null`
  itemName?: string | null;
  isLoading?: boolean;
}
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
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
            {itemName && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <LinkIcon className="h-4 w-4" />
                  <span className="font-medium">{itemName}</span>
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

export default function LinksContainer({ data }: { data: Link[] }) {
  const [activeTab, setActiveTab] = useState<"preview" | "create">("preview");
  const [isEditing, setIsEditing] = useState(false);

  // Optimistic updates for delete functionality
  const [optimisticLinks, updateOptimisticLinks] = useOptimistic(
    data,
    (currentLinks, deletedLinkId: number) =>
      currentLinks.filter((link) => link.id !== deletedLinkId),
  );
  const [isPending] = useTransition();
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    link?: Link;
  }>({ isOpen: false });

  // React transitions for delete operations
  const [isDeleting, startDeletingTransition] = useTransition();

  // Form state - updated to include slug
  const [formData, setFormData] = useState({
    slug: "",
    username: "",
    logoUrl: "default.png",
    backgroundType: "gradient" as "solid" | "gradient",
    solidColor: "#3B82F6",
    gradientAngle: 90,
    gradientColor1: "#3B82F6",
    gradientColor2: "#8B5CF6",
    gradientStop1: 0,
    gradientStop2: 100,
    backgroundCss: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
    textColor: "#ffffff",
    label: "",
    targetUrl: "",
  });

  // File upload state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("default.png");

  // Server action state - proper React 19 pattern
  const [state, formAction, pending] = useActionState<
    ActionState | null,
    FormData
  >(async (prevState, formData) => {
    if (selectedFile) {
      formData.set("logoFile", selectedFile);
    }
    return createLink(prevState ?? undefined, formData);
  }, null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // set notification when server action state changes
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      const msg = state.message || "عملیات با موفقیت انجام شد.";
      setNotification({ type: "success", message: msg });
    } else if (state.error) {
      const msg = state.error || "خطایی رخ داد.";
      setNotification({ type: "error", message: msg });
    }
  }, [state]);

  // If you also want deleteMessage to auto-dismiss (recommended), add this:
  useEffect(() => {
    if (!deleteMessage) return;
    const t = setTimeout(() => setDeleteMessage(null), 3500);
    return () => clearTimeout(t);
  }, [deleteMessage]);

  // Handle form submission with proper transition
  const [isSubmitting, startSubmitTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startSubmitTransition(async () => {
      const submittedFormData = new FormData(e.currentTarget);

      // Ensure all current form values from component state are included
      submittedFormData.set("slug", formData.slug);
      submittedFormData.set("username", formData.username);
      submittedFormData.set("label", formData.label);
      submittedFormData.set("targetUrl", formData.targetUrl);
      submittedFormData.set("backgroundCss", formData.backgroundCss);
      submittedFormData.set("textColor", formData.textColor);

      // ✅ ONLY set logoUrl if no new file is being uploaded
      if (!selectedFile) {
        // Extract just the filename if it's a path
        const cleanLogoUrl = formData.logoUrl.includes("/")
          ? formData.logoUrl.split("/").pop() || "default.png"
          : formData.logoUrl;
        submittedFormData.set("logoUrl", cleanLogoUrl);
      }

      // Add file if exists
      if (selectedFile) {
        submittedFormData.set("logoFile", selectedFile);
      }

      // Call the server action within transition
      formAction(submittedFormData);
    });
  };
  const maxSizeMB = 2;

  const humanFileSize = (bytes: number) => {
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
  };

  // Generate gradient CSS
  const generateGradientCSS = (
    angle: number,
    color1: string,
    color2: string,
    stop1: number,
    stop2: number,
  ) => {
    return `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
  };

  // Parse background CSS to extract colors and type
  const parseBackgroundCSS = (bgCss: string) => {
    if (!bgCss) return null;

    // Check if it's a solid color (hex)
    if (bgCss.startsWith("#")) {
      return {
        type: "solid" as const,
        solidColor: bgCss,
      };
    }

    // Check if it's a linear gradient
    const gradientMatch = bgCss.match(
      /linear-gradient\((\d+)deg,\s*([^,\s]+)\s+(\d+)%,\s*([^,\s]+)\s+(\d+)%\)/,
    );
    if (gradientMatch) {
      return {
        type: "gradient" as const,
        angle: parseInt(gradientMatch[1]),
        color1: gradientMatch[2].trim(),
        color2: gradientMatch[4].trim(),
        stop1: parseInt(gradientMatch[3]),
        stop2: parseInt(gradientMatch[5]),
      };
    }

    return null;
  };

  // Generate background style
  const generateBackgroundStyle = (fd = formData) => {
    if (fd.backgroundType === "solid") {
      return fd.solidColor || "#3B82F6";
    } else {
      return generateGradientCSS(
        fd.gradientAngle || 90,
        fd.gradientColor1 || "#3B82F6",
        fd.gradientColor2 || "#8B5CF6",
        fd.gradientStop1 || 0,
        fd.gradientStop2 || 100,
      );
    }
  };

  // Contrast calculation helpers
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const cleaned =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const bigint = parseInt(cleaned, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };

  const relativeLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const srgb = [r, g, b]
      .map((v) => v / 255)
      .map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
      );
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };

  const contrastRatio = (hexA: string, hexB: string) => {
    const L1 = relativeLuminance(hexA);
    const L2 = relativeLuminance(hexB);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return +((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  };

  const autoTextColor = () => {
    if (formData.backgroundType === "solid") {
      const c = formData.solidColor;
      return contrastRatio(c, "#ffffff") >= 4.5 ? "#ffffff" : "#000000";
    }
    const a = hexToRgb(formData.gradientColor1);
    const b = hexToRgb(formData.gradientColor2);
    const mix = (v1: number, v2: number) => Math.round((v1 + v2) / 2);
    const midHex =
      "#" +
      [mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b)]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
    return contrastRatio(midHex, "#ffffff") >= 4.5 ? "#ffffff" : "#000000";
  };

  const PRESETS = [
    { label: "Indigo → Purple", g1: "#3B82F6", g2: "#8B5CF6", angle: 90 },
    { label: "Sunset", g1: "#FF7A59", g2: "#FFCF6B", angle: 110 },
    { label: "Emerald", g1: "#10B981", g2: "#06B6D4", angle: 120 },
    { label: "Pink Lagoon", g1: "#FF6BCB", g2: "#6B7BFF", angle: 45 },
  ];

  const applyPreset = (p: {
    label: string;
    g1: string;
    g2: string;
    angle: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      backgroundType: "gradient",
      gradientColor1: p.g1,
      gradientColor2: p.g2,
      gradientAngle: p.angle,
      gradientStop1: 0,
      gradientStop2: 100,
      backgroundCss: generateGradientCSS(p.angle, p.g1, p.g2, 0, 100),
    }));
  };

  // Debounced update of backgroundCss
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // Calculate bgCss directly without calling generateBackgroundStyle
      const bgCss =
        formData.backgroundType === "solid"
          ? formData.solidColor || "#3B82F6"
          : `linear-gradient(${formData.gradientAngle || 90}deg, ${formData.gradientColor1 || "#3B82F6"} ${formData.gradientStop1 || 0}%, ${formData.gradientColor2 || "#8B5CF6"} ${formData.gradientStop2 || 100}%)`;

      setFormData((prev) => ({
        ...prev,
        backgroundCss: bgCss,
      }));
    }, 120);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [
    formData.backgroundType,
    formData.solidColor,
    formData.gradientAngle,
    formData.gradientColor1,
    formData.gradientColor2,
    formData.gradientStop1,
    formData.gradientStop2,
  ]);

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      slug: "",
      username: "",
      logoUrl: "default.png",
      backgroundType: "gradient",
      solidColor: "#3B82F6",
      gradientAngle: 90,
      gradientColor1: "#3B82F6",
      gradientColor2: "#8B5CF6",
      gradientStop1: 0,
      gradientStop2: 100,
      backgroundCss: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
      textColor: "#ffffff",
      label: "",
      targetUrl: "",
    });
    setSelectedFile(null);
    setPreviewUrl("default.png");
    setError(null);
    setProgress(0);
    setUploading(false);
    setIsEditing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Edit link function
  const handleEditLink = (link: Link) => {
    // Parse background CSS
    const parsedBg = parseBackgroundCSS(link.backgroundCss || "");

    // Set form data with link values
    const newFormData = {
      slug: link.slug || "",
      username: link.username || "",
      logoUrl: link.logoUrl || "default.png", // ✅ Keep original filename, not path
      backgroundType: parsedBg?.type || ("gradient" as "solid" | "gradient"),
      solidColor: parsedBg?.type === "solid" ? parsedBg.solidColor : "#3B82F6",
      gradientAngle: parsedBg?.type === "gradient" ? parsedBg.angle : 90,
      gradientColor1:
        parsedBg?.type === "gradient" ? parsedBg.color1 : "#3B82F6",
      gradientColor2:
        parsedBg?.type === "gradient" ? parsedBg.color2 : "#8B5CF6",
      gradientStop1: parsedBg?.type === "gradient" ? parsedBg.stop1 : 0,
      gradientStop2: parsedBg?.type === "gradient" ? parsedBg.stop2 : 100,
      backgroundCss:
        link.backgroundCss ||
        "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
      textColor: link.textColor || "#ffffff",
      label: link.label || "",
      targetUrl: link.targetUrl || "",
    };

    setFormData(newFormData);

    // Set logo preview - use path for display only
    if (link.logoUrl && link.logoUrl !== "default.png") {
      const logoPath = link.logoUrl.startsWith("/")
        ? link.logoUrl
        : `/logo/Links/${link.logoUrl}`;
      setPreviewUrl(logoPath);
    } else {
      setPreviewUrl("default.png");
    }
    // Clear file selection since we're editing existing
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";

    // Set editing state
    setIsEditing(true);
    setActiveTab("create");
  };

  // --- Delete modal handlers ---
  const handleDeleteClick = (link: Link) => {
    setDeleteModal({ isOpen: true, link });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const confirmDelete = async () => {
    if (!deleteModal.link) return;
    const link = deleteModal.link;

    startDeletingTransition(async () => {
      try {
        // Perform optimistic update
        updateOptimisticLinks(link.id);

        const result = await deleteLink(link.id);

        if (result?.success || !result?.error) {
          setDeleteMessage({
            type: "success",
            text: result?.message || "لینک حذف شد",
          });
          closeDeleteModal();

          // Force a router refresh to get fresh data from server
          window.location.reload();
        } else {
          setDeleteMessage({
            type: "error",
            text: result?.error || "خطا در حذف لینک",
          });
          closeDeleteModal();
          window.location.reload();
        }
      } catch (err) {
        console.error("deleteLink error:", err);
        setDeleteMessage({
          type: "error",
          text: "خطای شبکه یا سرور در حذف لینک",
        });
        closeDeleteModal();
        window.location.reload();
      }
    });
  };

  // FIXED FILE HANDLING
  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("لطفا یک فایل تصویر انتخاب کنید.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(
        `حجم تصویر بیش از ${maxSizeMB}MB است. (${humanFileSize(file.size)})`,
      );
      return;
    }

    try {
      setUploading(true);
      setProgress(6);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // ✅ FIX: Get extension from MIME type and create new File with proper name
      const mimeToExt: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
      };

      const extension = mimeToExt[compressedFile.type] || ".jpg";
      const newFileName = `compressed-${Date.now()}${extension}`;

      // Create a new File object with the proper name
      const renamedFile = new File([compressedFile], newFileName, {
        type: compressedFile.type,
      });

      // Store the renamed compressed file for form submission
      setSelectedFile(renamedFile);

      // Create preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        setFormData((prev) => ({
          ...prev,
          logoUrl: dataUrl, // For preview only
        }));
      };
      reader.readAsDataURL(compressedFile);

      // Fake progress animation
      let pct = 6;
      const id = setInterval(() => {
        pct += Math.floor(Math.random() * 12) + 4;
        if (pct >= 100) {
          pct = 100;
          clearInterval(id);
          setTimeout(() => setUploading(false), 400);
        }
        setProgress(Math.min(100, pct));
      }, 140);
    } catch (err) {
      console.error(err);
      setError("خطا در پردازش تصویر. لطفا دوباره تلاش کنید.");
      setUploading(false);
      setSelectedFile(null);
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    handleFile(f);
  };

  const openFileDialog = () => fileRef.current?.click();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeLogo = () => {
    setFormData((p) => ({ ...p, logoUrl: "default.png" }));
    setSelectedFile(null);
    setPreviewUrl("default.png");
    if (fileRef.current) fileRef.current.value = "";
    setProgress(0);
    setUploading(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form on success
  useEffect(() => {
    if (state?.success) {
      console.log("Success:", state.message);
      setActiveTab("preview");
      resetForm();
    }
    if (state?.error) {
      console.error("Error:", state.error);
      setError(state.error);
    }
  }, [state]);

  // auto-dismiss notification after 4000ms (matches PostsContainer)
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const copyCss = async () => {
    const css = `background: ${generateBackgroundStyle()};`;
    try {
      await navigator.clipboard.writeText(css);
      console.log("Copied CSS:", css);
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="حذف لینک"
        message="آیا از حذف این لینک مطمئن هستید؟"
        itemName={deleteModal.link?.label || deleteModal.link?.slug}
        isLoading={isDeleting}
      />

      {/* Tabs */}
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
          onClick={() => {
            if (!isEditing) {
              resetForm();
            }
            setActiveTab("create");
          }}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-all ${
            activeTab === "create"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Edit3 size={16} /> {isEditing ? "ویرایش" : "ایجاد کنید"}
        </button>
      </div>

      {/* PREVIEW */}
      {activeTab === "preview" && (
        <div dir="ltr" className="Links mt-4 max-lg:mb-24 max-sm:mb-20 md:mt-8">
          <Suspense
            fallback={
              <LinksGridSkeleton groups={chunkArray(optimisticLinks, 6)} />
            }
          >
            <LinksGrid
              groups={chunkArray(optimisticLinks, 6)}
              onDelete={handleDeleteClick}
              onEdit={handleEditLink}
              isDeleting={isDeleting}
            />
          </Suspense>
        </div>
      )}

      {/* CREATE FORM */}
      {activeTab === "create" && (
        <div>
          {/* Header showing if editing */}
          {isEditing && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Edit size={20} className="text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      در حال ویرایش لینک
                    </h4>
                    <p className="text-sm text-blue-700">
                      شناسه: {formData.slug}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab("preview");
                  }}
                  className="text-sm text-blue-700 hover:text-blue-900"
                >
                  انصراف از ویرایش
                </button>
              </div>
            </div>
          )}

          {/* CORRECTED FORM - Uses onSubmit handler */}
          <form className="space-y-8" onSubmit={handleFormSubmit}>
            {/* Basic Information */}
            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <LinkIcon size={24} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">اطلاعات اصلی</h3>
                  <p className="text-light-dark mt-1 text-sm">
                    اطلاعات اساسی لینک خود را وارد کنید
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-light-dark mb-2 block text-sm font-medium">
                    شناسه منحصر (Slug) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="my-link"
                    className="border-light-dark w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-60"
                    required
                    disabled={pending || isSubmitting || isEditing} // Disable slug editing in edit mode
                  />
                  {isEditing && (
                    <p className="mt-1 text-xs text-gray-500">
                      شناسه در حالت ویرایش قابل تغییر نیست
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-light-dark mb-2 block text-sm font-medium">
                    نام کاربری *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="border-light-dark w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-60"
                    required
                    disabled={pending || isSubmitting}
                  />
                </div>

                <div>
                  <label className="text-light-dark mb-2 block text-sm font-medium">
                    عنوان لینک *
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="عنوان لینک"
                    className="border-light-dark w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-60"
                    required
                    disabled={pending}
                  />
                </div>

                <div>
                  <label className="text-light-dark mb-2 block text-sm font-medium">
                    آدرس هدف *
                  </label>
                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="border-light-dark w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-60"
                    required
                    disabled={pending}
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload Section - keeping your existing UI but with fixed functionality */}
            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <ImageIcon size={24} className="text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">لوگو</h3>
                  <p className="text-light-dark mt-1 text-sm">
                    لوگوی نمایان شده در کنار نام کاربری لینک شما
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-light-dark mb-3 block text-base font-semibold">
                  تصویر لوگو
                </label>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Upload Section */}
                  <div className="image-upload w-full">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={pending || isSubmitting}
                    />

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={openFileDialog}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      aria-label="بارگذاری لوگو"
                      className={`group relative h-full cursor-pointer overflow-hidden rounded-xl border-2 py-20 transition-all duration-300 select-none ${
                        dragActive
                          ? "border-light-dark bg-bg-1 scale-[1.02] shadow-lg"
                          : "bg-bg-1 border-light-dark hover:border-accent hover:bg-accent/10 border-dashed"
                      }`}
                    >
                      <div className="h-full p-4 md:p-8">
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <div
                            className={`mb-3 rounded-full p-3 transition-all duration-300 md:mb-4 md:p-4 ${
                              dragActive
                                ? "scale-110 bg-indigo-100"
                                : "bg-gray-100 group-hover:scale-105 group-hover:bg-indigo-100"
                            }`}
                          >
                            <UploadCloud
                              size={32}
                              className={`transition-colors duration-300 ${
                                dragActive
                                  ? "text-indigo-600"
                                  : "text-gray-500 group-hover:text-indigo-600"
                              }`}
                            />
                          </div>

                          <div className="space-y-1 md:space-y-2">
                            <h4 className="text-base font-semibold md:text-lg">
                              {dragActive
                                ? "فایل را رها کنید"
                                : isEditing && previewUrl !== "default.png"
                                  ? "تصویر جدید انتخاب کنید"
                                  : "تصویر لوگو را انتخاب کنید"}
                            </h4>
                            <p className="text-light-dark text-xs md:text-sm">
                              فایل را بکشید و رها کنید یا برای انتخاب کلیک کنید
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] md:text-xs">
                              <span className="bg-primary-40 rounded-full border px-2 py-1">
                                حداکثر {maxSizeMB}MB
                              </span>
                              <span className="bg-primary-40 rounded-full border px-2 py-1">
                                مربعی پیشنهادی
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview - Updated to show when file is selected OR when editing with existing image */}
                  {((selectedFile &&
                    previewUrl &&
                    previewUrl !== "default.png") ||
                    (isEditing && previewUrl !== "default.png")) && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-primary-40 w-full rounded-xl p-4 shadow-sm md:p-6">
                        <div className="flex flex-col gap-4 md:gap-6">
                          <div className="relative overflow-hidden rounded-lg p-2">
                            <Image
                              src={previewUrl}
                              alt="preview"
                              width={240}
                              height={240}
                              className="max-h-60 w-full object-contain"
                            />

                            {uploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="bg-bg-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium md:px-4 md:py-2 md:text-sm">
                                  <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                  در حال پردازش...
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 md:mb-4">
                              <h4 className="mb-1 text-sm font-semibold md:text-base">
                                {isEditing && !selectedFile
                                  ? "لوگوی فعلی"
                                  : "لوگو انتخاب شده"}
                              </h4>
                              <p className="text-light-dark text-xs md:text-sm">
                                {isEditing && !selectedFile
                                  ? "برای تغییر، فایل جدید انتخاب کنید"
                                  : "پیش‌نمایش محلی - تغییرات پس از ذخیره اعمال می‌شود"}
                              </p>
                            </div>

                            {/* Progress */}
                            {(uploading || progress > 0) && (
                              <div className="mb-3 md:mb-4">
                                <div className="mb-1 flex items-center justify-between md:mb-2">
                                  <span className="text-xs md:text-sm">
                                    {uploading
                                      ? "در حال بارگذاری..."
                                      : "آپلود کامل شد"}
                                  </span>
                                  <span className="text-xs font-medium md:text-sm">
                                    {progress}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 md:h-2">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3">
                              <button
                                type="button"
                                onClick={() => !pending && openFileDialog()}
                                disabled={pending}
                                className="border-light-dark flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors md:px-4 md:text-sm"
                              >
                                <Upload size={14} />
                                {isEditing ? "تغییر لوگو" : "تغییر تصویر"}
                              </button>

                              <button
                                type="button"
                                onClick={() => !pending && removeLogo()}
                                disabled={pending}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 md:px-4 md:text-sm"
                              >
                                <Trash2 size={14} />
                                حذف
                              </button>

                              {((progress === 100 && !uploading) ||
                                (isEditing && !selectedFile)) && (
                                <div className="flex items-center gap-2 text-xs font-medium text-green-700 md:ml-auto md:text-sm">
                                  <CheckCircle size={16} />
                                  {isEditing && !selectedFile
                                    ? "آماده برای ذخیره"
                                    : "آماده برای ایجاد"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 md:mt-4 md:gap-3 md:px-4 md:py-3 md:text-sm">
                    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 md:h-5 md:w-5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600 md:h-2 md:w-2" />
                    </div>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Style Customization (keeping your existing comprehensive styling section) */}
            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <Palette size={24} className="text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">سفارشی‌سازی ظاهر</h3>
                    <p className="text-light-dark mt-1 text-sm">
                      رنگ و پس‌زمینه لینک خود را تنظیم کنید
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Controls Column */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Background Type Selection */}
                  <div className="bg-primary-40 rounded-2xl p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-light-dark text-lg font-semibold">
                        نوع پس‌زمینه
                      </h4>
                      <button
                        type="button"
                        onClick={copyCss}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50"
                      >
                        <Copy size={16} />
                        کپی CSS
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            backgroundType: "solid",
                          }))
                        }
                        className={`relative cursor-pointer overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                          formData.backgroundType === "solid"
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                        }`}
                        disabled={pending}
                      >
                        <div className="relative z-10">
                          <div className="mb-1 text-lg font-semibold">
                            رنگ ساده
                          </div>
                          <div className="text-sm opacity-80">
                            یک رنگ یکنواخت
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            backgroundType: "gradient",
                          }))
                        }
                        className={`relative cursor-pointer overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                          formData.backgroundType === "gradient"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                            : "bg-white text-gray-700"
                        }`}
                        disabled={pending}
                      >
                        <div className="relative z-10">
                          <div className="mb-1 text-lg font-semibold">
                            گرادیان
                          </div>
                          <div className="text-sm opacity-80">
                            ترکیب چند رنگ
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Solid Color Controls */}
                  {formData.backgroundType === "solid" && (
                    <div className="bg-primary-40 rounded-2xl p-6">
                      <h4 className="text-light-dark mb-4 text-lg font-semibold">
                        تنظیمات رنگ ساده
                      </h4>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="text-light-dark mb-3 block text-sm font-medium">
                            رنگ پس‌زمینه
                          </label>
                          <input
                            type="color"
                            value={formData.solidColor || "#3B82F6"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                solidColor: e.target.value,
                                backgroundCss: e.target.value,
                              }))
                            }
                            className="h-12 w-full cursor-pointer"
                            disabled={pending}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient Controls */}
                  {formData.backgroundType === "gradient" && (
                    <div className="space-y-6">
                      <div className="bg-primary-40 rounded-2xl p-6">
                        <h4 className="text-light-dark mb-4 text-lg font-semibold">
                          قالب‌های آماده
                        </h4>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => applyPreset(preset)}
                              className="relative cursor-pointer overflow-hidden rounded-xl p-4 font-medium text-white shadow-lg"
                              style={{
                                background: `linear-gradient(${preset.angle}deg, ${preset.g1}, ${preset.g2})`,
                              }}
                              disabled={pending}
                            >
                              <div className="relative z-10 text-sm">
                                {preset.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-primary-40 rounded-2xl p-6">
                        <h4 className="text-light-dark mb-6 text-lg font-semibold">
                          تنظیمات گرادیان
                        </h4>

                        <div className="mb-6">
                          <label className="text-light-dark mb-3 block text-sm font-medium">
                            زاویه گرادیان ({formData.gradientAngle}°)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={formData.gradientAngle}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                gradientAngle: Number(e.target.value),
                              }))
                            }
                            className="w-full"
                            disabled={pending}
                          />
                        </div>

                        <div className="mb-6 grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="text-light-dark mb-3 block text-sm font-medium">
                              رنگ اول
                            </label>
                            <input
                              type="color"
                              value={formData.gradientColor1 || "#3B82F6"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gradientColor1: e.target.value,
                                }))
                              }
                              className="h-12 w-full cursor-pointer"
                              disabled={pending}
                            />
                          </div>
                          <div>
                            <label className="text-light-dark mb-3 block text-sm font-medium">
                              رنگ دوم
                            </label>
                            <input
                              type="color"
                              value={formData.gradientColor2 || "#8B5CF6"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gradientColor2: e.target.value,
                                }))
                              }
                              className="h-12 w-full cursor-pointer"
                              disabled={pending}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Column */}
                <div className="space-y-6">
                  <div className="bg-primary-40 rounded-2xl p-6">
                    <h4 className="text-light-dark mb-4 text-lg font-semibold">
                      پیش‌نمایش زنده
                    </h4>
                    <div
                      className="relative flex min-h-32 items-center justify-center overflow-hidden rounded-2xl p-8"
                      style={{
                        background: generateBackgroundStyle(),
                        transition: "all 400ms ease",
                      }}
                    >
                      <div className="relative z-10 text-center">
                        <div
                          className="mb-2 text-xl font-bold"
                          style={{ color: formData.textColor }}
                        >
                          {formData.label || "عنوان لینک"}
                        </div>
                        <div
                          className="text-sm opacity-90"
                          style={{ color: formData.textColor }}
                        >
                          {formData.username || "@username"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-40 rounded-2xl p-6">
                    <h4 className="text-light-dark mb-4 text-lg font-semibold">
                      رنگ متن
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="color"
                        name="textColor"
                        value={formData.textColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            textColor: e.target.value,
                          }))
                        }
                        className="h-12 w-full cursor-pointer rounded-xl"
                        disabled={pending}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              textColor: autoTextColor(),
                            }))
                          }
                          className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800"
                        >
                          خودکار
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              textColor: "#ffffff",
                            }))
                          }
                          className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-black"
                        >
                          سفید
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              textColor: "#000000",
                            }))
                          }
                          className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white"
                        >
                          مشکی
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden inputs for form submission */}
              <input
                type="hidden"
                name="backgroundCss"
                value={formData.backgroundCss}
              />
              <input
                type="hidden"
                name="textColor"
                value={formData.textColor}
              />
            </div>

            {/* Final Preview */}
            <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-3">
                  <Eye size={24} className="text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">پیش‌نمایش نهایی</h3>
                  <p className="text-light-dark mt-1 text-sm">
                    این چگونگی نمایش لینک شما است
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <div
                  className="flex min-h-[120px] flex-row-reverse items-center justify-between gap-6 rounded-3xl p-6"
                  style={{
                    background: generateBackgroundStyle(),
                    color: formData.textColor,
                    transition: "all 400ms ease",
                  }}
                >
                  <div className="image-icon h-16 w-16 flex-shrink-0">
                    {previewUrl && previewUrl !== "default.png" ? (
                      <Image
                        src={previewUrl}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="h-full w-full rounded-lg object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/20">
                        <ImageIcon size={24} className="text-white/60" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-right">
                    <span
                      className="text-lg leading-tight font-semibold"
                      style={{ color: formData.textColor }}
                    >
                      {formData.label || "عنوان لینک"}
                    </span>
                    <span
                      className="font-normal"
                      style={{ color: formData.textColor }}
                    >
                      {formData.username || "@username"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pending || isSubmitting}
                  aria-busy={isPending || isSubmitting ? true : undefined}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {/* Icon: spinner while isPending, save icon when not isPending */}
                  {pending || isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}

                  {/* Text */}
                  <span>
                    {isEditing
                      ? pending || isSubmitting
                        ? "در حال ذخیره..."
                        : "ذخیره تغییرات"
                      : pending || isSubmitting
                        ? "در حال ایجاد..."
                        : "ایجاد لینک"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

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
              <div className="text-sm">{notification.message}</div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-black hover:opacity-70"
              aria-label="close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type LinksGridProps = {
  groups: Link[][];
  onDelete: (link: Link) => void; // <-- expect the full Link
  onEdit: (link: Link) => void;
  isDeleting?: boolean;
};

function LinksGrid({
  groups,
  onDelete,
  onEdit,
  isDeleting = false,
}: LinksGridProps) {
  const flatLinks = groups.flat();
  const [items, setItems] = useState(flatLinks);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Update UI immediately
      setItems(newOrder);

      // Update positions in database
      startTransition(async () => {
        const updates = newOrder.map((link, index) => ({
          id: link.id,
          position: index,
        }));
        await reorderLinks(updates);
      });
    }
  };

  return (
    <DndContext
      id="links-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((link) => link.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {items.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onDelete={onDelete}
              onEdit={onEdit}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableLinkItemProps {
  link: Link;
  onDelete: (link: Link) => void;
  onEdit: (link: Link) => void;
  isDeleting: boolean;
}

// New component for sortable items
function SortableLinkItem({
  link,
  onDelete,
  onEdit,
  isDeleting,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const inlineStyle: React.CSSProperties = { ...style };
  if (link?.backgroundCss) inlineStyle.background = link.backgroundCss;

  const textStyle: React.CSSProperties = {};
  if (link?.textColor) textStyle.color = link.textColor;

  const rawLogo = link?.logoUrl || "default.png";
  const logoPath = rawLogo.startsWith("/") ? rawLogo : `/logo/Links/${rawLogo}`;

  return (
    <div
      ref={setNodeRef}
      style={inlineStyle}
      className={`group relative flex min-h-[120px] w-full flex-col justify-between gap-6 rounded-3xl p-4 transition-opacity duration-200 sm:p-6 lg:flex-row lg:items-center lg:p-8 lg:py-10 ${isDeleting ? "opacity-75" : ""} cursor-move`}
      {...attributes}
      {...listeners}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 lg:top-4 lg:left-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(link);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500/80 text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500/80 text-white transition-all duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>

      <div className="image-icon h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
        <Image
          src={logoPath}
          alt={link.label || "Link Icon"}
          width={96}
          height={96}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-2 text-right">
        <span
          className="truncate text-lg leading-tight font-semibold text-white sm:text-2xl"
          style={textStyle}
        >
          {link.label || "Untitled Link"}
        </span>
        <span className="font-normal text-white sm:text-xl" style={textStyle}>
          {link.username || "No Username"}
        </span>
      </div>
    </div>
  );
}

function LinksGridSkeleton({ groups }: { groups: Link[][] }) {
  return (
    <>
      {groups.map((group, gIdx) => (
        <div
          key={gIdx}
          className="mb-4 grid gap-4 md:mb-6 md:gap-6 lg:grid-cols-2"
        >
          {group.map((_, i) => (
            <div
              key={i}
              className="Link-Item relative flex min-h-[120px] w-full flex-col justify-between gap-6 rounded-3xl bg-gray-200 p-4 sm:p-6 lg:flex-row lg:items-center lg:p-8 lg:py-10 dark:bg-gray-700"
              aria-hidden
            >
              <div className="image-icon h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
                <div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
              </div>
              <div className="flex flex-1 flex-col items-end justify-end gap-2 text-right">
                <div className="h-5 w-1/2 animate-pulse rounded-md bg-gray-300" />
                <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
