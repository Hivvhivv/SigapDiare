import "server-only";
import { db } from "../db";

/**
 * Hapus akun responden (AUTH-10). Relasi `onDelete` di schema menghapus sesi, persetujuan, profil anak
 * (beserta catatan diare, episode, catatan pemberian), checklist, pengingat, langganan push, dan progres
 * baca. `Participant.userId` menjadi null: jawaban kuis tetap tersimpan dengan kode responden saja,
 * sesuai persetujuan penelitian (PRD §privasi, ARCHITECTURE §8).
 *
 * Penghapusan harus lewat Prisma (cascade diemulasikan Prisma, bukan oleh MongoDB).
 */
export async function deleteRespondentAccount(userId: string) {
  await db.$transaction([
    // ActivityEvent tidak berelasi ke User; diputus agar statistik penggunaan tetap ada tanpa identitas.
    db.activityEvent.updateMany({ where: { userId }, data: { userId: null } }),
    db.user.delete({ where: { id: userId } }),
  ]);
}
