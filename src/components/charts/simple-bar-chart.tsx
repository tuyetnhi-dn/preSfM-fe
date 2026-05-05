interface ChartItem {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  items: ChartItem[];
  max?: number;
}

export function SimpleBarChart({ items, max = 100 }: SimpleBarChartProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-steel">{item.label}</span>
            <span className="text-steel">{item.value}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((item.value / max) * 100, 100)}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
