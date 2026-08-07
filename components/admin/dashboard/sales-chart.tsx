import { formatNaira } from "@/lib/currency";

const CHART_HEIGHT_PX = 220;

export function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div className="flex h-56 items-end gap-0.5">
      {data.map((day) => (
        <div
          key={day.date}
          title={`${day.date}: ${formatNaira(day.revenue)}`}
          className="flex-1 rounded-t-sm bg-primary/70 transition-colors hover:bg-primary"
          style={{ height: `${Math.max(2, (day.revenue / max) * CHART_HEIGHT_PX)}px` }}
        />
      ))}
    </div>
  );
}
