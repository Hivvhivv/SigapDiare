import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export async function logAudit(actorId: string, action: string, target: string, meta?: Prisma.InputJsonValue) {
  await db.auditLog.create({ data: { actorId, action, target, meta } });
}

export async function logActivity(userId: string | null, type: string, refId?: string) {
  await db.activityEvent.create({ data: { userId, type, refId } });
}
