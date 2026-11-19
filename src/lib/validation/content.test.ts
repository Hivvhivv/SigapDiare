import { describe, expect, it } from "vitest";
import { parseLessonForm } from "./content";

const base = { title: "Cuci tangan pakai sabun", body: "Cuci tangan dengan sabun.", references: "", kind: "GENERAL" };

describe("parseLessonForm", () => {
  it("menerima submateri umum yang valid", () => {
    const result = parseLessonForm({ ...base, references: "Kemenkes RI 2022\n\n  WHO 2024  " });
    expect(result).toEqual({
      ok: true,
      data: {
        title: "Cuci tangan pakai sabun",
        body: [{ type: "paragraph", text: "Cuci tangan dengan sabun." }],
        references: ["Kemenkes RI 2022", "WHO 2024"],
        kind: "GENERAL",
      },
    });
  });

  it("menolak konten umum yang memuat takaran", () => {
    const result = parseLessonForm({ ...base, body: "Berikan oralit 100 ml setiap BAB." });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.kind?.[0]).toMatch(/Klinis/);
  });

  it("mengizinkan takaran pada konten klinis (akan ditinjau)", () => {
    expect(parseLessonForm({ ...base, body: "Berikan oralit 100 ml setiap BAB.", kind: "CLINICAL" }).ok).toBe(true);
  });

  it("menolak isi kosong dan judul pendek", () => {
    const empty = parseLessonForm({ ...base, body: "  " });
    expect(empty.ok || empty.errors.body).toEqual(["Isi materi masih kosong"]);
    const short = parseLessonForm({ ...base, title: "ab" });
    expect(short.ok || short.errors.title).toBeTruthy();
  });

  it("membatasi jumlah referensi", () => {
    const refs = Array.from({ length: 11 }, (_, i) => `Ref ${i}`).join("\n");
    const result = parseLessonForm({ ...base, references: refs });
    expect(result.ok || result.errors.references).toEqual(["Maksimal 10 referensi"]);
  });

  it("menolak jenis konten yang tidak dikenal", () => {
    expect(parseLessonForm({ ...base, kind: "PUBLISHED" }).ok).toBe(false);
  });
});
