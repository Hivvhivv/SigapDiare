import type { ContentStatus } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/content/lesson-form";
import { ContentStatusChip } from "@/components/admin/content/status-chip";
import { ConfirmSubmit } from "@/components/admin/eval/confirm-submit";
import { LessonContent } from "@/components/education/lesson-content";
import { buttonClass, type ButtonVariant } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { lessonBodyToText } from "@/lib/content/lesson-body";
import { availableActions, type WorkflowAction } from "@/lib/content/workflow";
import { formatDateTimeId } from "@/lib/dates";
import { lessonWorkflow } from "@/server/actions/admin-content";
import { isObjectId, requireAdmin } from "@/server/guards";
import { DANGER_TOPIC_SLUG, getLessonForAdmin } from "@/server/queries/content";

export const metadata: Metadata = { title: "Ubah Submateri" };

const ACTION_BUTTON: Record<WorkflowAction, { label: string; variant: ButtonVariant; confirm?: string }> = {
  submit: { label: "Ajukan untuk Ditinjau", variant: "primary" },
  approve: { label: "Setujui sebagai Peninjau Klinis", variant: "primary" },
  publish: { label: "Terbitkan", variant: "primary" },
  return: { label: "Kembalikan ke Draft", variant: "outlined" },
  unpublish: { label: "Tarik dari Publikasi", variant: "outlined" },
  restore: { label: "Pulihkan ke Draft", variant: "outlined" },
  archive: { label: "Arsipkan", variant: "text", confirm: "Arsipkan submateri ini? Submateri tidak akan tampil ke responden." },
};

const STATUS_HINT: Record<ContentStatus, string> = {
  DRAFT: "Belum terlihat responden.",
  IN_REVIEW: "Menunggu persetujuan peninjau klinis. Belum terlihat responden.",
  APPROVED: "Sudah disetujui peninjau klinis dan siap diterbitkan.",
  PUBLISHED: "Tampil ke responden (bila materinya juga terbit).",
  ARCHIVED: "Diarsipkan, tidak tampil ke responden.",
};

export default async function LessonEditorPage(props: PageProps<"/admin/edukasi/[topicId]/[lessonId]">) {
  const admin = await requireAdmin();
  const { topicId, lessonId } = await props.params;
  if (!isObjectId(topicId) || !isObjectId(lessonId)) notFound();
  const lesson = await getLessonForAdmin(topicId, lessonId);
  if (!lesson || lesson.topic.slug === DANGER_TOPIC_SLUG) notFound();
  const search = await props.searchParams;

  const actions = availableActions(lesson, admin);
  const waitingForReviewer = lesson.status === "IN_REVIEW" && !admin.isClinicalReviewer;
  const approvalWillReset = lesson.kind === "CLINICAL" && ["IN_REVIEW", "APPROVED", "PUBLISHED"].includes(lesson.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/admin/edukasi/${lesson.topicId}`}
          className="inline-flex w-fit items-center gap-1 text-label font-semibold text-primary-700 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {lesson.topic.title}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-bold">{lesson.title}</h1>
          <ContentStatusChip status={lesson.status} kind={lesson.kind} />
        </div>
        <p className="text-body text-on-surface-variant">Alamat untuk responden: /edukasi/{lesson.topic.slug}/{lesson.slug}</p>
      </div>

      {search.galat === "status" && <Callout variant="danger">Status tidak dapat diubah dengan cara itu. Muat ulang halaman lalu coba lagi.</Callout>}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <LessonForm
          topicId={lesson.topicId}
          lessonId={lesson.id}
          approvalWillReset={approvalWillReset}
          initial={{
            title: lesson.title,
            body: lessonBodyToText(lesson.blocks),
            references: lesson.references.join("\n"),
            kind: lesson.kind,
          }}
        />

        <aside className="flex flex-col gap-6">
          <section aria-labelledby="status-title" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-5">
            <h2 id="status-title" className="text-h3 font-bold">
              Status & Persetujuan
            </h2>
            <p className="text-body">{STATUS_HINT[lesson.status]}</p>
            {lesson.approvedAt && lesson.approverName && (
              <p className="text-caption text-on-surface-variant">
                Disetujui oleh {lesson.approverName} pada {formatDateTimeId(lesson.approvedAt)} WIB
              </p>
            )}
            {lesson.publishedAt && lesson.status === "PUBLISHED" && (
              <p className="text-caption text-on-surface-variant">Diterbitkan {formatDateTimeId(lesson.publishedAt)} WIB</p>
            )}
            {waitingForReviewer && (
              <Callout variant="info">Hanya admin dengan tanda Peninjau Klinis yang dapat menyetujui submateri ini.</Callout>
            )}
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => {
                const { label, variant, confirm } = ACTION_BUTTON[action];
                return (
                  <form key={action} action={lessonWorkflow}>
                    <input type="hidden" name="topicId" value={lesson.topicId} />
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="op" value={action} />
                    {confirm ? (
                      <ConfirmSubmit message={confirm} className={buttonClass(variant, "sm")}>
                        {label}
                      </ConfirmSubmit>
                    ) : (
                      <button type="submit" className={buttonClass(variant, "sm")}>
                        {label}
                      </button>
                    )}
                  </form>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="preview-title" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-5">
            <h2 id="preview-title" className="text-h3 font-bold">
              Pratinjau (versi tersimpan)
            </h2>
            <LessonContent blocks={lesson.blocks} />
            {lesson.references.length > 0 && (
              <div className="border-t border-outline-variant pt-3">
                <p className="text-label font-semibold">Referensi</p>
                <ul className="list-disc pl-5 text-caption text-on-surface-variant">
                  {lesson.references.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
