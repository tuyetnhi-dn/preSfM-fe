import { formatMetric, formatNumber } from "../../_utils/project-format";

type MetricItem = {
  label: string;
  raw?: number | null;
  processed?: number | null;
  suffix?: string;
};

type Props = {
  raw?: any;
  processed?: any;
};

export function OpenSfMMetricsTable({ raw, processed }: Props) {
  const metrics: MetricItem[] = [
    {
      label: "Ảnh tái dựng",
      raw: raw?.reconstructedImages,
      processed: processed?.reconstructedImages,
    },
    {
      label: "Sparse points",
      raw: raw?.sparsePoints,
      processed: processed?.sparsePoints,
    },
    {
      label: "Dense points",
      raw: raw?.densePoints,
      processed: processed?.densePoints,
    },
    {
      label: "Reprojection error",
      raw: raw?.reprojectionError,
      processed: processed?.reprojectionError,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Tiêu chí</th>
            <th className="px-4 py-3 text-left">Raw flow</th>
            <th className="px-4 py-3 text-left">Processed flow</th>
          </tr>
        </thead>

        <tbody>
          {metrics.map((item) => (
            <tr
              key={item.label}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <td className="px-4 py-3 font-medium">{item.label}</td>
              <td className="px-4 py-3">
                {item.label === "Reprojection error"
                  ? formatMetric(item.raw)
                  : formatNumber(item.raw)}
              </td>
              <td className="px-4 py-3">
                {item.label === "Reprojection error"
                  ? formatMetric(item.processed)
                  : formatNumber(item.processed)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
