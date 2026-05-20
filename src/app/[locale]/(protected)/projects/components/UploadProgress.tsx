interface UploadProgressProps {
  progress: number; // 0–100
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const stage =
    progress < 30
      ? "Chuẩn bị..."
      : progress < 80
        ? "Đang tải lên..."
        : progress < 100
          ? "Đang xử lý..."
          : "Hoàn tất!";

  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex justify-between text-sm">
        {/* <span className="text-slate-500 dark:text-slate-400">{stage}</span> */}
        <span className="font-medium dark:text-slate-100">{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
