import { CalendarDays, CircleCheck, ClipboardList, Droplets, PenLine, Pill, Plus, Trash2, TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/eval/confirm-submit";
import { Container, PageHeader } from "@/components/layout/page-header";
import { DangerAlert } from "@/components/safety/danger-alert";
import { CareLogForm } from "@/components/tracker/care-log-form";
import { StoolChart } from "@/components/tracker/stool-chart";
import { Button, ButtonLink, buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { CONDITION_LABEL, CONSISTENCY_LABEL, DRINKING_LABEL, TRACKER_DISCLAIMER } from "@/content/copy/tracker";
import { formatDateId, formatDateTimeId, nowJakartaLocalInput } from "@/lib/dates";
import { deleteTrackerEntry, endEpisode, markZincToday, startEpisode } from "@/server/actions/tracker";
import { requireRespondent } from "@/server/guards";
import { asDangerSigns, getOwnEntry, getTrackerOverview } from "@/server/queries/tracker";

export const metadata: Metadata = { title: "Catatan Diare" };

const TIME = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function TrackerPage(props: PageProps<"/fitur/pelacak">) {
  const user = await requireRespondent();
  const [overview, search] = await Promise.all([getTrackerOverview(user), props.searchParams]);
  if (!overview) return null;
  const { child, episode, entries, chart } = overview;

  const savedId = typeof search.tersimpan === "string" ? search.tersimpan : null;
  const saved = savedId ? await getOwnEntry(user.id, savedId) : null;
  const savedSigns = saved ? asDangerSigns(saved.dangerFlags) : [];

  const byDay = new Map<string, typeof entries>();
  for (const entry of entries) byDay.set(entry.dayKey, [...(byDay.get(entry.dayKey) ?? []), entry]);

  return (
    <Container narrow>
      <PageHeader
        title="Catatan Diare"
        illustration="catatan"
        tone="mint"
        description={`Catat kondisi ${child.nickname} untuk memantau perubahannya dari waktu ke waktu.`}
        back={{ href: "/beranda", label: "Beranda" }}
      />

      <div className="flex flex-col gap-6">
        {saved && savedSigns.length > 0 && <DangerAlert signs={savedSigns} />}
        {saved && savedSigns.length === 0 && (
          <Callout variant="success">Catatan tersimpan. Terima kasih sudah mencatat, Ayah/Bunda!</Callout>
        )}
        {search.dihapus === "1" && <Callout variant="info">Catatan sudah dihapus.</Callout>}
        {search.rencana === "1" && <Callout variant="success">Rencana dari tenaga kesehatan tersimpan.</Callout>}
        {search.pulih === "1" && (
          <Callout variant="success">Syukurlah, semoga {child.nickname} sehat selalu. Pemantauan diare sudah diakhiri.</Callout>
        )}

        <ButtonLink href="/fitur/pelacak/catat" className="w-full">
          <Plus aria-hidden className="size-5" />
          Catat Kondisi Sekarang
        </ButtonLink>

        {episode ? (
          <section aria-labelledby="episode-title" className="flex flex-col gap-5 rounded-xl border border-tertiary-200 bg-tertiary-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="episode-title" className="text-h3 font-bold">
                Pemantauan hari ke-{episode.dayNumber}
              </h2>
              <Chip tone="warning">
                <CalendarDays aria-hidden className="size-4" />
                Sejak {formatDateId(episode.startedAt)}
              </Chip>
            </div>

            <div className="rounded-lg bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-label font-semibold">
                  <ClipboardList aria-hidden className="size-5 text-primary-600" />
                  Anjuran tenaga kesehatan
                </h3>
                <Link href="/fitur/pelacak/rencana" className="text-label font-semibold text-primary-700 hover:underline">
                  {episode.zincDays || episode.fluidTargetMl || episode.instructionNote ? "Ubah" : "Isi anjuran"}
                </Link>
              </div>
              {episode.zincDays || episode.fluidTargetMl || episode.instructionNote ? (
                <ul className="flex flex-col gap-1 text-body">
                  {episode.zincDays && <li>Zinc selama {episode.zincDays} hari</li>}
                  {episode.fluidTargetMl && <li>Target cairan {episode.fluidTargetMl} ml per hari</li>}
                  {episode.instructionNote && <li className="whitespace-pre-line text-on-surface-variant">{episode.instructionNote}</li>}
                </ul>
              ) : (
                <p className="text-body text-on-surface-variant">
                  Belum diisi. Tulis anjuran dokter/bidan di sini agar tidak lupa.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-surface p-4">
                <h3 className="mb-1 flex items-center gap-2 text-label font-semibold">
                  <Droplets aria-hidden className="size-5 text-secondary-700" />
                  Cairan hari ini
                </h3>
                <p className="text-h2 font-bold tabular-nums">{episode.fluidTodayMl} ml</p>
                <p className="text-caption text-on-surface-variant">
                  {episode.fluidTargetMl ? `Target dari tenaga kesehatan: ${episode.fluidTargetMl} ml` : `${episode.todayLogs.filter((l) => l.type !== "ZINC").length} kali dicatat`}
                </p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <h3 className="mb-1 flex items-center gap-2 text-label font-semibold">
                  <Pill aria-hidden className="size-5 text-tertiary-700" />
                  Zinc
                </h3>
                <p className="text-body font-semibold">
                  {episode.zincDays ? `Hari ke-${episode.zincDaysGiven} dari ${episode.zincDays}` : `${episode.zincDaysGiven} hari tercatat`}
                </p>
                {episode.zincGivenToday ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-label font-semibold text-success-strong">
                    <CircleCheck aria-hidden className="size-5" />
                    Sudah diberikan hari ini
                  </p>
                ) : (
                  <form action={markZincToday} className="mt-2">
                    <Button type="submit" variant="tonal" size="sm">
                      Zinc sudah diberikan hari ini
                    </Button>
                  </form>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-surface p-4">
              <h3 className="mb-3 text-label font-semibold">Catat oralit / cairan</h3>
              <CareLogForm defaultGivenAt={nowJakartaLocalInput()} />
              {episode.todayLogs.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1 border-t border-outline-variant pt-3 text-caption text-on-surface-variant">
                  {episode.todayLogs.map((log) => (
                    <li key={log.id}>
                      {TIME.format(log.givenAt)} · {log.type === "ZINC" ? "Zinc" : `${log.amountMl} ml ${log.type === "ORALIT" ? "oralit" : "cairan"}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form action={endEpisode}>
              <ConfirmSubmit
                message={`Akhiri pemantauan? Pilih ini bila ${child.nickname} sudah pulih.`}
                className={buttonClass("outlined", "md", "w-full bg-surface")}
              >
                <CircleCheck aria-hidden className="size-5" />
                {child.nickname} sudah pulih
              </ConfirmSubmit>
            </form>
          </section>
        ) : (
          <section className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="text-h3 font-bold">{child.nickname} sedang diare?</h2>
            <p className="text-body text-on-surface-variant">
              Mulai pemantauan untuk mencatat cairan, oralit, dan zinc sesuai anjuran tenaga kesehatan setiap hari.
            </p>
            <form action={startEpisode}>
              <Button type="submit" variant="tonal">
                Mulai Pemantauan Diare
              </Button>
            </form>
          </section>
        )}

        <section aria-labelledby="chart-title" className="rounded-xl border border-outline-variant bg-surface p-5">
          <h2 id="chart-title" className="mb-4 text-h3 font-bold">
            Jumlah BAB 7 hari terakhir
          </h2>
          <StoolChart days={chart} />
        </section>

        <section aria-labelledby="history-title" className="flex flex-col gap-4">
          <h2 id="history-title" className="text-h3 font-bold">
            Riwayat catatan
          </h2>
          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-body text-on-surface-variant">
              Belum ada catatan. Tekan &ldquo;Catat Kondisi Sekarang&rdquo; bila {child.nickname} BAB lebih sering atau lebih cair dari biasanya.
            </p>
          ) : (
            [...byDay].map(([dayKey, dayEntries]) => (
              <div key={dayKey} className="flex flex-col gap-2">
                <h3 className="text-label font-semibold text-on-surface-variant">{formatDateId(dayEntries[0].recordedAt)}</h3>
                <ul className="flex flex-col gap-2">
                  {dayEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className={`rounded-lg border bg-surface p-4 ${entry.dangerSigns.length ? "border-danger-border" : "border-outline-variant"}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-body font-semibold">
                            {TIME.format(entry.recordedAt)} · BAB {entry.stoolCount}× · {CONSISTENCY_LABEL[entry.consistency]}
                          </p>
                          <p className="text-caption text-on-surface-variant">
                            {[
                              entry.bloodInStool === true && "ada darah",
                              entry.vomitCount !== null && `muntah ${entry.vomitCount}×`,
                              entry.drinkingAbility && DRINKING_LABEL[entry.drinkingAbility].toLowerCase(),
                              entry.generalCondition && CONDITION_LABEL[entry.generalCondition].toLowerCase(),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {entry.notes && <p className="mt-1 text-caption whitespace-pre-line">{entry.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/fitur/pelacak/${entry.id}`}
                            aria-label="Ubah catatan"
                            className="flex size-11 items-center justify-center rounded-full hover:bg-surface-container"
                          >
                            <PenLine aria-hidden className="size-5" />
                          </Link>
                          <form action={deleteTrackerEntry}>
                            <input type="hidden" name="entryId" value={entry.id} />
                            <ConfirmSubmit
                              message="Hapus catatan ini?"
                              aria-label="Hapus catatan"
                              className="flex size-11 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                            >
                              <Trash2 aria-hidden className="size-5" />
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </div>
                      {entry.dangerSigns.length > 0 && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-caption font-semibold text-danger-strong">
                          <TriangleExclamationPoint aria-hidden className="size-4" />
                          Ada tanda bahaya. Segera ke fasilitas kesehatan.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
          {entries.length > 0 && (
            <p className="text-caption text-on-surface-variant">
              Menampilkan catatan 30 hari terakhir. Terakhir dicatat {formatDateTimeId(entries[0].recordedAt)} WIB.
            </p>
          )}
        </section>

        <Callout variant="disclaimer">{TRACKER_DISCLAIMER}</Callout>
      </div>
    </Container>
  );
}
