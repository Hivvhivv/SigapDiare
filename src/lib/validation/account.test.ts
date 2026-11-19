import { describe, expect, it } from "vitest";
import { isDeleteConfirmed } from "./account";

describe("isDeleteConfirmed", () => {
  it("menerima HAPUS tanpa peduli huruf besar/kecil dan spasi", () => {
    expect(isDeleteConfirmed("HAPUS")).toBe(true);
    expect(isDeleteConfirmed("  hapus ")).toBe(true);
  });

  it("menolak isian lain", () => {
    for (const input of ["", "hapu", "HAPUS AKUN", "ya", "HAP US"]) expect(isDeleteConfirmed(input), input).toBe(false);
  });
});
