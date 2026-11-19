import { cn } from "@/lib/utils";

/** Grafik batang jumlah BAB per hari (7 hari). Angka selalu ditulis, bukan hanya tinggi batang. */
export function StoolChart({ days }: { days: { key: string; label: string; total: number; isToday: boolean }[] }) {
  const max = Math.max(1, ...days.map((d) => d.total));
  return (
    <figure>
      <div className="flex h-40 items-end gap-2" role="list" aria-label="Jumlah BAB per hari, 7 hari terakhir">
        {days.map((day) => (
          <div key={day.key} role="listitem" className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-label font-bold tabular-nums">{day.total}</span>
            <div
              className={cn("w-full max-w-12 rounded-t-md", day.isToday ? "bg-primary-600" : "bg-primary-300")}
              style={{ height: `${Math.max(4, (day.total / max) * 100)}%` }}
              aria-hidden
            />
            <span className={cn("text-[0.8125rem]", day.isToday ? "font-bold text-primary-700" : "text-on-surface-variant")}>
              {day.isToday ? "Hari ini" : day.label}
            </span>
            <span className="sr-only">: {day.total} kali BAB</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
