"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formString, type FormState } from "@/lib/form";
import { localDateString } from "@/lib/dates";
import { detectDangerSigns } from "@/lib/safety/danger-signs";
import { parseCareLog, parseCarePlan, parseTrackerEntry, toDangerInput } from "@/lib/validation/tracker";
import { logActivity } from "../audit";
import { db } from "../db";
import { requireChildOwnership, requireRespondent } from "../guards";
import { getActiveEpisode, getOwnEntry } from "../queries/tracker";

const TRACKER_PATH = "/fitur/pelacak";

function reader(formData: FormData) {
  return (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : null;
  };
}

/** Isian terakhir agar tidak hilang saat React me-reset form setelah action. */
function sentValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter((e): e is [string, string] => typeof e[1] === "string" && !e[0].startsWith("$")),
  );
}

async function activeChildOf(userId: string, activeChildId: string | null) {
  if (!activeChildId) redirect("/onboarding/anak");
  return requireChildOwnership(userId, activeChildId);
}

/**
 * Simpan (buat/ubah) catatan. Tanda bahaya dihitung di server lalu disimpan sebagai dangerFlags;
 * halaman tujuan menampilkan DangerAlert. Tidak ada label diagnosis (CLAUDE.md aturan 1).
 */
export async function saveTrackerEntry(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent();
  const parsed = parseTrackerEntry(reader(formData), new Date());
  if (!parsed.ok) return { errors: parsed.errors, values: sentValues(formData), message: "Periksa lagi isian yang ditandai." };

  const signs = detectDangerSigns(toDangerInput(parsed.data));
  const entryId = formString(formData, "entryId");
  let savedId: string;

  if (entryId) {
    const existing = await getOwnEntry(user.id, entryId);
    if (!existing) return { message: "Catatan tidak ditemukan." };
    await db.trackerEntry.update({ where: { id: existing.id }, data: { ...parsed.data, dangerFlags: signs } });
    savedId = existing.id;
  } else {
    const child = await activeChildOf(user.id, user.activeChildId);
    const episode = await getActiveEpisode(child.id);
    const created = await db.trackerEntry.create({
      data: { ...parsed.data, childId: child.id, episodeId: episode?.id ?? null, dangerFlags: signs },
      select: { id: true },
    });
    savedId = created.id;
  }

  await logActivity(user.id, "tracker.save", savedId);
  if (signs.length > 0) await logActivity(user.id, "danger.alert_shown", savedId);
  revalidatePath("/beranda");
  redirect(`${TRACKER_PATH}?tersimpan=${savedId}`);
}

export async function deleteTrackerEntry(formData: FormData) {
  const user = await requireRespondent();
  const entry = await getOwnEntry(user.id, formString(formData, "entryId"));
  if (entry) {
    await db.trackerEntry.delete({ where: { id: entry.id } });
    await logActivity(user.id, "tracker.delete", entry.id);
  }
  revalidatePath("/beranda");
  redirect(`${TRACKER_PATH}?dihapus=1`);
}

export async function startEpisode() {
  const user = await requireRespondent();
  const child = await activeChildOf(user.id, user.activeChildId);
  if (!(await getActiveEpisode(child.id))) {
    await db.diarrheaEpisode.create({ data: { childId: child.id, startedAt: new Date() } });
    await logActivity(user.id, "episode.start");
  }
  revalidatePath("/beranda");
  redirect(TRACKER_PATH);
}

export async function endEpisode() {
  const user = await requireRespondent();
  const child = await activeChildOf(user.id, user.activeChildId);
  const episode = await getActiveEpisode(child.id);
  if (episode) {
    await db.diarrheaEpisode.update({ where: { id: episode.id }, data: { endedAt: new Date() } });
    await logActivity(user.id, "episode.end", episode.id);
  }
  revalidatePath("/beranda");
  redirect(`${TRACKER_PATH}?pulih=1`);
}

/** Rencana dari tenaga kesehatan, diisi orang tua. Sistem tidak menentukan takaran. */
export async function saveCarePlan(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent();
  const child = await activeChildOf(user.id, user.activeChildId);
  const episode = await getActiveEpisode(child.id);
  if (!episode) return { message: "Mulai pemantauan diare terlebih dahulu." };

  const parsed = parseCarePlan(reader(formData));
  if (!parsed.ok) return { errors: parsed.errors, values: sentValues(formData) };
  await db.diarrheaEpisode.update({ where: { id: episode.id }, data: parsed.data });
  revalidatePath("/beranda");
  redirect(`${TRACKER_PATH}?rencana=1`);
}

export async function addCareLog(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent();
  const child = await activeChildOf(user.id, user.activeChildId);
  const episode = await getActiveEpisode(child.id);
  if (!episode) return { message: "Mulai pemantauan diare terlebih dahulu." };

  const parsed = parseCareLog(reader(formData), new Date());
  if (!parsed.ok) return { errors: parsed.errors, values: sentValues(formData) };
  await db.careLog.create({ data: { ...parsed.data, episodeId: episode.id } });
  revalidatePath(TRACKER_PATH);
  revalidatePath("/beranda");
  return { ok: true, message: `${parsed.data.amountMl} ml ${parsed.data.type === "ORALIT" ? "oralit" : "cairan"} tercatat.` };
}

/** Tandai zinc sudah diberikan hari ini (sesuai anjuran tenaga kesehatan). Satu kali per hari. */
export async function markZincToday() {
  const user = await requireRespondent();
  const child = await activeChildOf(user.id, user.activeChildId);
  const episode = await getActiveEpisode(child.id);
  if (episode) {
    const today = localDateString(new Date(), user.timezone);
    const logs = await db.careLog.findMany({ where: { episodeId: episode.id, type: "ZINC" }, select: { givenAt: true } });
    if (!logs.some((l) => localDateString(l.givenAt, user.timezone) === today)) {
      await db.careLog.create({ data: { episodeId: episode.id, type: "ZINC", givenAt: new Date() } });
    }
  }
  revalidatePath(TRACKER_PATH);
  revalidatePath("/beranda");
}
