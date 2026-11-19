import type { ContentKind, ContentStatus } from "@prisma/client";

// Alur status konten edukasi.
// - Umum (GENERAL): DRAFT → PUBLISHED langsung oleh admin.
// - Klinis (CLINICAL): DRAFT → IN_REVIEW → APPROVED → PUBLISHED. Hanya peninjau klinis yang boleh
//   menyetujui (APPROVED). Mengubah isi konten klinis membatalkan persetujuan (kembali ke DRAFT).

export type WorkflowAction = "submit" | "return" | "approve" | "publish" | "unpublish" | "archive" | "restore";

type Transition = { from: ContentStatus[]; to: ContentStatus; kinds: ContentKind[]; reviewerOnly?: boolean };

const TRANSITIONS: Record<WorkflowAction, Transition> = {
  submit: { from: ["DRAFT"], to: "IN_REVIEW", kinds: ["CLINICAL"] },
  return: { from: ["IN_REVIEW", "APPROVED"], to: "DRAFT", kinds: ["CLINICAL"] },
  approve: { from: ["IN_REVIEW"], to: "APPROVED", kinds: ["CLINICAL"], reviewerOnly: true },
  publish: { from: ["DRAFT"], to: "PUBLISHED", kinds: ["GENERAL"] },
  unpublish: { from: ["PUBLISHED"], to: "DRAFT", kinds: ["GENERAL"] },
  archive: { from: ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED"], to: "ARCHIVED", kinds: ["GENERAL", "CLINICAL"] },
  restore: { from: ["ARCHIVED"], to: "DRAFT", kinds: ["GENERAL", "CLINICAL"] },
};

// Konten klinis: terbit hanya dari APPROVED, dan ditarik kembali ke APPROVED (persetujuan tetap berlaku
// selama isi tidak diubah).
const CLINICAL_PUBLISH: Transition = { from: ["APPROVED"], to: "PUBLISHED", kinds: ["CLINICAL"] };
const CLINICAL_UNPUBLISH: Transition = { from: ["PUBLISHED"], to: "APPROVED", kinds: ["CLINICAL"] };

function transitionFor(action: WorkflowAction, kind: ContentKind): Transition {
  if (kind === "CLINICAL" && action === "publish") return CLINICAL_PUBLISH;
  if (kind === "CLINICAL" && action === "unpublish") return CLINICAL_UNPUBLISH;
  return TRANSITIONS[action];
}

export type WorkflowActor = { isClinicalReviewer: boolean };

/** Status tujuan bila aksi diizinkan, atau null. */
export function nextStatus(
  action: WorkflowAction,
  item: { kind: ContentKind; status: ContentStatus },
  actor: WorkflowActor,
): ContentStatus | null {
  const t = transitionFor(action, item.kind);
  if (!t.kinds.includes(item.kind) || !t.from.includes(item.status)) return null;
  if (t.reviewerOnly && !actor.isClinicalReviewer) return null;
  return t.to;
}

/** Aksi yang tersedia untuk tombol di editor. */
export function availableActions(item: { kind: ContentKind; status: ContentStatus }, actor: WorkflowActor): WorkflowAction[] {
  return (Object.keys(TRANSITIONS) as WorkflowAction[]).filter((action) => nextStatus(action, item, actor) !== null);
}

/** Status setelah isi (judul/teks/referensi/jenis) diubah. */
export function statusAfterEdit(item: { kind: ContentKind; status: ContentStatus }, newKind: ContentKind): ContentStatus {
  if (item.status === "ARCHIVED") return "ARCHIVED";
  if (newKind === "CLINICAL") return "DRAFT"; // persetujuan lama tidak berlaku untuk isi baru
  if (item.kind === "CLINICAL") return "DRAFT"; // baru diturunkan ke umum: terbitkan ulang secara sadar
  return item.status;
}

/** Konten klinis tidak boleh diubah menjadi umum kecuali oleh peninjau klinis (jalan pintas lolos tinjauan). */
export function kindChangeError(from: ContentKind, to: ContentKind, actor: WorkflowActor): string | null {
  if (from === "CLINICAL" && to === "GENERAL" && !actor.isClinicalReviewer) {
    return "Hanya peninjau klinis yang dapat mengubah konten klinis menjadi umum.";
  }
  return null;
}

// Angka diikuti satuan takaran. Konten umum yang memuatnya wajib dijadikan klinis agar ditinjau.
const DOSE_PATTERN = /(?:\d+(?:[.,/]\d+)?|[½¼¾])\s*(?:-|–|s\.?d\.?|sampai)?\s*(?:\d+(?:[.,]\d+)?\s*)?(?:ml|mL|cc|mg|gram|g|sachet|bungkus|tablet|tab|kapsul|sendok|sdm|sdt|gelas)\b/i;

export function mentionsDose(text: string): boolean {
  return DOSE_PATTERN.test(text);
}
