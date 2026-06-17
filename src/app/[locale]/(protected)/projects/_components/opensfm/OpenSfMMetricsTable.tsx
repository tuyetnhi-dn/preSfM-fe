type Props = {
  raw?: any;
  processed?: any;
  comparison?: any;
};

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return value.toLocaleString("vi-VN");
}

function formatMetric(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return Number(value).toFixed(4);
}

function renderDiff(value?: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}

export function OpenSfMMetricsTable({ raw, processed, comparison }: Props) {
  const rows = [
    {
      label: "Ảnh tái dựng",
      raw: raw?.reconstructedImages,
      processed: processed?.reconstructedImages,
      diff: comparison?.reconstructedImageGain,
      type: "count",
    },
    {
      label: "Sparse points",
      raw: raw?.sparsePointCount,
      processed: processed?.sparsePointCount,
      diff: comparison?.sparsePointGainPercent,
      type: "percent",
    },
    {
      label: "Dense points",
      raw: raw?.densePointCount,
      processed: processed?.densePointCount,
      diff: comparison?.densePointGainPercent,
      type: "percent",
    },
    {
      label: "Reprojection error",
      raw: raw?.avgReprojectionError,
      processed: processed?.avgReprojectionError,
      diff: comparison?.reprojectionErrorImprovementPercent,
      type: "metric",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Tiêu chí</th>
            <th className="px-4 py-3 text-left">Raw Flow</th>
            <th className="px-4 py-3 text-left">Processed Flow</th>
            <th className="px-4 py-3 text-left">Chênh lệch</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <td className="px-4 py-3 font-medium">{row.label}</td>

              <td className="px-4 py-3">
                {row.type === "metric"
                  ? formatMetric(row.raw)
                  : formatNumber(row.raw)}
              </td>

              <td className="px-4 py-3">
                {row.type === "metric"
                  ? formatMetric(row.processed)
                  : formatNumber(row.processed)}
              </td>

              <td className="px-4 py-3 font-medium">
                {row.type === "count" ? row.diff : renderDiff(row.diff)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
