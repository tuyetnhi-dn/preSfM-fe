"use client";

import { X, Video } from "lucide-react";
import { useEffect, useState } from "react";

type VideoPreviewProps = {
  file?: File | null;
  src?: string | null;

  title?: string | null;
  sizeBytes?: number | null;

  onRemove?: () => void;
  removeLabel?: string;
  emptyText?: string;
};

function formatSize(bytes?: number | null) {
  if (!bytes) return "";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoPreview({
  file,
  src,
  title,
  sizeBytes,
  onRemove,
  removeLabel = "Xóa file",
  emptyText = "Không có video",
}: VideoPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const videoSrc = objectUrl ?? src ?? "";
  const displayName = file?.name ?? title ?? "Video";
  const displaySize = formatSize(file?.size ?? sizeBytes);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)]">
      <div className="aspect-video w-full bg-black">
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            controls
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
            {emptyText}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-hover)] text-[var(--text-muted)]">
          <Video className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-base)]">
            {displayName}
          </p>

          {displaySize ? (
            <p className="text-xs text-[var(--text-muted)]">{displaySize}</p>
          ) : null}
        </div>

        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-base)]"
            aria-label={removeLabel}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
