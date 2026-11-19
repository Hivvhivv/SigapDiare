import type { ContentKind, ContentStatus } from "@prisma/client";
import { Chip } from "@/components/ui/chip";

const STATUS: Record<ContentStatus, { label: string; tone: "neutral" | "warning" | "primary" | "success" | "danger" }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  IN_REVIEW: { label: "Menunggu Tinjauan", tone: "warning" },
  APPROVED: { label: "Disetujui", tone: "primary" },
  PUBLISHED: { label: "Terbit", tone: "success" },
  ARCHIVED: { label: "Diarsipkan", tone: "neutral" },
};

export const KIND_LABEL: Record<ContentKind, string> = { GENERAL: "Umum", CLINICAL: "Klinis" };

export function ContentStatusChip({ status, kind }: { status: ContentStatus; kind?: ContentKind }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Chip tone={STATUS[status].tone}>{STATUS[status].label}</Chip>
      {kind === "CLINICAL" && <Chip tone="secondary">Klinis</Chip>}
    </span>
  );
}
