import "server-only";
import { Prisma } from "@prisma/client";
import {
  decryptAccessCode,
  encryptAccessCode,
  formatAccessCode,
  generateAccessCode,
  hashAccessCode,
} from "@/lib/auth/access-code";
import { db } from "../db";

export const PRIVACY_POLICY_VERSION = "2026-11";
const MAX_CODE_ATTEMPTS = 5;
const PARTICIPANT_COUNTER = "participant";

export function formatRespondentCode(seq: number) {
  return `R-${String(seq).padStart(4, "0")}`;
}

/** Tabrakan unik (P2002) atau konflik tulis transaksi MongoDB (P2034): aman diulang. */
function isRetryable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034");
}

function newAccessCodeFields() {
  const code = generateAccessCode();
  return {
    accessCodeHash: hashAccessCode(code),
    accessCodeEnc: encryptAccessCode(code),
    accessCodeIssuedAt: new Date(),
  };
}

/** Membuat akun responden + persetujuan + kode responden + kode akses dalam satu transaksi. */
export async function createRespondent(name: string, phoneNumber: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            phoneNumber,
            role: "USER",
            ...newAccessCodeFields(),
            consents: { create: { policyVersion: PRIVACY_POLICY_VERSION } },
          },
          select: { id: true },
        });
        // MongoDB tidak punya autoincrement; nomor urut diambil dari dokumen Counter ($inc atomik).
        const counter = await tx.counter.upsert({
          where: { id: PARTICIPANT_COUNTER },
          create: { id: PARTICIPANT_COUNTER, value: 1 },
          update: { value: { increment: 1 } },
        });
        await tx.participant.create({
          data: { userId: user.id, seq: counter.value, code: formatRespondentCode(counter.value) },
        });
        return user;
      });
    } catch (error) {
      // Tabrakan kode akses sangat jarang; konflik counter mungkin saat pendaftaran bersamaan. Ulangi.
      if (isRetryable(error) && attempt < MAX_CODE_ATTEMPTS) continue;
      throw error;
    }
  }
}

/** Mengganti kode akses responden. Kode lama langsung tidak berlaku. */
export async function regenerateAccessCode(userId: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      await db.user.update({ where: { id: userId }, data: newAccessCodeFields() });
      return;
    } catch (error) {
      if (isRetryable(error) && attempt < MAX_CODE_ATTEMPTS) continue;
      throw error;
    }
  }
}

/** Kode akses yang dapat dibaca (1234-5678). Hanya untuk pemilik akun dan admin. */
export function readableAccessCode(accessCodeEnc: string | null) {
  if (!accessCodeEnc) return null;
  return formatAccessCode(decryptAccessCode(accessCodeEnc));
}
