import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, PenLine, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatusChip } from "@/components/admin/content/status-chip";
import { TopicForm } from "@/components/admin/content/topic-form";
import { ConfirmSubmit } from "@/components/admin/eval/confirm-submit";
import { buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { lessonListAction, topicAction } from "@/server/actions/admin-content";
import { isObjectId, requireAdmin } from "@/server/guards";
import { DANGER_TOPIC_SLUG, getTopicForAdmin } from "@/server/queries/content";

export const metadata: Metadata = { title: "Kelola Materi" };

const ERRORS: Record<string, string> = {
  kosong: "Materi belum dapat diterbitkan: terbitkan minimal satu submateri terlebih dahulu.",
  berisi: "Materi yang masih berisi submateri tidak dapat dihapus. Hapus atau pindahkan submaterinya dulu.",
};

export default async function AdminTopicPage(props: PageProps<"/admin/edukasi/[topicId]">) {
  await requireAdmin();
  const { topicId } = await props.params;
  if (!isObjectId(topicId)) notFound();
  const topic = await getTopicForAdmin(topicId);
  if (!topic || topic.slug === DANGER_TOPIC_SLUG) notFound();
  const search = await props.searchParams;
  const error = typeof search.galat === "string" ? ERRORS[search.galat] : undefined;
  const base = `/admin/edukasi/${topic.id}`;
  const published = topic.status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/edukasi" className="inline-flex w-fit items-center gap-1 text-label font-semibold text-primary-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Semua materi
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-bold">{topic.title}</h1>
          <ContentStatusChip status={topic.status} kind={topic.kind} />
        </div>
        <p className="text-body text-on-surface-variant">Alamat untuk responden: /edukasi/{topic.slug}</p>
        <div className="flex flex-wrap gap-2">
          <form action={topicAction}>
            <input type="hidden" name="topicId" value={topic.id} />
            <input type="hidden" name="op" value={published ? "unpublish" : "publish"} />
            <button type="submit" className={buttonClass(published ? "outlined" : "primary", "sm")}>
              {published ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
              {published ? "Sembunyikan dari Responden" : "Terbitkan Materi"}
            </button>
          </form>
        </div>
      </div>

      {error && <Callout variant="danger">{error}</Callout>}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <section aria-labelledby="lessons-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="lessons-title" className="text-h2 font-bold">
              Submateri
            </h2>
            <Link href={`${base}/baru`} className={buttonClass("tonal", "sm")}>
              <Plus aria-hidden className="size-4" />
              Tambah Submateri
            </Link>
          </div>

          {topic.lessons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant p-8 text-center text-body text-on-surface-variant">
              Belum ada submateri. Tambahkan submateri pertama.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {topic.lessons.map((lesson, index) => (
                <li key={lesson.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-outline-variant bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-bold tabular-nums">{index + 1}.</span>
                      <ContentStatusChip status={lesson.status} kind={lesson.kind} />
                    </div>
                    <p className="text-body font-semibold">{lesson.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <Link
                      href={`${base}/${lesson.id}`}
                      aria-label={`Ubah ${lesson.title}`}
                      className="flex size-11 items-center justify-center rounded-full hover:bg-surface-container"
                    >
                      <PenLine aria-hidden className="size-5" />
                    </Link>
                    {(
                      [
                        ["up", ArrowUp, "Naikkan", index === 0],
                        ["down", ArrowDown, "Turunkan", index === topic.lessons.length - 1],
                      ] as const
                    ).map(([op, Icon, label, disabled]) => (
                      <form key={op} action={lessonListAction}>
                        <input type="hidden" name="topicId" value={topic.id} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="op" value={op} />
                        <button
                          type="submit"
                          disabled={disabled}
                          aria-label={`${label} ${lesson.title}`}
                          className="flex size-11 items-center justify-center rounded-full hover:bg-surface-container disabled:opacity-30"
                        >
                          <Icon aria-hidden className="size-5" />
                        </button>
                      </form>
                    ))}
                    <form action={lessonListAction}>
                      <input type="hidden" name="topicId" value={topic.id} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="op" value="delete" />
                      <ConfirmSubmit
                        message={`Hapus submateri "${lesson.title}"? Progres baca responden untuk submateri ini ikut terhapus.`}
                        aria-label={`Hapus ${lesson.title}`}
                        className="flex size-11 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                      >
                        <Trash2 aria-hidden className="size-5" />
                      </ConfirmSubmit>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <TopicForm topicId={topic.id} initial={{ title: topic.title, summary: topic.summary, kind: topic.kind }} />
          {topic.lessons.length === 0 && (
            <form action={topicAction}>
              <input type="hidden" name="topicId" value={topic.id} />
              <input type="hidden" name="op" value="delete" />
              <ConfirmSubmit
                message="Hapus materi ini?"
                className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-label font-semibold text-danger-strong hover:bg-danger-soft"
              >
                <Trash2 aria-hidden className="size-4" />
                Hapus Materi
              </ConfirmSubmit>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
