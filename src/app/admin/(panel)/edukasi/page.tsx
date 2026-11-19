import { ArrowDown, ArrowUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TopicForm } from "@/components/admin/content/topic-form";
import { ContentStatusChip } from "@/components/admin/content/status-chip";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { topicAction } from "@/server/actions/admin-content";
import { requireAdmin } from "@/server/guards";
import { DANGER_TOPIC_SLUG, listTopicsForAdmin } from "@/server/queries/content";

export const metadata: Metadata = { title: "Konten Edukasi" };

export default async function AdminEducationPage() {
  const admin = await requireAdmin();
  const topics = await listTopicsForAdmin();
  const inReview = topics.reduce((sum, t) => sum + t.inReviewCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold">Konten Edukasi</h1>
        <p className="text-body text-on-surface-variant">
          Materi berisi submateri berurutan. Submateri klinis wajib disetujui peninjau klinis sebelum dapat diterbitkan.
        </p>
      </div>

      {inReview > 0 && (
        <Callout variant={admin.isClinicalReviewer ? "warning" : "info"}>
          {inReview} submateri menunggu tinjauan
          {admin.isClinicalReviewer ? ". Sebagai peninjau klinis, Anda dapat menyetujuinya." : " peninjau klinis."}
        </Callout>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <ol className="flex flex-col gap-3">
          {topics.map((topic, index) => {
            const isDangerTopic = topic.slug === DANGER_TOPIC_SLUG;
            return (
              <li key={topic.id} className="flex items-stretch gap-2 rounded-lg border border-outline-variant bg-surface">
                {isDangerTopic ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{topic.title}</p>
                      <Chip tone="neutral">Halaman tetap</Chip>
                    </div>
                    <p className="text-caption text-on-surface-variant">
                      Diarahkan ke halaman publik /tanda-bahaya, yang isinya mengikuti aturan tanda bahaya di kode (teruji). Tidak diubah dari sini.
                    </p>
                  </div>
                ) : (
                  <Link href={`/admin/edukasi/${topic.id}`} className="flex min-w-0 flex-1 flex-col gap-2 rounded-l-lg p-4 hover:bg-surface-container">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{topic.title}</p>
                      <ContentStatusChip status={topic.status} kind={topic.kind} />
                    </div>
                    <p className="text-caption text-on-surface-variant">
                      {topic.lessonCount} submateri · {topic.publishedCount} terbit
                      {topic.inReviewCount > 0 && ` · ${topic.inReviewCount} menunggu tinjauan`}
                    </p>
                  </Link>
                )}
                <div className="flex shrink-0 flex-col justify-center p-1">
                  {(
                    [
                      ["up", ArrowUp, "Naikkan", index === 0],
                      ["down", ArrowDown, "Turunkan", index === topics.length - 1],
                    ] as const
                  ).map(([op, Icon, label, disabled]) => (
                    <form key={op} action={topicAction}>
                      <input type="hidden" name="topicId" value={topic.id} />
                      <input type="hidden" name="op" value={op} />
                      <button
                        type="submit"
                        disabled={disabled || isDangerTopic}
                        aria-label={`${label} ${topic.title}`}
                        className="flex size-11 items-center justify-center rounded-full hover:bg-surface-container disabled:opacity-30"
                      >
                        <Icon aria-hidden className="size-5" />
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
        <TopicForm />
      </div>
    </div>
  );
}
