import "server-only";
import { hashAccessCode, normalizeAccessCode } from "@/lib/auth/access-code";
import { normalizeIndonesianPhone } from "@/lib/phone";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { readableAccessCode } from "../services/respondents";

export type EvalStatus = "Belum" | "Sedang" | "Selesai";

/** Daftar responden untuk admin. Kode akses didekripsi di server; skor tidak ikut ditampilkan. */
export async function listRespondents(query: string) {
  const q = query.trim();
  const or: Prisma.UserWhereInput[] = [];
  if (q) {
    or.push({ name: { contains: q, mode: "insensitive" } });
    or.push({ participants: { some: { code: { contains: q, mode: "insensitive" } } } });
    const phone = normalizeIndonesianPhone(q);
    if (phone) or.push({ phoneNumber: phone });
    else if (/^\d{4,}$/.test(q)) or.push({ phoneNumber: { contains: q.replace(/^0/, "") } });
    const code = normalizeAccessCode(q);
    if (code) or.push({ accessCodeHash: hashAccessCode(code) });
  }

  const users = await db.user.findMany({
    where: { role: "USER", ...(or.length ? { OR: or } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      accessCodeEnc: true,
      banned: true,
      createdAt: true,
      lastActiveAt: true,
      _count: { select: { children: true } },
      participants: {
        take: 1,
        select: {
          code: true,
          attempts: { select: { submittedAt: true, instrument: { select: { phase: true } } } },
        },
      },
    },
  });

  return users.map((user) => {
    const participant = user.participants[0];
    const attempts = participant?.attempts ?? [];
    const status = (phase: "PRETEST" | "POSTTEST"): EvalStatus => {
      const attempt = attempts.find((a) => a.instrument.phase === phase);
      if (!attempt) return "Belum";
      return attempt.submittedAt ? "Selesai" : "Sedang";
    };
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      accessCode: readableAccessCode(user.accessCodeEnc),
      respondentCode: participant?.code ?? null,
      banned: user.banned,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      childCount: user._count.children,
      pretest: status("PRETEST"),
      posttest: status("POSTTEST"),
    };
  });
}

export type RespondentRow = Awaited<ReturnType<typeof listRespondents>>[number];
