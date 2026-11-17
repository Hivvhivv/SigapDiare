import "server-only";
import { notFound, redirect } from "next/navigation";
import { canManageAdmins, isStaff } from "@/lib/auth/roles";
import { db } from "./db";
import { getSessionUser } from "./session";

/** Responden yang sudah masuk. Admin/Super Admin diarahkan ke panel admin. */
export async function requireRespondent(options: { allowNoChild?: boolean } = {}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (isStaff(user.role)) redirect("/admin");
  if (!options.allowNoChild && !user.activeChildId) redirect("/onboarding/anak");
  return user;
}

export const CHANGE_PASSWORD_PATH = "/admin/akun";

/**
 * Admin atau Super Admin. Admin dengan password sementara diarahkan ke halaman ganti password,
 * kecuali halaman itu sendiri (`allowPasswordChange`).
 */
export async function requireAdmin(options: { allowPasswordChange?: boolean } = {}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/masuk");
  if (!isStaff(user.role)) notFound();
  if (user.mustChangePassword && !options.allowPasswordChange) redirect(CHANGE_PASSWORD_PATH);
  return user;
}

/** Hanya Super Admin (kelola akun admin). */
export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (!canManageAdmins(user.role)) notFound();
  return user;
}

/** Id MongoDB yang valid. Id lain membuat Prisma melempar error, jadi cek dulu id dari request. */
export function isObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

/** Profil anak milik pengguna. Jangan pernah percaya childId dari request tanpa cek ini. */
export async function requireChildOwnership(userId: string, childId: string) {
  if (!isObjectId(childId)) notFound();
  const child = await db.childProfile.findFirst({ where: { id: childId, userId } });
  if (!child) notFound();
  return child;
}
