import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { toCsv, type CsvValue } from "@/lib/csv";
import { localDateString } from "@/lib/dates";
import { PHASE_SLUG } from "@/lib/eval/window";
import type { ChoiceOption } from "@/lib/validation/eval";
import { logAudit } from "@/server/audit";
import { db } from "@/server/db";
import { isObjectId, requireAdmin } from "@/server/guards";
import { SUBMITTED } from "@/server/queries/eval";

// Ekspor hasil evaluasi: satu baris per responden. Hanya kode responden, TANPA nama/nomor HP/kode akses.
export async function GET(_request: NextRequest, ctx: RouteContext<"/admin/evaluasi/[id]/ekspor">) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  if (!isObjectId(id)) notFound();

  const instrument = await db.evalInstrument.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!instrument) notFound();

  const attempts = await db.evalAttempt.findMany({
    where: { instrumentId: instrument.id, submittedAt: SUBMITTED },
    include: { answers: true, participant: { select: { code: true, seq: true } } },
  });
  attempts.sort((a, b) => a.participant.seq - b.participant.seq);

  const sections = [...new Set(instrument.questions.map((q) => q.section ?? "Umum"))];
  const num = (i: number) => `Q${String(i + 1).padStart(2, "0")}`;
  const header: CsvValue[] = [
    "kode_responden",
    "fase",
    "versi",
    "mulai",
    "selesai",
    ...instrument.questions.flatMap((_, i) => [`${num(i)}_jawaban`, `${num(i)}_skor`]),
    ...sections.map((s) => `subskor_${s}`),
    "skor_otomatis",
    "skor_total",
  ];

  const rows = attempts.map((attempt) => {
    const byQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
    const sectionScores = (attempt.sectionScores as Record<string, number> | null) ?? {};
    const cells = instrument.questions.flatMap((q) => {
      const answer = byQuestion.get(q.id);
      if (!answer) return ["", ""];
      let shown: CsvValue = "";
      if (q.type === "CHOICE") shown = ((q.options as ChoiceOption[] | null) ?? []).find((o) => o.id === answer.optionId)?.label ?? "";
      else if (q.type === "SCALE") shown = answer.scaleValue ?? "";
      else shown = answer.textValue ?? "";
      return [shown, q.scored ? (answer.score ?? "") : ""];
    });
    return [
      attempt.participant.code,
      PHASE_SLUG[instrument.phase],
      instrument.version,
      attempt.startedAt.toISOString(),
      attempt.submittedAt?.toISOString() ?? "",
      ...cells,
      ...sections.map((s) => sectionScores[s] ?? ""),
      attempt.autoScore ?? "",
      attempt.totalScore ?? "",
    ];
  });

  await logAudit(admin.id, "eval.export", instrument.id, { rows: rows.length });
  const filename = `sigap-diare_${PHASE_SLUG[instrument.phase]}_v${instrument.version}_${localDateString(new Date()).replaceAll("-", "")}.csv`;
  return new Response(toCsv([header, ...rows]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
