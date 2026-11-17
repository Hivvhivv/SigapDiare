import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

export const MIN_ADMIN_PASSWORD_LENGTH = 12;

// Tanpa karakter yang mirip (0/O, 1/l/I) agar mudah dibaca saat diserahkan ke admin baru.
const TEMP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Password sementara 14 karakter untuk admin baru / reset password. */
export function generateTempPassword(length = 14): string {
  let password = "";
  for (let i = 0; i < length; i++) password += TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)];
  return password;
}

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: n, r, p }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Format: scrypt$N$r$p$salt$hash (base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await derive(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
