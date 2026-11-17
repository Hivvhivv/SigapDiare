import type { Metadata } from "next";
import Link from "next/link";
import { CreateInstrumentForm } from "@/components/admin/eval/create-instrument-form";
import { InstrumentStatusChip } from "@/components/admin/eval/status-chip";
import { formatDateTimeId } from "@/lib/dates";
import { PHASE_LABEL } from "@/lib/eval/window";
import { requireAdmin } from "@/server/guards";
import { listInstruments } from "@/server/queries/eval";

export const metadata: Metadata = { title: "Evaluasi" };

export default async function AdminEvaluationPage() {
  await requireAdmin();
  const instruments = await listInstruments();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold">Evaluasi</h1>
        <p className="text-body text-on-surface-variant">
          Responden mengerjakan versi terbaru yang sudah dijadwalkan untuk tiap fase. Soal terkunci setelah ada jawaban masuk.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section aria-label="Daftar instrumen">
          {instruments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant p-8 text-center text-body text-on-surface-variant">
              Belum ada instrumen. Buat pretest terlebih dahulu.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {instruments.map((instrument) => (
                <li key={instrument.id}>
                  <Link
                    href={`/admin/evaluasi/${instrument.id}`}
                    className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface p-4 hover:bg-surface-container"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">
                        {PHASE_LABEL[instrument.phase]} v{instrument.version} · {instrument.title}
                      </p>
                      <InstrumentStatusChip status={instrument.status} locked={instrument._count.attempts > 0} />
                    </div>
                    <p className="text-caption text-on-surface-variant">
                      {instrument._count.questions} soal · {instrument._count.attempts} mulai mengerjakan ·{" "}
                      {instrument.submittedCount} selesai
                      {instrument.opensAt && ` · dibuka ${formatDateTimeId(instrument.opensAt)} WIB`}
                      {instrument.closesAt && ` · ditutup ${formatDateTimeId(instrument.closesAt)} WIB`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <CreateInstrumentForm />
      </div>
    </div>
  );
}
