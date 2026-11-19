"use server";

import { redirect } from "next/navigation";
import { formString } from "@/lib/form";
import { db } from "../db";
import { isObjectId, requireRespondent } from "../guards";
import { VISIBLE_LESSON } from "../queries/content";

/** Tandai submateri selesai dibaca, lalu lanjut ke submateri berikutnya atau rangkuman materi. */
export async function completeLesson(formData: FormData) {
  const user = await requireRespondent();
  const lessonId = formString(formData, "lessonId");
  if (!isObjectId(lessonId)) redirect("/edukasi");

  const lesson = await db.lesson.findFirst({ where: { ...VISIBLE_LESSON, id: lessonId }, include: { topic: true } });
  if (!lesson || lesson.topic.status !== "PUBLISHED") redirect("/edukasi");

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    create: { userId: user.id, lessonId: lesson.id },
    update: {},
  });

  const next = await db.lesson.findFirst({
    where: { ...VISIBLE_LESSON, topicId: lesson.topicId, order: { gt: lesson.order } },
    orderBy: { order: "asc" },
    select: { slug: true },
  });
  redirect(next ? `/edukasi/${lesson.topic.slug}/${next.slug}` : `/edukasi/${lesson.topic.slug}?selesai=1`);
}
