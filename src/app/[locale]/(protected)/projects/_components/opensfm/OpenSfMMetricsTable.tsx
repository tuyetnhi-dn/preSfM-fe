"use client";

import { useLocale, useTranslations } from "next-intl";

type SfMMetrics = {
  reconstructedImages?: number | null;
  sparsePointCount?: number | null;
  densePointCount?: number | null;
  avgReprojectionError?: number | null;
};

type SfMComparison = {
  reconstructedImageGain?: number | null;
  sparsePointGainPercent?: number | null;
  densePointGainPercent?: number | null;
  reprojectionErrorImprovementPercent?: number | null;
};

type Props = {
  raw?: SfMMetrics | null;
  processed?: SfMMetrics | null;
  comparison?: SfMComparison | null;
};

type RowType = "count" | "metric";

function formatNumber(value: number | null | undefined, locale: string) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat(locale).format(value);
}

function formatMetric(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return Number(value).toFixed(4);
}

function formatDiff(
  value: number | null | undefined,
  locale: string,
  options?: {
    isPercent?: boolean;
  },
) {
  if (value === null || value === undefined) return "-";

  const sign = value > 0 ? "+" : "";

  if (options?.isPercent) {
    return `${sign}${value.toFixed(2)}%`;
  }

  return `${sign}${new Intl.NumberFormat(locale).format(value)}`;
}

function getDiffClassName(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "border-[var(--border-base)] text-[var(--text-muted)]";
  }

  if (value > 0) {
    return "border-[color-mix(in_srgb,var(--brand)_35%,transparent)] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] text-[var(--brand)]";
  }

  if (value < 0) {
    return "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
  }

  return "border-[var(--border-base)] bg-[var(--bg-hover)] text-[var(--text-muted)]";
}

export function OpenSfMMetricsTable({ raw, processed, comparison }: Props) {
  const t = useTranslations("projectDetail.opensfmMetrics");
  const locale = useLocale();

  const rows: Array<{
    key: string;
    label: string;
    raw?: number | null;
    processed?: number | null;
    diff?: number | null;
    type: RowType;
    diffIsPercent?: boolean;
  }> = [
    {
      key: "reconstructedImages",
      label: t("reconstructedImages"),
      raw: raw?.reconstructedImages,
      processed: processed?.reconstructedImages,
      diff: comparison?.reconstructedImageGain,
      type: "count",
      diffIsPercent: false,
    },
    {
      key: "sparsePoints",
      label: t("sparsePoints"),
      raw: raw?.sparsePointCount,
      processed: processed?.sparsePointCount,
      diff: comparison?.sparsePointGainPercent,
      type: "count",
      diffIsPercent: true,
    },
    {
      key: "densePoints",
      label: t("densePoints"),
      raw: raw?.densePointCount,
      processed: processed?.densePointCount,
      diff: comparison?.densePointGainPercent,
      type: "count",
      diffIsPercent: true,
    },
    {
      key: "reprojectionError",
      label: t("reprojectionError"),
      raw: raw?.avgReprojectionError,
      processed: processed?.avgReprojectionError,
      diff: comparison?.reprojectionErrorImprovementPercent,
      type: "metric",
      diffIsPercent: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)]">
      <div className="border-b border-[var(--border-base)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-base)]">
          {t("title")}
        </h3>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {t("description")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-[var(--bg-hover)] text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                {t("criterion")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("rawFlow")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("processedFlow")}
              </th>
              <th className="px-4 py-3 text-left font-medium">
                {t("difference")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-base)]">
            {rows.map((row) => (
              <tr
                key={row.key}
                className="text-[var(--text-base)] transition hover:bg-[var(--bg-hover)]"
              >
                <td className="px-4 py-3 font-medium">{row.label}</td>

                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {row.type === "metric"
                    ? formatMetric(row.raw)
                    : formatNumber(row.raw, locale)}
                </td>

                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {row.type === "metric"
                    ? formatMetric(row.processed)
                    : formatNumber(row.processed, locale)}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold`}
                  >
                    {formatDiff(row.diff, locale, {
                      isPercent: row.diffIsPercent,
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
