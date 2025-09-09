"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Save,
  Edit3,
  Eye,
  BarChart3,
  Info,
  FileText,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Upload,
} from "lucide-react";
import imageCompression from "browser-image-compression";

type AboutData = {
  id: number;
  BannerUrl: string | null;
  description: string | null;
  overviewLabel: string;
  overviewContent: number | null;
  statisticsLabel: string;
  statisticsContent: number | null;
  siteInfoLabel: string;
  siteInfoContent: number | null;
};

export default function AboutContainer({ data }: { data: AboutData | null }) {
  const [aboutData, setAboutData] = useState<AboutData>({
    id: data?.id ?? 1,
    BannerUrl: data?.BannerUrl ?? null,
    description: data?.description ?? null,
    overviewLabel: data?.overviewLabel ?? "میم‌های شیعه",
    overviewContent: data?.overviewContent ?? 1928,
    statisticsLabel: data?.statisticsLabel ?? "میم‌های ایجاد شده",
    statisticsContent: data?.statisticsContent ?? 1728,
    siteInfoLabel: data?.siteInfoLabel ?? "کاربران فعال",
    siteInfoContent: data?.siteInfoContent ?? 716,
  });

  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [isEditing, setIsEditing] = useState(false);

  // Image upload state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const maxSizeMB = 2;

  useEffect(() => {
    if (!aboutData.BannerUrl) {
      setProgress(0);
      setUploading(false);
      setError(null);
    }
  }, [aboutData.BannerUrl]);

  const isDataUrl = (url: string | null) => !!url && url.startsWith("data:");

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

  // Handle actual selection / drop
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

      // show local preview quickly
      const reader = new FileReader();
      reader.onloadend = () => {
        setAboutData((prev) => ({
          ...prev,
          BannerUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(compressedFile);

      // fake progress until uploaded (replace with real upload logic)
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

      // If you have a real upload endpoint, call it here and update progress from XHR/fetch.
    } catch (err) {
      console.error(err);
      setError("خطا در پردازش تصویر. لطفا دوباره تلاش کنید.");
      setUploading(false);
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

  const removeBanner = () => {
    setAboutData((p) => ({ ...p, BannerUrl: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = () => {
    console.log("Saving (component-only):", aboutData);
    setIsEditing(false);
    setActiveTab("preview");
  };

  return (
    <>
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
          <Eye size={16} /> پیش‌نمایش
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-all ${
            activeTab === "edit"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Edit3 size={16} /> ویرایش
        </button>
      </div>

      {/* PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="relative">
              {aboutData.BannerUrl ? (
                isDataUrl(aboutData.BannerUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={aboutData.BannerUrl}
                    alt="بنر"
                    className="h-64 w-full object-cover sm:h-80"
                  />
                ) : (
                  <Image
                    src={`/banner/${aboutData.BannerUrl}`}
                    alt="بنر"
                    width={1200}
                    height={400}
                    quality={90}
                    unoptimized
                    priority
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                    className="h-64 sm:h-80"
                  />
                )
              ) : (
                <div className="flex h-64 items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white sm:h-80">
                  <div className="text-center">
                    <ImageIcon size={40} />
                    <h2 className="mt-2 text-2xl font-semibold">
                      بنری موجود نیست
                    </h2>
                    <p className="mt-1 text-sm opacity-90">
                      لطفا بنری بارگذاری کنید تا در اینجا نمایش داده شود.
                    </p>
                  </div>
                </div>
              )}

              {/* overlay controls */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("edit")}
                  className="flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-sm shadow"
                >
                  <Edit3 size={16} /> ویرایش بنر
                </button>
                {aboutData.BannerUrl && (
                  <button
                    onClick={removeBanner}
                    title="حذف بنر"
                    className="rounded-md bg-white/90 p-2 shadow"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="description mb-6">
            <h1 className="text-3xl font-extrabold sm:text-4xl">درباره ما</h1>
            <p className="mt-4 text-base leading-relaxed font-normal sm:text-lg">
              {aboutData?.description ??
                "میم‌های شیعه یک پلتفرم آنلاین است که به ارائه میم‌های مذهبی و طنز شیعی می‌پردازد. هدف ما ایجاد فضایی سرگرم‌کننده و آموزنده برای کاربران است تا از طریق میم‌ها با مفاهیم دینی آشنا شوند و لحظاتی شاد را تجربه کنند."}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Overview */}
            <div className="bg-bg-1 flex-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  {aboutData.overviewLabel}
                </h3>
              </div>
              <div className="mt-4 text-gray-700">
                <div className="text-3xl font-extrabold text-indigo-600">
                  {aboutData.overviewContent ?? 0}
                </div>
                <p className="text-light-dark mt-3 text-sm">
                  مقدار خام بخش نمای کلی
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-bg-1 flex-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2">
                  <BarChart3 size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  {aboutData.statisticsLabel}
                </h3>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-indigo-600">
                {aboutData.statisticsContent ?? 0}
              </div>
              <p className="text-light-dark mt-3 text-sm">مقدار خام بخش آمار</p>
            </div>

            {/* Site Info */}
            <div className="bg-bg-1 flex-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <Info size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  {aboutData.siteInfoLabel}
                </h3>
              </div>
              <div className="mt-4 text-3xl text-indigo-600">
                <div className="font-extrabold">
                  {aboutData.siteInfoContent ?? 0}
                </div>
                <p className="text-light-dark mt-2 text-sm">
                  اعداد متناظر با داده‌ی ورودی شما
                </p>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT */}
      {activeTab === "edit" && (
        <div className="space-y-8">
          <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <ImageIcon size={24} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold">بنر و توضیحات</h3>
                <p className="text-light-dark mt-1 text-sm">
                  بنر و توضیحات صفحه درباره ما را مدیریت کنید
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-light-dark mb-3 block text-base font-semibold">
                تصویر بنر
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
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openFileDialog}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    aria-label="بارگذاری بنر"
                    className={`group relative h-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 select-none ${
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
                              : "تصویر بنر را انتخاب کنید"}
                          </h4>
                          <p className="text-light-dark text-xs md:text-sm">
                            فایل را بکشید و رها کنید یا برای انتخاب کلیک کنید
                          </p>
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] md:mt-3 md:text-xs">
                            <span className="bg-primary-40 rounded-full border px-2 py-1">
                              حداکثر {maxSizeMB}MB
                            </span>
                            <span className="bg-primary-40 rounded-full border px-2 py-1">
                              1200×400 پیشنهادی
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
                {aboutData.BannerUrl && (
                  <div className="bg-primary-40 w-full rounded-xl p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-4 md:gap-6">
                      <div className="relative overflow-hidden rounded-lg shadow-md">
                        {isDataUrl(aboutData.BannerUrl) ? (
                          <img
                            src={aboutData.BannerUrl}
                            alt="preview"
                            className="max-h-60 w-full object-contain md:max-h-80"
                          />
                        ) : (
                          <Image
                            src={`/banner/${aboutData.BannerUrl}`}
                            alt="preview"
                            width={400}
                            height={200}
                            unoptimized
                            className="max-h-60 w-full object-cover md:max-h-80"
                          />
                        )}
                        {uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="bg-bg-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium md:px-4 md:py-2 md:text-sm">
                              <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                              در حال پردازش...
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 md:mb-4">
                          <h4 className="mb-1 text-sm font-semibold md:text-base">
                            بنر انتخاب شده
                          </h4>
                          <p className="text-light-dark text-xs md:text-sm">
                            پیش‌نمایش محلی - تغییرات پس از ذخیره اعمال می‌شود
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
                            onClick={openFileDialog}
                            className="border-light-dark flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors md:px-4 md:text-sm"
                          >
                            <Upload size={14} />
                            تغییر تصویر
                          </button>
                          <button
                            onClick={removeBanner}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 md:px-4 md:text-sm"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>

                          {progress === 100 && !uploading && (
                            <div className="flex items-center gap-2 text-xs font-medium text-green-700 md:ml-auto md:text-sm">
                              <CheckCircle size={16} />
                              آماده برای ذخیره
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-bg-1 rounded-lg p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <FileText size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">متن توضیحات</h3>
            </div>
            <textarea
              rows={8}
              value={aboutData.description ?? ""}
              onChange={(e) =>
                setAboutData((p) => ({
                  ...p,
                  description: e.target.value || null,
                }))
              }
              placeholder="توضیحات مربوط به صفحه درباره ما را وارد کنید..."
              className="border-light-dark w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Overview */}
            <div className="bg-bg-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2">
                  <FileText size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">نمای کلی</h3>
              </div>

              <div className="mt-4">
                <label className="text-light-dark mb-2 block text-base font-medium">
                  عنوان
                </label>
                <input
                  value={aboutData.overviewLabel}
                  onChange={(e) =>
                    setAboutData((p) => ({
                      ...p,
                      overviewLabel: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border px-3 py-2"
                />

                <label className="text-light-dark mt-3 mb-2 block text-base font-medium">
                  محتوا (نوع وارد شده حفظ می‌شود)
                </label>
                <input
                  value={aboutData.overviewContent ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAboutData((p) => ({
                      ...p,
                      overviewContent: v === "" ? null : Number(v),
                    }));
                  }}
                  type="number"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-bg-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">آمار</h3>
              </div>

              <div className="mt-4">
                <label className="text-light-dark mb-2 block text-base font-medium">
                  عنوان
                </label>
                <input
                  value={aboutData.statisticsLabel}
                  onChange={(e) =>
                    setAboutData((p) => ({
                      ...p,
                      statisticsLabel: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
                <label className="text-light-dark mt-3 mb-2 block text-base font-medium">
                  محتوا (شما عدد وارد کردید)
                </label>
                <input
                  value={aboutData.statisticsContent ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAboutData((p) => ({
                      ...p,
                      statisticsContent: v === "" ? null : Number(v),
                    }));
                  }}
                  type="number"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            {/* Site Info */}
            <div className="bg-bg-1 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <Info size={20} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">اطلاعات سایت</h3>
              </div>

              <div className="mt-4">
                <label className="text-light-dark mb-2 block text-base font-medium">
                  عنوان
                </label>
                <input
                  value={aboutData.siteInfoLabel}
                  onChange={(e) =>
                    setAboutData((p) => ({
                      ...p,
                      siteInfoLabel: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
                <label className="text-light-dark mt-3 mb-2 block text-base font-medium">
                  محتوا (شما عدد وارد کردید)
                </label>
                <input
                  value={aboutData.siteInfoContent ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAboutData((p) => ({
                      ...p,
                      siteInfoContent: v === "" ? null : Number(v),
                    }));
                  }}
                  type="number"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="submit-button flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white"
            >
              <Save size={16} /> ذخیره
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setActiveTab("preview");
              }}
              className="rounded-md border px-4 py-2"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* hide number input spinners */}
      <style jsx global>{`
        /* Chrome, Edge, Safari */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
}
