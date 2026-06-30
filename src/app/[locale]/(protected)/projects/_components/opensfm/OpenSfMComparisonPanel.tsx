"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRunOpenSfMComparisonMutation } from "@/services/video/video.service";
import type {
  OpenSfMFlowResultDto,
  RunOpenSfMComparisonResponse,
  StorageUploadDto,
} from "@/types/dtos/video/opensfm.dto";

type Props = {
  videoId: string;
  pipelineRunId?: string;
  totalRawImages: number;
  totalProcessedImages: number;
  totalMasks: number;
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatError(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return value.toFixed(4);
}

function getUploadId(file: StorageUploadDto | null | undefined) {
  if (!file) return null;

  return file.id ?? file.storageFileId ?? null;
}

function getDownloadUrl(file: StorageUploadDto | null | undefined) {
  if (!file) return null;

  if (file.url) return file.url;

  const id = getUploadId(file);

  if (!id) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  return `${baseUrl}/storage/files/${encodeURIComponent(id)}/download`;
}

function FlowCard({
  title,
  description,
  flow,
}: {
  title: string;
  description: string;
  flow: OpenSfMFlowResultDto;
}) {
  const plyUrl = getDownloadUrl(flow.ply);
  const reportUrl = getDownloadUrl(flow.report);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {flow.imageCount} ảnh
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricBox
          label="Ảnh tái dựng"
          value={formatNumber(flow.metrics.reconstructedImages)}
        />

        <MetricBox
          label="Sparse points"
          value={formatNumber(flow.metrics.sparsePointCount)}
        />

        <MetricBox
          label="Dense points"
          value={formatNumber(flow.metrics.densePointCount)}
        />

        <MetricBox
          label="Reprojection error"
          value={formatError(flow.metrics.avgReprojectionError)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {plyUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={plyUrl} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Tải PLY
            </a>
          </Button>
        ) : null}

        {reportUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={reportUrl} target="_blank" rel="noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Tải report
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function ComparisonTable({ result }: { result: RunOpenSfMComparisonResponse }) {
  const rows = [
    {
      label: "Ảnh tái dựng",
      raw: formatNumber(result.rawFlow.metrics.reconstructedImages),
      processed: formatNumber(result.processedFlow.metrics.reconstructedImages),
      change: formatNumber(result.comparison.reconstructedImageGain),
    },
    {
      label: "Sparse points",
      raw: formatNumber(result.rawFlow.metrics.sparsePointCount),
      processed: formatNumber(result.processedFlow.metrics.sparsePointCount),
      change: formatPercent(result.comparison.sparsePointGainPercent),
    },
    {
      label: "Dense points",
      raw: formatNumber(result.rawFlow.metrics.densePointCount),
      processed: formatNumber(result.processedFlow.metrics.densePointCount),
      change: formatPercent(result.comparison.densePointGainPercent),
    },
    {
      label: "Reprojection error",
      raw: formatError(result.rawFlow.metrics.avgReprojectionError),
      processed: formatError(result.processedFlow.metrics.avgReprojectionError),
      change: formatPercent(
        result.comparison.reprojectionErrorImprovementPercent,
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-700">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <BarChart3 className="h-4 w-4" />
          Bảng so sánh chất lượng đầu ra
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tiêu chí</th>
              <th className="px-4 py-3">Raw flow</th>
              <th className="px-4 py-3">Processed flow</th>
              <th className="px-4 py-3">Chênh lệch</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {row.raw}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {row.processed}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                  {row.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OpenSfMComparisonPanel({
  videoId,
  pipelineRunId,
  totalRawImages,
  totalProcessedImages,
  totalMasks,
}: Props) {
  const [runOpenSfMComparison, { data, isLoading, error }] =
    useRunOpenSfMComparisonMutation();

  const canRun =
    Boolean(videoId) &&
    totalRawImages > 0 &&
    totalProcessedImages > 0 &&
    totalProcessedImages === totalMasks;

  const handleRun = async () => {
    await runOpenSfMComparison({
      videoId,
      body: {
        pipelineRunId,
        runDense: true,
      },
    }).unwrap();
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Activity className="h-5 w-5" />
            So sánh OpenSfM
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Chạy raw image + mask rỗng và processed image + mask thật để so sánh
            file PLY đầu ra.
          </p>
        </div>

        <Button onClick={handleRun} disabled={!canRun || isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Chạy so sánh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricBox label="Raw images" value={formatNumber(totalRawImages)} />
        <MetricBox
          label="Processed images"
          value={formatNumber(totalProcessedImages)}
        />
        <MetricBox label="Masks" value={formatNumber(totalMasks)} />
      </div>

      {!canRun ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Cần đảm bảo đã có raw images, processed images và số lượng processed
            images bằng số lượng masks trước khi chạy OpenSfM.
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Chạy OpenSfM thất bại. Kiểm tra log của gateway-service, video-service
          và opensfm-service.
        </div>
      ) : null}

      {data ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Hoàn tất so sánh OpenSfM
            </div>

            <div className="mt-1">
              Kết luận:{" "}
              {data.comparison.conclusion === "processed_flow_better"
                ? "Luồng processed cho kết quả tốt hơn hoặc ổn định hơn."
                : "Cần xem lại thủ công qua PLY và report."}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FlowCard
              title="Raw flow"
              description="Raw images + mask trắng rỗng cho OpenSfM"
              flow={data.rawFlow}
            />

            <FlowCard
              title="Processed flow"
              description="Processed images + mask vật thể động đã chuyển sang mask OpenSfM"
              flow={data.processedFlow}
            />
          </div>

          <ComparisonTable result={data} />
        </div>
      ) : null}
    </div>
  );
}
