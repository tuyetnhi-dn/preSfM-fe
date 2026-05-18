"use client";
import { X, Video } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoPreviewProps {
  file: File;
  onRemove: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function VideoPreview({ file, onRemove }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (videoRef.current) videoRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="aspect-video w-full bg-black">
        <video
          ref={videoRef}
          controls
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-center gap-3 px-4 py-3 dark:bg-white/5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-white/10">
          <Video className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium dark:text-slate-100">
            {file.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatSize(file.size)}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="rounded-md p-1.5 text-slate-400 transition"
          aria-label="Xóa file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
