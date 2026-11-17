import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("memverifikasi password yang benar dan menolak yang salah", async () => {
    const stored = await hashPassword("rahasia-admin-123");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(stored).not.toContain("rahasia-admin-123");
    expect(await verifyPassword("rahasia-admin-123", stored)).toBe(true);
    expect(await verifyPassword("salah", stored)).toBe(false);
  });

  it("menolak format hash yang tidak dikenal", async () => {
    expect(await verifyPassword("apa saja", "bcrypt$abc")).toBe(false);
  });
});
