"use client";

import { useState } from "react";
import { Download, ImageIcon, Loader2, X } from "lucide-react";

import type { ImageAsset } from "./types";

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

export function ImageGrid({
  title,
  description,
  images,
  emptyText,
}: ImageGridProps) {
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadableImages = images.filter((image) => Boolean(image.url));

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
          const safeName = sanitizeFileName(image.name || `image_${index + 1}`);

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
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-slate-100">
              <ImageIcon className="h-4 w-4" />
              {title}
            </h3>

            <p className="mt-1 text-xs text-steel dark:text-slate-400">
              {description}
            </p>
          </div>

          {downloadableImages.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              {isDownloading ? "Downloading..." : "Download all"}
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-white/5 dark:text-slate-400">
            {emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
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
                      className="h-24 w-full object-cover transition hover:scale-105"
                    />
                  </button>
                ) : (
                  <div className="flex h-24 items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                )}

                <p className="truncate px-2 py-1.5 text-xs text-steel dark:text-slate-300">
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewImage?.url && (
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
      )}
    </>
  );
}
