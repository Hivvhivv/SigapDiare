import "server-only";
import { db } from "../db";

const DAY_MS = 24 * 60 * 60 * 1000;
// MongoDB: `{ not: null }` juga cocok dengan field yang belum ada, jadi wajib `isSet: true`.
const SUBMITTED = { isSet: true, not: null } as const;

/** Statistik agregat untuk dashboard admin. Tidak memuat data pribadi. */
export async function getDashboardStats() {
  const weekAgo = new Date(Date.now() - 7 * DAY_MS);
  const monthAgo = new Date(Date.now() - 30 * DAY_MS);

  const [respondents, children, active7, active30, lessonViews, pretestDone, posttestDone] = await Promise.all([
    db.user.count({ where: { role: "USER" } }),
    db.childProfile.count(),
    db.user.count({ where: { role: "USER", lastActiveAt: { gte: weekAgo } } }),
    db.user.count({ where: { role: "USER", lastActiveAt: { gte: monthAgo } } }),
    db.activityEvent.count({ where: { type: "lesson.view" } }),
    db.evalAttempt.count({ where: { submittedAt: SUBMITTED, instrument: { phase: "PRETEST" } } }),
    db.evalAttempt.count({ where: { submittedAt: SUBMITTED, instrument: { phase: "POSTTEST" } } }),
  ]);

  return [
    { label: "Akun responden", value: respondents },
    { label: "Profil anak", value: children },
    { label: "Aktif 7 hari terakhir", value: active7 },
    { label: "Aktif 30 hari terakhir", value: active30 },
    { label: "Akses materi edukasi", value: lessonViews },
    { label: "Pretest selesai", value: pretestDone },
    { label: "Posttest selesai", value: posttestDone },
  ];
}
