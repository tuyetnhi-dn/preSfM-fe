import { PointCloudViewer } from "@/components/viewer/point-cloud-viewer";
import { OpenSfMMetricsTable } from "./OpenSfMMetricsTable";

type Props = {
  result: any;
};

function buildStorageDownloadUrl(fileId?: string | null) {
  if (!fileId) return "";

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  return `${baseUrl}/storage/files/${fileId}/download`;
}

export function OpenSfMResultView({ result }: Props) {
  const rawPlyUrl = buildStorageDownloadUrl(result?.rawFlow?.ply?.id);
  const processedPlyUrl = buildStorageDownloadUrl(
    result?.processedFlow?.ply?.id,
  );
  const rawMetrics = result?.rawFlow?.metrics;
  const processedMetrics = result?.processedFlow?.metrics;
  const comparisonMetrics = result?.comparison;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
        Kết quả so sánh OpenSfM
      </h3>

      <p className="mt-1 text-xs text-steel dark:text-slate-400">
        So sánh kết quả tái dựng giữa luồng ảnh gốc và luồng ảnh đã tiền xử lý.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {rawPlyUrl ? (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-ink dark:text-slate-100">
                Raw Flow Point Cloud
              </h4>

              <a
                href={rawPlyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Tải PLY
              </a>
            </div>

            <PointCloudViewer plyUrl={rawPlyUrl} />
          </div>
        ) : null}

        {processedPlyUrl ? (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-ink dark:text-slate-100">
                Processed Flow Point Cloud
              </h4>

              <a
                href={processedPlyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Tải PLY
              </a>
            </div>

            <PointCloudViewer plyUrl={processedPlyUrl} />
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <OpenSfMMetricsTable
          raw={rawMetrics}
          processed={processedMetrics}
          comparison={comparisonMetrics}
        />
      </div>
    </div>
  );
}
