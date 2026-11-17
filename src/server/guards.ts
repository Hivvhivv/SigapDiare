import "server-only";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { getSessionUser } from "./session";

/** Responden yang sudah masuk. Admin diarahkan ke panel admin. */
export async function requireRespondent(options: { allowNoChild?: boolean } = {}) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk");
  if (user.role === "ADMIN") redirect("/admin");
  if (!options.allowNoChild && !user.activeChildId) redirect("/onboarding/anak");
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/masuk");
  if (user.role !== "ADMIN") notFound();
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
