import { describe, expect, it } from "vitest";
import { availableActions, kindChangeError, mentionsDose, nextStatus, statusAfterEdit } from "./workflow";

const admin = { isClinicalReviewer: false };
const reviewer = { isClinicalReviewer: true };

describe("alur konten klinis", () => {
  it("harus melewati tinjauan dan persetujuan sebelum terbit", () => {
    expect(nextStatus("publish", { kind: "CLINICAL", status: "DRAFT" }, reviewer)).toBeNull();
    expect(nextStatus("publish", { kind: "CLINICAL", status: "IN_REVIEW" }, reviewer)).toBeNull();
    expect(nextStatus("submit", { kind: "CLINICAL", status: "DRAFT" }, admin)).toBe("IN_REVIEW");
    expect(nextStatus("approve", { kind: "CLINICAL", status: "IN_REVIEW" }, reviewer)).toBe("APPROVED");
    expect(nextStatus("publish", { kind: "CLINICAL", status: "APPROVED" }, admin)).toBe("PUBLISHED");
  });

  it("hanya peninjau klinis yang dapat menyetujui", () => {
    expect(nextStatus("approve", { kind: "CLINICAL", status: "IN_REVIEW" }, admin)).toBeNull();
    expect(availableActions({ kind: "CLINICAL", status: "IN_REVIEW" }, admin)).toEqual(["return", "archive"]);
    expect(availableActions({ kind: "CLINICAL", status: "IN_REVIEW" }, reviewer)).toEqual(["return", "approve", "archive"]);
  });

  it("menarik publikasi tetap menyimpan persetujuan", () => {
    expect(nextStatus("unpublish", { kind: "CLINICAL", status: "PUBLISHED" }, admin)).toBe("APPROVED");
  });

  it("mengubah isi membatalkan persetujuan", () => {
    for (const status of ["IN_REVIEW", "APPROVED", "PUBLISHED"] as const) {
      expect(statusAfterEdit({ kind: "CLINICAL", status }, "CLINICAL")).toBe("DRAFT");
    }
  });
});

describe("alur konten umum", () => {
  it("dapat langsung terbit tanpa tinjauan", () => {
    expect(nextStatus("publish", { kind: "GENERAL", status: "DRAFT" }, admin)).toBe("PUBLISHED");
    expect(nextStatus("submit", { kind: "GENERAL", status: "DRAFT" }, admin)).toBeNull();
    expect(nextStatus("approve", { kind: "GENERAL", status: "DRAFT" }, reviewer)).toBeNull();
  });

  it("perubahan isi tidak menarik publikasi", () => {
    expect(statusAfterEdit({ kind: "GENERAL", status: "PUBLISHED" }, "GENERAL")).toBe("PUBLISHED");
  });

  it("diubah menjadi klinis harus ditinjau dari awal", () => {
    expect(statusAfterEdit({ kind: "GENERAL", status: "PUBLISHED" }, "CLINICAL")).toBe("DRAFT");
  });

  it("arsip tetap arsip setelah diubah, dan dapat dipulihkan ke draft", () => {
    expect(statusAfterEdit({ kind: "GENERAL", status: "ARCHIVED" }, "CLINICAL")).toBe("ARCHIVED");
    expect(nextStatus("restore", { kind: "CLINICAL", status: "ARCHIVED" }, admin)).toBe("DRAFT");
  });
});

describe("kindChangeError", () => {
  it("melarang admin biasa menurunkan konten klinis menjadi umum", () => {
    expect(kindChangeError("CLINICAL", "GENERAL", admin)).toMatch(/peninjau klinis/);
    expect(kindChangeError("CLINICAL", "GENERAL", reviewer)).toBeNull();
    expect(kindChangeError("GENERAL", "CLINICAL", admin)).toBeNull();
  });

  it("konten klinis yang diturunkan menjadi umum kembali ke draft", () => {
    expect(statusAfterEdit({ kind: "CLINICAL", status: "PUBLISHED" }, "GENERAL")).toBe("DRAFT");
  });
});

describe("mentionsDose", () => {
  it("mendeteksi angka takaran", () => {
    for (const text of ["berikan 100 ml", "100–200 ml setiap BAB", "zinc 20 mg", "1 sachet oralit", "½ tablet", "10mg", "2 sdt", "1,5 gelas"]) {
      expect(mentionsDose(text), text).toBe(true);
    }
  });

  it("tidak menandai angka biasa", () => {
    for (const text of ["cuci tangan 5 langkah", "anak usia 6 bulan", "3 kali sehari", "20 detik", "5 gizi seimbang"]) {
      expect(mentionsDose(text), text).toBe(false);
    }
  });
});
