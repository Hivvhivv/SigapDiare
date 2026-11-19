import "server-only";
import { localDateString } from "@/lib/dates";
import { DANGER_SIGNS, type DangerSign } from "@/lib/safety/danger-signs";
import { db } from "../db";
import { isObjectId } from "../guards";
import type { SessionUser } from "../session";
import { getActiveChild } from "./home";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 30;
const CHART_DAYS = 7;

export function asDangerSigns(flags: string[]): DangerSign[] {
  return flags.filter((f): f is DangerSign => (DANGER_SIGNS as readonly string[]).includes(f));
}

/** Episode diare yang sedang berjalan untuk seorang anak. */
export async function getActiveEpisode(childId: string) {
  return db.diarrheaEpisode.findFirst({
    // MongoDB: endedAt bisa null ATAU belum ada.
    where: { childId, OR: [{ endedAt: null }, { endedAt: { isSet: false } }] },
    orderBy: { startedAt: "desc" },
  });
}

/** Catatan milik pengguna (lewat anaknya). null bila bukan miliknya. */
export async function getOwnEntry(userId: string, entryId: string) {
  if (!isObjectId(entryId)) return null;
  return db.trackerEntry.findFirst({ where: { id: entryId, child: { userId } } });
}

export async function getTrackerOverview(user: SessionUser) {
  const child = await getActiveChild(user);
  if (!child) return null;
  const tz = user.timezone;
  const now = new Date();
  const todayKey = localDateString(now, tz);

  const [episode, entries] = await Promise.all([
    getActiveEpisode(child.id),
    db.trackerEntry.findMany({
      where: { childId: child.id, recordedAt: { gte: new Date(now.getTime() - HISTORY_DAYS * DAY_MS) } },
      orderBy: { recordedAt: "desc" },
      take: 100,
    }),
  ]);
  const careLogs = episode
    ? await db.careLog.findMany({ where: { episodeId: episode.id }, orderBy: { givenAt: "desc" } })
    : [];

  const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: tz });
  const dayOfMonth = new Intl.DateTimeFormat("id-ID", { day: "numeric", timeZone: tz });
  const chart = Array.from({ length: CHART_DAYS }, (_, i) => {
    const day = new Date(now.getTime() - (CHART_DAYS - 1 - i) * DAY_MS);
    const key = localDateString(day, tz);
    const total = entries.filter((e) => localDateString(e.recordedAt, tz) === key).reduce((sum, e) => sum + e.stoolCount, 0);
    return { key, label: `${weekday.format(day)} ${dayOfMonth.format(day)}`, total, isToday: key === todayKey };
  });

  const todayLogs = careLogs.filter((log) => localDateString(log.givenAt, tz) === todayKey);
  const zincDays = new Set(careLogs.filter((l) => l.type === "ZINC").map((l) => localDateString(l.givenAt, tz)));

  return {
    child,
    episode: episode && {
      id: episode.id,
      startedAt: episode.startedAt,
      dayNumber: Math.floor((now.getTime() - episode.startedAt.getTime()) / DAY_MS) + 1,
      zincDays: episode.zincDays ?? null,
      fluidTargetMl: episode.fluidTargetMl ?? null,
      instructionNote: episode.instructionNote ?? null,
      zincDaysGiven: zincDays.size,
      zincGivenToday: zincDays.has(todayKey),
      fluidTodayMl: todayLogs.filter((l) => l.type !== "ZINC").reduce((sum, l) => sum + (l.amountMl ?? 0), 0),
      todayLogs: todayLogs.map((l) => ({ id: l.id, type: l.type, amountMl: l.amountMl ?? null, givenAt: l.givenAt })),
    },
    entries: entries.map((e) => ({
      id: e.id,
      recordedAt: e.recordedAt,
      dayKey: localDateString(e.recordedAt, tz),
      stoolCount: e.stoolCount,
      consistency: e.consistency,
      bloodInStool: e.bloodInStool ?? null,
      vomitCount: e.vomitCount ?? null,
      drinkingAbility: e.drinkingAbility ?? null,
      generalCondition: e.generalCondition ?? null,
      notes: e.notes ?? null,
      dangerSigns: asDangerSigns(e.dangerFlags),
    })),
    chart,
  };
}
