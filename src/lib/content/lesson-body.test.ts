import { describe, expect, it } from "vitest";
import { asLessonBlocks, lessonBodyToText, parseLessonBody, slugify } from "./lesson-body";

describe("parseLessonBody", () => {
  it("mengurai semua jenis blok", () => {
    const result = parseLessonBody(
      [
        "## Apa itu diare?",
        "Diare adalah buang air besar",
        "lebih sering dari biasanya.",
        "",
        "- Cuci tangan",
        "- Air bersih",
        "1. Siapkan air",
        "2) Aduk",
        "> Segera ke puskesmas bila",
        "> anak sangat lemas.",
        "![Ibu mencuci tangan](/illustrations/cuci-tangan.png)",
      ].join("\r\n"),
    );
    expect(result).toEqual({
      ok: true,
      blocks: [
        { type: "heading", text: "Apa itu diare?" },
        { type: "paragraph", text: "Diare adalah buang air besar lebih sering dari biasanya." },
        { type: "list", items: ["Cuci tangan", "Air bersih"] },
        { type: "steps", items: ["Siapkan air", "Aduk"] },
        { type: "callout", text: "Segera ke puskesmas bila anak sangat lemas." },
        { type: "image", src: "/illustrations/cuci-tangan.png", alt: "Ibu mencuci tangan" },
      ],
    });
  });

  it("menolak isi kosong", () => {
    expect(parseLessonBody("  \n\n ")).toEqual({ ok: false, error: "Isi materi masih kosong" });
  });

  it("menolak gambar dari luar website atau path aneh", () => {
    for (const src of ["https://contoh.com/a.png", "//contoh.com/a.png", "/a/../b.png", "/gambar.gif", "javascript:alert(1)"]) {
      const result = parseLessonBody(`![x](${src})`);
      // ditolak, atau paling tidak bukan blok gambar (jatuh menjadi teks biasa)
      expect(result.ok && result.blocks.some((b) => b.type === "image"), src).toBe(false);
    }
  });

  it("menolak gambar tanpa keterangan", () => {
    expect(parseLessonBody("![](/illustrations/a.png)").ok).toBe(false);
  });

  it("menganggap HTML sebagai teks biasa", () => {
    expect(parseLessonBody("<script>alert(1)</script>")).toEqual({
      ok: true,
      blocks: [{ type: "paragraph", text: "<script>alert(1)</script>" }],
    });
  });
});

describe("lessonBodyToText", () => {
  it("dapat diurai ulang menjadi blok yang sama", () => {
    const parsed = parseLessonBody("## Judul\n\nParagraf satu.\n\n- a\n- b\n\n1. x\n2. y\n\n> awas\n\n![gambar](/illustrations/a.webp)");
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parseLessonBody(lessonBodyToText(parsed.blocks))).toEqual(parsed);
  });
});

describe("asLessonBlocks", () => {
  it("membuang blok yang bentuknya tidak dikenal", () => {
    expect(
      asLessonBlocks([
        { type: "paragraph", text: "ok" },
        { type: "html", html: "<b>x</b>" },
        { type: "image", src: "https://luar.com/a.png", alt: "x" },
        { type: "list", items: ["a", 1] },
        null,
      ]),
    ).toEqual([{ type: "paragraph", text: "ok" }]);
    expect(asLessonBlocks({})).toEqual([]);
  });
});

describe("slugify", () => {
  it("membuat slug URL", () => {
    expect(slugify("  Apa Itu Diare? (Bagian 1) ")).toBe("apa-itu-diare-bagian-1");
    expect(slugify("Oralit & Cairan")).toBe("oralit-cairan");
    expect(slugify("???")).toBe("");
  });
});
