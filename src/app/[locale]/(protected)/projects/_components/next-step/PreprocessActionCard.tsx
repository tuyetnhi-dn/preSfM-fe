type Props = {
  isLoading: boolean;
  disabled: boolean;
  onRun: () => void;
};

export function PreprocessActionCard({ isLoading, disabled, onRun }: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
          Bước tiếp theo
        </h3>

        <p className="mt-1 text-xs text-steel dark:text-slate-400">
          Sau khi đã cắt frame, hãy xử lý ảnh và tạo mask trước khi đưa vào
          OpenSfM.
        </p>
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={disabled}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Đang xử lý ảnh và tạo mask..." : "Xử lý ảnh + tạo mask"}
      </button>
    </div>
  );
}
