type Props = {
  rawCount: number;
  processedCount: number;
  maskCount: number;
  canRunOpenSfM: boolean;
  isRunning: boolean;
  onRun: () => void;
  onClearLocalProject: () => void;
};

export function OpenSfMActionCard({
  rawCount,
  processedCount,
  maskCount,
  canRunOpenSfM,
  isRunning,
  onRun,
  onClearLocalProject,
}: Props) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
            So sánh OpenSfM
          </h3>

          <p className="mt-1 text-xs text-steel dark:text-slate-400">
            Raw flow dùng raw images + mask rỗng. Processed flow dùng processed
            images + mask thật tương ứng.
          </p>

          <p className="mt-2 text-xs text-steel dark:text-slate-400">
            Raw: {rawCount} | Processed: {processedCount} | Masks: {maskCount}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* <button
            type="button"
            onClick={onClearLocalProject}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Làm mới project
          </button> */}

          <button
            type="button"
            onClick={onRun}
            disabled={!canRunOpenSfM || isRunning}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Đang chạy OpenSfM..." : "Chạy so sánh OpenSfM"}
          </button>
        </div>
      </div>

      {!canRunOpenSfM ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Cần có raw images, processed images và số lượng processed images phải
          bằng số lượng masks.
        </div>
      ) : null}
    </div>
  );
}
