"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ageInMonths, dateOnlyToUtc, todayAsDateOnly } from "@/lib/dates";
import { formString, type FormState } from "@/lib/form";
import { db } from "../db";
import { requireChildOwnership, requireRespondent } from "../guards";

const MAX_AGE_MONTHS = 59;

const childSchema = z.object({
  nickname: z.string().trim().min(1, "Nama panggilan wajib diisi").max(40, "Nama panggilan terlalu panjang"),
  birthDate: z.iso.date("Tanggal lahir wajib diisi"),
  sex: z.enum(["MALE", "FEMALE"], { error: "Pilih jenis kelamin" }),
  weightKg: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 1 && v <= 40), "Berat badan antara 1 dan 40 kg"),
});

export async function createChild(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent({ allowNoChild: true });
  const values = {
    nickname: formString(formData, "nickname"),
    birthDate: formString(formData, "birthDate"),
    sex: formString(formData, "sex"),
    weightKg: formString(formData, "weightKg"),
  };
  const parsed = childSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const birthDate = dateOnlyToUtc(parsed.data.birthDate);
  const today = todayAsDateOnly(user.timezone);
  if (birthDate > today) {
    return { errors: { birthDate: ["Tanggal lahir tidak boleh di masa depan"] }, values };
  }
  if (ageInMonths(birthDate, today) > MAX_AGE_MONTHS) {
    return { errors: { birthDate: ["SIGAP DIARE ditujukan untuk anak usia 0–59 bulan (balita)"] }, values };
  }

  const child = await db.childProfile.create({
    data: {
      userId: user.id,
      nickname: parsed.data.nickname,
      birthDate,
      sex: parsed.data.sex,
      weightKg: parsed.data.weightKg,
    },
    select: { id: true },
  });
  await db.user.update({ where: { id: user.id }, data: { activeChildId: child.id } });
  redirect("/beranda");
}

export async function setActiveChild(formData: FormData) {
  const user = await requireRespondent({ allowNoChild: true });
  const child = await requireChildOwnership(user.id, formString(formData, "childId"));
  await db.user.update({ where: { id: user.id }, data: { activeChildId: child.id } });
  revalidatePath("/", "layout");
  redirect("/beranda");
}
