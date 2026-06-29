"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FolderOpen,
  ImageIcon,
  Images,
  Loader2,
  X,
} from "lucide-react";

import type { ImageAsset } from "../types";

type ImageGridProps = {
  title: string;
  description: string;
  images: ImageAsset[];
  emptyText: string;
};

function sanitizeFileName(name: string) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .trim();
}

function getFileExtension(url: string, fallback = "jpg") {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop();

    if (!ext || ext.length > 5) return fallback;

    return ext;
  } catch {
    return fallback;
  }
}

function removeFileExtension(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

export function ImageGrid({
  title,
  description,
  images,
  emptyText,
}: ImageGridProps) {
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const downloadableImages = useMemo(
    () => images.filter((image) => Boolean(image.url)),
    [images],
  );

  const thumbnailImages = useMemo(() => images.slice(0, 2), [images]);
  const remainingCount = Math.max(images.length - thumbnailImages.length, 0);

  const handleDownloadAll = async () => {
    if (downloadableImages.length === 0 || isDownloading) return;

    try {
      setIsDownloading(true);

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      await Promise.all(
        downloadableImages.map(async (image, index) => {
          if (!image.url) return;

          const response = await fetch(image.url);

          if (!response.ok) {
            throw new Error(`Cannot download image: ${image.name}`);
          }

          const blob = await response.blob();

          const ext = getFileExtension(image.url);
          const baseName = removeFileExtension(
            image.name || `image_${index + 1}`,
          );
          const safeName = sanitizeFileName(baseName);

          zip.file(`${index + 1}_${safeName}.${ext}`, blob);
        }),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `${sanitizeFileName(title || "images")}.zip`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert(
        "Không thể tải toàn bộ ảnh. Vui lòng kiểm tra lại URL ảnh hoặc CORS.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border-base bg-bg-panel p-3 dark:border-border-base dark:bg-bg-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-slate-100">
              <FolderOpen className="h-4 w-4" />
              {title}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs text-steel dark:text-slate-400">
              {description}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Images className="h-3.5 w-3.5" />
                {images.length}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {downloadableImages.length > 0 ? (
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 rounded-lg border border-border-base bg-bg-base px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-base dark:bg-bg-base dark:text-slate-200 dark:hover:bg-bg-hover"
                title="Tải toàn bộ ảnh"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setIsFolderOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-hover"
            >
              {isFolderOpen ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="mt-3 flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-white/5 dark:text-slate-400">
            {emptyText}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-[repeat(2,minmax(0,120px))] gap-2">
            {thumbnailImages.map((image, index) => {
              const showMoreOverlay =
                index === thumbnailImages.length - 1 && remainingCount > 0;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    if (image.url) {
                      setPreviewImage(image);
                    } else {
                      setIsFolderOpen(true);
                    }
                  }}
                  className="group relative h-20 overflow-hidden rounded-lg border border-border-base dark:border-border-base dark:bg-bg-panel"
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  )}

                  {showMoreOverlay ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                      +{remainingCount}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {isFolderOpen && images.length > 0 ? (
          <div className="mt-3 rounded-xl border border-border-base dark:border-border-base">
            <div className="max-h-72 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-border-base dark:border-border-base"
                  >
                    {image.url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(image)}
                        className="block w-full cursor-zoom-in"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="h-20 w-full object-cover transition hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="flex h-20 items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}

                    <p className="truncate px-2 py-1.5 text-xs text-steel dark:text-slate-300">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {previewImage?.url ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {previewImage.name}
              </p>

              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex max-h-[80vh] items-center justify-center bg-slate-950 p-4">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
