import "server-only";
import type { Prisma } from "@prisma/client";
import { asLessonBlocks } from "@/lib/content/lesson-body";
import { db } from "../db";

/** Topik "tanda-bahaya" diarahkan ke halaman publik /tanda-bahaya, isinya tidak dikelola di sini. */
export const DANGER_TOPIC_SLUG = "tanda-bahaya";

/**
 * Submateri yang boleh dilihat responden: terbit, dan bila klinis, sudah disetujui peninjau klinis.
 * Syarat kedua adalah lapis pengaman tambahan di luar alur status.
 */
export const VISIBLE_LESSON: Prisma.LessonWhereInput = {
  status: "PUBLISHED",
  OR: [{ kind: "GENERAL" }, { approvedById: { isSet: true, not: null } }],
};

// ── Admin ──────────────────────────────────────────────

export async function listTopicsForAdmin() {
  const topics = await db.topic.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { select: { status: true } } },
  });
  return topics.map(({ lessons, ...topic }) => ({
    ...topic,
    lessonCount: lessons.length,
    publishedCount: lessons.filter((l) => l.status === "PUBLISHED").length,
    inReviewCount: lessons.filter((l) => l.status === "IN_REVIEW").length,
  }));
}

export async function getTopicForAdmin(id: string) {
  return db.topic.findUnique({ where: { id }, include: { lessons: { orderBy: { order: "asc" } } } });
}

export async function getLessonForAdmin(topicId: string, lessonId: string) {
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, topicId }, include: { topic: true } });
  if (!lesson) return null;
  const approver = lesson.approvedById
    ? await db.user.findUnique({ where: { id: lesson.approvedById }, select: { name: true } })
    : null;
  return { ...lesson, blocks: asLessonBlocks(lesson.body), approverName: approver?.name ?? null };
}

/** Jumlah submateri yang menunggu persetujuan, untuk penanda di menu peninjau klinis. */
export async function countLessonsInReview() {
  return db.lesson.count({ where: { status: "IN_REVIEW" } });
}

// ── Responden ──────────────────────────────────────────

export async function listTopicsForReader(userId: string) {
  const [topics, done] = await Promise.all([
    db.topic.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { order: "asc" },
      include: { lessons: { where: VISIBLE_LESSON, select: { id: true } } },
    }),
    db.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } }),
  ]);
  const doneIds = new Set(done.map((p) => p.lessonId));
  return topics.map(({ lessons, ...topic }) => ({
    ...topic,
    lessonCount: lessons.length,
    doneCount: lessons.filter((l) => doneIds.has(l.id)).length,
  }));
}

export async function getTopicForReader(slug: string, userId: string) {
  const topic = await db.topic.findUnique({
    where: { slug },
    include: { lessons: { where: VISIBLE_LESSON, orderBy: { order: "asc" }, select: { id: true, slug: true, title: true } } },
  });
  if (!topic) return null;
  const done = await db.lessonProgress.findMany({
    where: { userId, lessonId: { in: topic.lessons.map((l) => l.id) } },
    select: { lessonId: true },
  });
  const doneIds = new Set(done.map((p) => p.lessonId));
  const nextTopic = await db.topic.findFirst({
    where: { status: "PUBLISHED", order: { gt: topic.order } },
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });
  return {
    ...topic,
    lessons: topic.lessons.map((l) => ({ ...l, done: doneIds.has(l.id) })),
    nextTopic,
  };
}

export async function getLessonForReader(topicSlug: string, lessonSlug: string) {
  const topic = await db.topic.findUnique({
    where: { slug: topicSlug },
    include: { lessons: { where: VISIBLE_LESSON, orderBy: { order: "asc" } } },
  });
  if (!topic || topic.status !== "PUBLISHED") return null;
  const index = topic.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  const lesson = topic.lessons[index];
  const brief = (l: (typeof topic.lessons)[number] | undefined) => (l ? { slug: l.slug, title: l.title } : null);
  return {
    topic: { id: topic.id, slug: topic.slug, title: topic.title },
    lesson: { id: lesson.id, title: lesson.title, kind: lesson.kind, references: lesson.references, blocks: asLessonBlocks(lesson.body) },
    position: index + 1,
    total: topic.lessons.length,
    previous: brief(topic.lessons[index - 1]),
    next: brief(topic.lessons[index + 1]),
  };
}
