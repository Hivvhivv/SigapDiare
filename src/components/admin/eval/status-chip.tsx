import { Chip } from "@/components/ui/chip";
import type { WindowStatus } from "@/lib/eval/window";

const STATUS: Record<WindowStatus, { label: string; tone: "neutral" | "warning" | "success" }> = {
  UNSCHEDULED: { label: "Draft (belum dijadwalkan)", tone: "neutral" },
  UPCOMING: { label: "Terjadwal", tone: "warning" },
  OPEN: { label: "Dibuka", tone: "success" },
  CLOSED: { label: "Ditutup", tone: "neutral" },
};

export function InstrumentStatusChip({ status, locked }: { status: WindowStatus; locked?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Chip tone={STATUS[status].tone}>{STATUS[status].label}</Chip>
      {locked && <Chip tone="danger">Terkunci</Chip>}
    </span>
  );
}
