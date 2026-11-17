import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ACCESS_CODE_ALPHABET,
  decryptAccessCode,
  encryptAccessCode,
  formatAccessCode,
  generateAccessCode,
  hashAccessCode,
  normalizeAccessCode,
} from "./access-code";

const key = randomBytes(32);

describe("generateAccessCode", () => {
  it("menghasilkan 8 angka", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateAccessCode();
      expect(code).toMatch(/^\d{8}$/);
      for (const ch of code) expect(ACCESS_CODE_ALPHABET).toContain(ch);
    }
  });

  it("boleh diawali angka 0 (tetap 8 digit)", () => {
    const codes = Array.from({ length: 2000 }, generateAccessCode);
    expect(codes.every((c) => c.length === 8)).toBe(true);
    expect(codes.some((c) => c.startsWith("0"))).toBe(true);
  });
});

describe("normalizeAccessCode", () => {
  it("menerima spasi dan tanda hubung", () => {
    expect(normalizeAccessCode("1234-5678")).toBe("12345678");
    expect(normalizeAccessCode(" 1234 5678 ")).toBe("12345678");
    expect(normalizeAccessCode("01234567")).toBe("01234567");
  });

  it("menolak panjang yang salah atau huruf", () => {
    expect(normalizeAccessCode("1234567")).toBeNull();
    expect(normalizeAccessCode("123456789")).toBeNull();
    expect(normalizeAccessCode("1234567A")).toBeNull();
    expect(normalizeAccessCode("K7MQ-4XPA")).toBeNull();
    expect(normalizeAccessCode("")).toBeNull();
  });
});

describe("formatAccessCode", () => {
  it("memisahkan menjadi dua kelompok", () => {
    expect(formatAccessCode("12345678")).toBe("1234-5678");
  });
});

describe("hashAccessCode", () => {
  it("deterministik untuk pepper yang sama dan berbeda untuk pepper lain", () => {
    expect(hashAccessCode("12345678", key)).toBe(hashAccessCode("12345678", key));
    expect(hashAccessCode("12345678", key)).not.toBe(hashAccessCode("12345678", randomBytes(32)));
    expect(hashAccessCode("12345678", key)).not.toContain("12345678");
  });
});

describe("encrypt/decryptAccessCode", () => {
  it("mengembalikan kode semula", () => {
    const enc = encryptAccessCode("12345678", key);
    expect(enc).not.toContain("12345678");
    expect(decryptAccessCode(enc, key)).toBe("12345678");
  });

  it("memakai IV acak sehingga hasil enkripsi berbeda", () => {
    expect(encryptAccessCode("12345678", key)).not.toBe(encryptAccessCode("12345678", key));
  });

  it("gagal dengan kunci yang salah", () => {
    const enc = encryptAccessCode("12345678", key);
    expect(() => decryptAccessCode(enc, randomBytes(32))).toThrow();
  });
});
