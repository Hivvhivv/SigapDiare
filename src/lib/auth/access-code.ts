import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
} from "node:crypto";

// 8 angka acak (10⁸ kombinasi): mudah diketik ibu di keyboard angka HP.
// Perlindungan dari tebakan beruntun bergantung pada rate limit login (src/server/actions/auth.ts).
export const ACCESS_CODE_ALPHABET = "0123456789";
export const ACCESS_CODE_LENGTH = 8;

export function generateAccessCode(): string {
  let code = "";
  for (let i = 0; i < ACCESS_CODE_LENGTH; i++) {
    code += ACCESS_CODE_ALPHABET[randomInt(ACCESS_CODE_ALPHABET.length)];
  }
  return code;
}

/** Tanpa spasi/tanda hubung. Mengembalikan null bila bukan 8 angka. */
export function normalizeAccessCode(input: string): string | null {
  const cleaned = input.replace(/[\s-]/g, "");
  if (cleaned.length !== ACCESS_CODE_LENGTH) return null;
  for (const ch of cleaned) {
    if (!ACCESS_CODE_ALPHABET.includes(ch)) return null;
  }
  return cleaned;
}

/** 12345678 → 1234-5678 */
export function formatAccessCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function readKey(name: "ACCESS_CODE_PEPPER" | "ACCESS_CODE_ENC_KEY"): Buffer {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diatur di .env`);
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error(`${name} harus 32 byte (base64)`);
  return key;
}

/** HMAC-SHA256 untuk pencarian saat login. Deterministik, tidak dapat dibalik. */
export function hashAccessCode(code: string, pepper = readKey("ACCESS_CODE_PEPPER")): string {
  return createHmac("sha256", pepper).update(code).digest("hex");
}

/** AES-256-GCM agar kode dapat ditampilkan ke pemilik dan admin tanpa menyimpan teks asli. */
export function encryptAccessCode(code: string, key = readKey("ACCESS_CODE_ENC_KEY")): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), data.toString("base64url")].join(".");
}

export function decryptAccessCode(payload: string, key = readKey("ACCESS_CODE_ENC_KEY")): string {
  const [version, iv, tag, data] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !data) {
    throw new Error("Format kode akses terenkripsi tidak dikenal");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
