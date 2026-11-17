"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateTempPassword, hashPassword, MIN_ADMIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { adminChangeError, isStaff, type AdminChange } from "@/lib/auth/roles";
import { formString, type FormState } from "@/lib/form";
import { logAudit } from "../audit";
import { db } from "../db";
import { isObjectId, requireAdmin, requireSuperAdmin } from "../guards";
import { createSession, revokeAllSessions } from "../session";

const ADMIN_PATH = "/admin/admin";

export type CreatedAdminState = FormState & { created?: { name: string; email: string; tempPassword: string } };

const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 huruf").max(100, "Nama terlalu panjang"),
  email: z.email("Format email tidak valid").transform((v) => v.trim().toLowerCase()),
  role: z.enum(["ADMIN", "SUPER_ADMIN"], { error: "Pilih role" }),
});

/** Super Admin menambah admin. Password sementara ditampilkan sekali dan wajib diganti saat masuk pertama. */
export async function createAdmin(_prev: CreatedAdminState, formData: FormData): Promise<CreatedAdminState> {
  const actor = await requireSuperAdmin();
  const values = { name: formString(formData, "name"), email: formString(formData, "email"), role: formString(formData, "role") };
  const parsed = createAdminSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  if (await db.user.findFirst({ where: { email: parsed.data.email }, select: { id: true } })) {
    return { errors: { email: ["Email ini sudah dipakai akun lain"] }, values };
  }

  const tempPassword = generateTempPassword();
  const admin = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
    },
    select: { id: true },
  });
  await logAudit(actor.id, "admin.create", admin.id, { role: parsed.data.role });
  revalidatePath(ADMIN_PATH);
  return { ok: true, created: { name: parsed.data.name, email: parsed.data.email, tempPassword } };
}

type Result = { ok: true; tempPassword?: string } | { ok: false; message: string };

async function loadTarget(targetId: string) {
  if (!isObjectId(targetId)) return null;
  const target = await db.user.findUnique({ where: { id: targetId }, select: { id: true, role: true, banned: true } });
  return target && isStaff(target.role) ? target : null;
}

async function applyChange(targetId: string, change: AdminChange, action: string): Promise<Result> {
  const actor = await requireSuperAdmin();
  const target = await loadTarget(targetId);
  if (!target) return { ok: false, message: "Akun admin tidak ditemukan." };

  const activeSuperAdmins = await db.user.count({ where: { role: "SUPER_ADMIN", banned: false } });
  const error = adminChangeError({ actorId: actor.id, target, change, activeSuperAdmins });
  if (error) return { ok: false, message: error };

  await db.user.update({ where: { id: target.id }, data: change });
  if (change.banned) await revokeAllSessions(target.id);
  await logAudit(actor.id, action, target.id, change);
  revalidatePath(ADMIN_PATH);
  return { ok: true };
}

export async function setAdminRole(targetId: string, role: "ADMIN" | "SUPER_ADMIN"): Promise<Result> {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return { ok: false, message: "Role tidak valid." };
  return applyChange(targetId, { role }, "admin.role");
}

export async function setAdminBanned(targetId: string, banned: boolean): Promise<Result> {
  return applyChange(targetId, { banned: Boolean(banned) }, banned ? "admin.ban" : "admin.unban");
}

export async function setClinicalReviewer(targetId: string, value: boolean): Promise<Result> {
  const actor = await requireSuperAdmin();
  const target = await loadTarget(targetId);
  if (!target) return { ok: false, message: "Akun admin tidak ditemukan." };
  await db.user.update({ where: { id: target.id }, data: { isClinicalReviewer: Boolean(value) } });
  await logAudit(actor.id, "admin.clinical_reviewer", target.id, { value: Boolean(value) });
  revalidatePath(ADMIN_PATH);
  return { ok: true };
}

/** Reset password admin lain: password sementara baru, sesi lama dicabut. */
export async function resetAdminPassword(targetId: string): Promise<Result> {
  const actor = await requireSuperAdmin();
  const target = await loadTarget(targetId);
  if (!target) return { ok: false, message: "Akun admin tidak ditemukan." };
  if (target.id === actor.id) return { ok: false, message: "Ganti password akun sendiri lewat halaman Akun Saya." };

  const tempPassword = generateTempPassword();
  await db.user.update({
    where: { id: target.id },
    data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true },
  });
  await revokeAllSessions(target.id);
  await logAudit(actor.id, "admin.reset_password", target.id);
  revalidatePath(ADMIN_PATH);
  return { ok: true, tempPassword };
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Isi password saat ini"),
    next: z.string().min(MIN_ADMIN_PASSWORD_LENGTH, `Password baru minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter`).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Konfirmasi password tidak sama" })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Password baru harus berbeda dari yang lama" });

/** Setiap admin mengganti password sendiri. Semua sesi lain dicabut. */
export async function changeOwnPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireAdmin({ allowPasswordChange: true });
  const parsed = changePasswordSchema.safeParse({
    current: formString(formData, "current"),
    next: formString(formData, "next"),
    confirm: formString(formData, "confirm"),
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const account = await db.user.findUniqueOrThrow({ where: { id: actor.id }, select: { passwordHash: true, role: true } });
  if (!account.passwordHash || !(await verifyPassword(parsed.data.current, account.passwordHash))) {
    return { errors: { current: ["Password saat ini salah"] } };
  }

  await db.user.update({
    where: { id: actor.id },
    data: { passwordHash: await hashPassword(parsed.data.next), mustChangePassword: false },
  });
  await revokeAllSessions(actor.id);
  await createSession(actor.id, account.role);
  await logAudit(actor.id, "admin.change_password", actor.id);
  redirect("/admin?password=diganti");
}
