"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "../audit";
import { db } from "../db";
import { isObjectId, requireAdmin } from "../guards";
import { regenerateAccessCode } from "../services/respondents";
import { revokeAllSessions } from "../session";

async function findRespondent(userId: string) {
  if (!isObjectId(userId)) throw new Error("Responden tidak ditemukan");
  const user = await db.user.findFirst({ where: { id: userId, role: "USER" }, select: { id: true } });
  if (!user) throw new Error("Responden tidak ditemukan");
  return user;
}

export async function regenerateRespondentAccessCode(userId: string) {
  const admin = await requireAdmin();
  const respondent = await findRespondent(userId);
  await regenerateAccessCode(respondent.id);
  await revokeAllSessions(respondent.id);
  await logAudit(admin.id, "access_code.regenerate", respondent.id);
  revalidatePath("/admin/responden");
}

export async function setRespondentBanned(userId: string, banned: boolean) {
  const admin = await requireAdmin();
  const respondent = await findRespondent(userId);
  await db.user.update({ where: { id: respondent.id }, data: { banned } });
  if (banned) await revokeAllSessions(respondent.id);
  await logAudit(admin.id, banned ? "user.ban" : "user.unban", respondent.id);
  revalidatePath("/admin/responden");
}

export async function recordAccessCodeCopy(userId: string) {
  const admin = await requireAdmin();
  const respondent = await findRespondent(userId);
  await logAudit(admin.id, "access_code.copy", respondent.id);
}
