"use server";

import type { ContentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { slugify } from "@/lib/content/lesson-body";
import { kindChangeError, nextStatus, statusAfterEdit, type WorkflowAction } from "@/lib/content/workflow";
import { formString, type FormState } from "@/lib/form";
import { parseLessonForm, topicSchema } from "@/lib/validation/content";
import { logAudit } from "../audit";
import { db } from "../db";
import { isObjectId, requireAdmin } from "../guards";
import { DANGER_TOPIC_SLUG, VISIBLE_LESSON } from "../queries/content";

const LIST_PATH = "/admin/edukasi";
const topicPath = (topicId: string) => `${LIST_PATH}/${topicId}`;
const lessonPath = (topicId: string, lessonId: string) => `${topicPath(topicId)}/${lessonId}`;

const WORKFLOW_ACTIONS = ["submit", "return", "approve", "publish", "unpublish", "archive", "restore"] as const;

async function loadTopic(id: string) {
  if (!isObjectId(id)) return null;
  const topic = await db.topic.findUnique({ where: { id } });
  // Topik tanda bahaya hanya diarahkan ke halaman publik; tidak dapat diubah dari sini.
  return topic && topic.slug !== DANGER_TOPIC_SLUG ? topic : null;
}

async function uniqueSlug(title: string, fallback: string, taken: (slug: string) => Promise<boolean>) {
  const base = slugify(title) || fallback;
  let slug = base;
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/** Halaman responden ikut diperbarui setiap kali konten berubah. */
function revalidateReader() {
  revalidatePath("/edukasi", "layout");
}

// ── Materi (topik) ─────────────────────────────────────

export async function saveTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const topicId = formString(formData, "topicId");
  const values = { title: formString(formData, "title"), summary: formString(formData, "summary"), kind: formString(formData, "kind") };
  const parsed = topicSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  if (!topicId) {
    const slug = await uniqueSlug(parsed.data.title, "materi", async (s) => (await db.topic.count({ where: { slug: s } })) > 0);
    const last = await db.topic.findFirst({ orderBy: { order: "desc" } });
    const topic = await db.topic.create({ data: { ...parsed.data, slug, order: (last?.order ?? 0) + 1, status: "DRAFT" } });
    await logAudit(admin.id, "content.topic.create", topic.id);
    redirect(topicPath(topic.id));
  }

  const topic = await loadTopic(topicId);
  if (!topic) return { message: "Materi tidak ditemukan." };
  const kindError = kindChangeError(topic.kind, parsed.data.kind, admin);
  if (kindError) return { errors: { kind: [kindError] }, values };

  await db.topic.update({ where: { id: topic.id }, data: parsed.data });
  await logAudit(admin.id, "content.topic.update", topic.id);
  revalidatePath(topicPath(topic.id));
  revalidateReader();
  return { ok: true, message: "Materi disimpan." };
}

/** Aksi daftar materi: terbitkan, tarik, naik, turun, hapus. */
export async function topicAction(formData: FormData) {
  const admin = await requireAdmin();
  const op = formString(formData, "op");
  const topic = await loadTopic(formString(formData, "topicId"));
  if (!topic) redirect(LIST_PATH);

  if (op === "publish") {
    // Materi tanpa submateri yang terlihat responden tidak diterbitkan (halaman kosong).
    const visible = await db.lesson.count({ where: { ...VISIBLE_LESSON, topicId: topic.id } });
    if (visible === 0) redirect(`${topicPath(topic.id)}?galat=kosong`);
    await db.topic.update({ where: { id: topic.id }, data: { status: "PUBLISHED" } });
  } else if (op === "unpublish") {
    await db.topic.update({ where: { id: topic.id }, data: { status: "DRAFT" } });
  } else if (op === "up" || op === "down") {
    const topics = await db.topic.findMany({ orderBy: { order: "asc" } });
    const index = topics.findIndex((t) => t.id === topic.id);
    const neighbor = topics[op === "up" ? index - 1 : index + 1];
    if (neighbor) {
      await db.$transaction([
        db.topic.update({ where: { id: topic.id }, data: { order: neighbor.order } }),
        db.topic.update({ where: { id: neighbor.id }, data: { order: topic.order } }),
      ]);
    }
  } else if (op === "delete") {
    if ((await db.lesson.count({ where: { topicId: topic.id } })) > 0) redirect(`${topicPath(topic.id)}?galat=berisi`);
    await db.topic.delete({ where: { id: topic.id } });
    await logAudit(admin.id, "content.topic.delete", topic.id);
    revalidateReader();
    redirect(LIST_PATH);
  } else {
    redirect(LIST_PATH);
  }
  await logAudit(admin.id, `content.topic.${op}`, topic.id);
  revalidatePath(LIST_PATH);
  revalidatePath(topicPath(topic.id));
  revalidateReader();
}

// ── Submateri (lesson) ─────────────────────────────────

/** Field persetujuan dikosongkan saat isi berubah atau dikembalikan ke draft. */
const CLEAR_APPROVAL = { approvedById: null, approvedAt: null } satisfies Prisma.LessonUpdateInput;

export async function saveLesson(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const topic = await loadTopic(formString(formData, "topicId"));
  if (!topic) return { message: "Materi tidak ditemukan." };
  const lessonId = formString(formData, "lessonId");

  const values = {
    title: formString(formData, "title"),
    body: formString(formData, "body"),
    references: formString(formData, "references"),
    kind: formString(formData, "kind"),
  };
  const parsed = parseLessonForm(values);
  if (!parsed.ok) return { errors: parsed.errors, message: "Periksa kembali isian submateri.", values };
  const { title, body, references, kind } = parsed.data;

  if (!lessonId) {
    const slug = await uniqueSlug(
      title,
      "bagian",
      async (s) => (await db.lesson.count({ where: { topicId: topic.id, slug: s } })) > 0,
    );
    const last = await db.lesson.findFirst({ where: { topicId: topic.id }, orderBy: { order: "desc" } });
    const lesson = await db.lesson.create({
      data: { topicId: topic.id, slug, title, body, references, kind, order: (last?.order ?? 0) + 1, status: "DRAFT" },
    });
    await logAudit(admin.id, "content.lesson.create", lesson.id);
    revalidatePath(topicPath(topic.id));
    redirect(lessonPath(topic.id, lesson.id));
  }

  if (!isObjectId(lessonId)) return { message: "Submateri tidak ditemukan." };
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, topicId: topic.id } });
  if (!lesson) return { message: "Submateri tidak ditemukan." };
  const kindError = kindChangeError(lesson.kind, kind, admin);
  if (kindError) return { errors: { kind: [kindError] }, values };

  const status = statusAfterEdit(lesson, kind);
  const backToDraft = status === "DRAFT" && lesson.status !== "DRAFT";
  await db.lesson.update({
    where: { id: lesson.id },
    data: { title, body, references, kind, status, ...(backToDraft ? { ...CLEAR_APPROVAL, publishedAt: null } : {}) },
  });
  await logAudit(admin.id, "content.lesson.update", lesson.id, backToDraft ? { from: lesson.status, to: status } : undefined);
  revalidatePath(lessonPath(topic.id, lesson.id));
  revalidatePath(topicPath(topic.id));
  revalidateReader();
  return {
    ok: true,
    message: backToDraft
      ? "Disimpan. Karena isinya berubah, submateri kembali menjadi Draft dan perlu ditinjau/diterbitkan ulang."
      : "Submateri disimpan.",
  };
}

/** Pindah status sesuai alur persetujuan (lihat src/lib/content/workflow.ts). */
export async function lessonWorkflow(formData: FormData) {
  const admin = await requireAdmin();
  const topicId = formString(formData, "topicId");
  const lessonId = formString(formData, "lessonId");
  const op = formString(formData, "op");
  if (!isObjectId(topicId) || !isObjectId(lessonId)) redirect(LIST_PATH);
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, topicId } });
  if (!lesson || !(WORKFLOW_ACTIONS as readonly string[]).includes(op)) redirect(LIST_PATH);

  const action = op as WorkflowAction;
  const status: ContentStatus | null = nextStatus(action, lesson, admin);
  if (!status) redirect(`${lessonPath(topicId, lessonId)}?galat=status`);
  // Lapis pengaman: konten klinis tidak pernah terbit tanpa persetujuan tercatat.
  if (status === "PUBLISHED" && lesson.kind === "CLINICAL" && !lesson.approvedById) {
    redirect(`${lessonPath(topicId, lessonId)}?galat=status`);
  }

  const data: Prisma.LessonUpdateInput = { status };
  if (action === "approve") Object.assign(data, { approvedById: admin.id, approvedAt: new Date() });
  if (action === "return" || action === "restore") Object.assign(data, CLEAR_APPROVAL);
  if (status === "PUBLISHED") data.publishedAt = new Date();

  await db.lesson.update({ where: { id: lesson.id }, data });
  await logAudit(admin.id, `content.lesson.${action}`, lesson.id, { from: lesson.status, to: status });
  revalidatePath(lessonPath(topicId, lessonId));
  revalidatePath(topicPath(topicId));
  revalidatePath(LIST_PATH);
  revalidateReader();
}

/** Aksi daftar submateri: naik, turun, hapus. */
export async function lessonListAction(formData: FormData) {
  const admin = await requireAdmin();
  const topic = await loadTopic(formString(formData, "topicId"));
  if (!topic) redirect(LIST_PATH);
  const lessonId = formString(formData, "lessonId");
  const op = formString(formData, "op");

  const lessons = await db.lesson.findMany({ where: { topicId: topic.id }, orderBy: { order: "asc" } });
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) redirect(topicPath(topic.id));
  const lesson = lessons[index];

  if (op === "delete") {
    await db.lesson.delete({ where: { id: lesson.id } });
  } else if (op === "up" || op === "down") {
    const neighbor = lessons[op === "up" ? index - 1 : index + 1];
    if (neighbor) {
      await db.$transaction([
        db.lesson.update({ where: { id: lesson.id }, data: { order: neighbor.order } }),
        db.lesson.update({ where: { id: neighbor.id }, data: { order: lesson.order } }),
      ]);
    }
  } else {
    redirect(topicPath(topic.id));
  }
  await logAudit(admin.id, `content.lesson.${op}`, lesson.id);
  revalidatePath(topicPath(topic.id));
  revalidateReader();
  if (op === "delete") redirect(topicPath(topic.id));
}
