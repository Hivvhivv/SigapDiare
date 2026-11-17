"use server";

import { revalidatePath } from "next/cache";
import { todayAsDateOnly } from "@/lib/dates";
import type { FormState } from "@/lib/form";
import { logActivity } from "../audit";
import { db } from "../db";
import { requireRespondent } from "../guards";

export async function saveChecklist(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent();
  const submitted = new Set(formData.getAll("item").filter((v): v is string => typeof v === "string"));

  // Hanya item aktif dan terbit yang boleh disimpan.
  const items = await db.checklistItem.findMany({
    where: { active: true, status: "PUBLISHED", id: { in: [...submitted] } },
    select: { id: true },
  });
  const checkedItems = items.map((item) => item.id);
  const date = todayAsDateOnly(user.timezone);

  await db.checklistDay.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, checkedItems },
    update: { checkedItems },
  });
  await logActivity(user.id, "checklist.save");
  revalidatePath("/beranda");
  return { ok: true, message: `Tersimpan. ${checkedItems.length} kebiasaan sehat sudah dilakukan hari ini.` };
}
