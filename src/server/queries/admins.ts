import "server-only";
import { db } from "../db";

/** Akun admin & super admin untuk halaman Kelola Admin (tanpa hash password). */
export async function listAdmins() {
  const admins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      isClinicalReviewer: true,
      mustChangePassword: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });
  return admins.map((a) => ({ ...a, mustChangePassword: a.mustChangePassword ?? false }));
}

export type AdminRow = Awaited<ReturnType<typeof listAdmins>>[number];
