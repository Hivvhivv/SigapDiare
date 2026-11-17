import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { isStaff } from "@/lib/auth/roles";
import { db } from "./db";

// Token acak di cookie HttpOnly; database hanya menyimpan hash SHA-256-nya.
export const SESSION_COOKIE = "sd_session";
const RESPONDENT_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const ACTIVITY_UPDATE_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, role: Role) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (isStaff(role) ? ADMIN_SESSION_MS : RESPONDENT_SESSION_MS));
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  await db.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

/** Pengguna dari cookie sesi, atau null. Hanya field yang aman dipakai di server component. */
export const getSessionUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          phoneNumber: true,
          email: true,
          banned: true,
          isClinicalReviewer: true,
          activeChildId: true,
          timezone: true,
          lastActiveAt: true,
          mustChangePassword: true,
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date() || session.user.banned) return null;

  const { user } = session;
  if (!user.lastActiveAt || Date.now() - user.lastActiveAt.getTime() > ACTIVITY_UPDATE_MS) {
    await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  }
  return user;
});

export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
