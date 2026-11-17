// Status jendela waktu evaluasi (pretest/posttest). Fungsi murni.

export type WindowStatus = "UNSCHEDULED" | "UPCOMING" | "OPEN" | "CLOSED";

export function windowStatus(
  opensAt: Date | null | undefined,
  closesAt: Date | null | undefined,
  now: Date,
): WindowStatus {
  if (!opensAt) return "UNSCHEDULED";
  if (now < opensAt) return "UPCOMING";
  if (closesAt && now >= closesAt) return "CLOSED";
  return "OPEN";
}

export const PHASE_SLUG = { PRETEST: "pretest", POSTTEST: "posttest" } as const;
/** Istilah penelitian (dipakai di panel admin & ekspor). */
export const PHASE_LABEL = { PRETEST: "Pretest", POSTTEST: "Posttest" } as const;
/** Istilah awam untuk orang tua. */
export const PHASE_FRIENDLY_LABEL = { PRETEST: "Kuis Awal", POSTTEST: "Kuis Akhir" } as const;
export type Phase = keyof typeof PHASE_SLUG;

export function phaseFromSlug(slug: string): Phase | null {
  if (slug === "pretest") return "PRETEST";
  if (slug === "posttest") return "POSTTEST";
  return null;
}
