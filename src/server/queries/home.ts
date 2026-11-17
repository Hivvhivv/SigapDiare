import "server-only";
import { ageInMonths, localDateString, todayAsDateOnly } from "@/lib/dates";
import { timeGreeting } from "@/lib/friendly";
import { DANGER_SIGNS, type DangerSign } from "@/lib/safety/danger-signs";
import { db } from "../db";
import type { SessionUser } from "../session";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getActiveChild(user: SessionUser) {
  if (!user.activeChildId) return null;
  return db.childProfile.findFirst({ where: { id: user.activeChildId, userId: user.id } });
}

export async function getHomeData(user: SessionUser) {
  const today = todayAsDateOnly(user.timezone);
  const child = await getActiveChild(user);
  if (!child) return null;

  const [lastEntry, episode] = await Promise.all([
    db.trackerEntry.findFirst({ where: { childId: child.id }, orderBy: { recordedAt: "desc" } }),
    db.diarrheaEpisode.findFirst({
      // MongoDB: field opsional bisa null ATAU belum ada; `endedAt: null` saja tidak cocok dengan yang belum ada.
      where: { childId: child.id, OR: [{ endedAt: null }, { endedAt: { isSet: false } }] },
      orderBy: { startedAt: "desc" },
      include: { careLogs: { orderBy: { givenAt: "desc" } } },
    }),
  ]);

  const [checklistItems, checklistDay, openInstrument] = await Promise.all([
    db.checklistItem.findMany({
      where: { active: true, status: "PUBLISHED", scope: episode ? undefined : "PREVENTION" },
      orderBy: [{ scope: "asc" }, { order: "asc" }],
      select: { id: true, label: true },
    }),
    db.checklistDay.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    db.evalInstrument.findFirst({
      where: {
        opensAt: { lte: new Date() },
        OR: [{ closesAt: null }, { closesAt: { isSet: false } }, { closesAt: { gt: new Date() } }],
        // MongoDB: `{ not: null }` juga cocok dengan field yang belum ada, jadi wajib `isSet: true`.
        attempts: { none: { participant: { userId: user.id }, submittedAt: { isSet: true, not: null } } },
      },
      orderBy: { phase: "asc" },
      select: { id: true, phase: true },
    }),
  ]);

  return {
    child: {
      ...child,
      ageMonths: ageInMonths(child.birthDate, today),
    },
    lastEntry: lastEntry && {
      recordedAt: lastEntry.recordedAt,
      stoolCount: lastEntry.stoolCount,
      consistency: lastEntry.consistency,
      dangerSigns: lastEntry.dangerFlags.filter((f): f is DangerSign => (DANGER_SIGNS as readonly string[]).includes(f)),
    },
    episode: episode && summarizeEpisode(episode, user.timezone),
    checklist: {
      items: checklistItems,
      checked: checklistDay?.checkedItems ?? [],
    },
    openInstrument,
    greeting: timeGreeting(new Date(), user.timezone),
  };
}

type EpisodeWithLogs = NonNullable<Awaited<ReturnType<typeof db.diarrheaEpisode.findFirst>>> & {
  careLogs: { type: "ORALIT" | "FLUID" | "ZINC"; amountMl: number | null; givenAt: Date }[];
};

/** Hanya merangkum data yang dicatat ibu. Tidak ada label status klinis (CLAUDE.md aturan 1). */
function summarizeEpisode(episode: EpisodeWithLogs, timeZone: string) {
  const todayStr = localDateString(new Date(), timeZone);
  const todayLogs = episode.careLogs.filter((log) => localDateString(log.givenAt, timeZone) === todayStr);
  const fluidTodayMl = todayLogs
    .filter((log) => log.type !== "ZINC")
    .reduce((sum, log) => sum + (log.amountMl ?? 0), 0);
  const zincDays = new Set(
    episode.careLogs.filter((log) => log.type === "ZINC").map((log) => localDateString(log.givenAt, timeZone)),
  );
  const lastOralit = episode.careLogs.find((log) => log.type === "ORALIT") ?? null;

  return {
    dayNumber: Math.floor((Date.now() - episode.startedAt.getTime()) / DAY_MS) + 1,
    fluidTodayMl,
    fluidLogCountToday: todayLogs.filter((log) => log.type !== "ZINC").length,
    fluidTargetMl: episode.fluidTargetMl,
    zincDaysGiven: zincDays.size,
    zincGivenToday: zincDays.has(todayStr),
    zincPlannedDays: episode.zincDays,
    lastOralit: lastOralit && { givenAt: lastOralit.givenAt, amountMl: lastOralit.amountMl },
  };
}
