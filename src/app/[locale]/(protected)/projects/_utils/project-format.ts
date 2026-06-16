export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "0";

  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "0%";

  return `${value.toFixed(2)}%`;
}

export function formatMetric(value?: number | null, digits = 4) {
  if (value === null || value === undefined) return "-";

  return value.toFixed(digits);
}
