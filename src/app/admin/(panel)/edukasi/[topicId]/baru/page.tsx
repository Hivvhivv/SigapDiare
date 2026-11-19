import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/content/lesson-form";
import { isObjectId, requireAdmin } from "@/server/guards";
import { DANGER_TOPIC_SLUG, getTopicForAdmin } from "@/server/queries/content";

export const metadata: Metadata = { title: "Tambah Submateri" };

export default async function NewLessonPage(props: PageProps<"/admin/edukasi/[topicId]/baru">) {
  await requireAdmin();
  const { topicId } = await props.params;
  if (!isObjectId(topicId)) notFound();
  const topic = await getTopicForAdmin(topicId);
  if (!topic || topic.slug === DANGER_TOPIC_SLUG) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/admin/edukasi/${topic.id}`}
          className="inline-flex w-fit items-center gap-1 text-label font-semibold text-primary-700 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {topic.title}
        </Link>
        <h1 className="text-h1 font-bold">Tambah Submateri</h1>
        <p className="text-body text-on-surface-variant">Submateri baru disimpan sebagai Draft dan belum terlihat responden.</p>
      </div>
      <LessonForm topicId={topic.id} initial={{ title: "", body: "", references: "", kind: topic.kind }} />
    </div>
  );
}
