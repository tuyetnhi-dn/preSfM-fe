import { OpenSfMMetricsTable } from "./OpenSfMMetricsTable";

type Props = {
  result: any;
};

export function OpenSfMResultView({ result }: Props) {
  const raw = result?.raw;
  const processed = result?.processed;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
        Kết quả so sánh OpenSfM
      </h3>

      <p className="mt-1 text-xs text-steel dark:text-slate-400">
        So sánh kết quả tái dựng giữa luồng ảnh gốc và luồng ảnh đã tiền xử lý.
      </p>

      <div className="mt-4">
        <OpenSfMMetricsTable raw={raw} processed={processed} />
      </div>

      {result?.raw?.plyUrl || result?.processed?.plyUrl ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {result?.raw?.plyUrl ? (
            <a
              href={result.raw.plyUrl}
              target="_blank"
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Xem PLY Raw
            </a>
          ) : null}

          {result?.processed?.plyUrl ? (
            <a
              href={result.processed.plyUrl}
              target="_blank"
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Xem PLY Processed
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
