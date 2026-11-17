"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashAccessCode, normalizeAccessCode } from "@/lib/auth/access-code";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { formString, safeNextPath, type FormState } from "@/lib/form";
import { normalizeIndonesianPhone } from "@/lib/phone";
import { db } from "../db";
import { clearAttempts, clientIp, HOUR, isRateLimited, MINUTE, recordAttempt } from "../rate-limit";
import { createRespondent } from "../services/respondents";
import { createSession, deleteCurrentSession } from "../session";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 huruf").max(100, "Nama terlalu panjang"),
  phone: z.string().trim().min(1, "Nomor HP wajib diisi"),
  consent: z.literal("on", { error: "Centang persetujuan kebijakan privasi untuk melanjutkan" }),
});

export async function registerRespondent(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { name: formString(formData, "name"), phone: formString(formData, "phone") };
  const parsed = registerSchema.safeParse({ ...values, consent: formData.get("consent") ?? undefined });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const phoneNumber = normalizeIndonesianPhone(parsed.data.phone);
  if (!phoneNumber) {
    return { errors: { phone: ["Format nomor HP tidak valid. Contoh: 081234567890"] }, values };
  }

  const limitKey = `register:${await clientIp()}`;
  if (isRateLimited(limitKey, 10)) {
    return { message: "Terlalu banyak pendaftaran dari perangkat ini. Coba lagi nanti.", values };
  }
  recordAttempt(limitKey, HOUR);

  const existing = await db.user.findFirst({ where: { phoneNumber }, select: { id: true } });
  if (existing) {
    return {
      errors: {
        phone: ["Nomor HP ini sudah terdaftar. Silakan masuk dengan kode akses, atau hubungi admin bila lupa kode."],
      },
      values,
    };
  }

  const user = await createRespondent(parsed.data.name, phoneNumber);
  await createSession(user.id, "USER");
  redirect("/daftar/berhasil");
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW = 15 * MINUTE;

export async function loginWithAccessCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = formString(formData, "code");
  const values = { code: input };
  const limitKey = `login-code:${await clientIp()}`;
  if (isRateLimited(limitKey, LOGIN_LIMIT)) {
    return { message: "Terlalu banyak percobaan. Tunggu 15 menit, lalu coba lagi.", values };
  }

  const code = normalizeAccessCode(input);
  if (!code) {
    return { errors: { code: ["Kode akses terdiri dari 8 angka, contoh 1234-5678."] }, values };
  }

  const user = await db.user.findFirst({
    where: { accessCodeHash: hashAccessCode(code) },
    select: { id: true, role: true, banned: true, activeChildId: true },
  });
  if (!user || user.role !== "USER") {
    recordAttempt(limitKey, LOGIN_WINDOW);
    return { errors: { code: ["Kode akses tidak ditemukan. Periksa kembali atau gunakan Lupa kode akses."] }, values };
  }
  if (user.banned) {
    return { message: "Akun ini sedang dinonaktifkan. Hubungi admin SIGAP DIARE.", values };
  }

  clearAttempts(limitKey);
  await createSession(user.id, "USER");
  redirect(safeNextPath(formString(formData, "next")) ?? (user.activeChildId ? "/beranda" : "/onboarding/anak"));
}

const adminLoginSchema = z.object({
  email: z.email("Format email tidak valid").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password wajib diisi"),
});

// Hash palsu agar waktu respons sama saat email tidak terdaftar.
const dummyHash = hashPassword("sigap-diare-dummy-password");

export async function loginAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: formString(formData, "email") };
  const parsed = adminLoginSchema.safeParse({ email: values.email, password: formString(formData, "password") });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const ip = await clientIp();
  const keys = [`login-admin:${ip}`, `login-admin:${parsed.data.email}`];
  if (keys.some((key) => isRateLimited(key, LOGIN_LIMIT))) {
    return { message: "Terlalu banyak percobaan. Tunggu 15 menit, lalu coba lagi.", values };
  }

  const user = await db.user.findFirst({
    where: { email: parsed.data.email },
    select: { id: true, role: true, banned: true, passwordHash: true },
  });
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await dummyHash));
  if (!user || !valid || user.role !== "ADMIN" || user.banned) {
    keys.forEach((key) => recordAttempt(key, LOGIN_WINDOW));
    return { message: "Email atau password salah.", values };
  }

  keys.forEach(clearAttempts);
  await createSession(user.id, "ADMIN");
  redirect("/admin");
}

export async function logout() {
  await deleteCurrentSession();
  redirect("/");
}

export async function logoutAdmin() {
  await deleteCurrentSession();
  redirect("/admin/masuk");
}
