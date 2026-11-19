// Isi submateri disimpan sebagai blok JSON. Admin menulisnya sebagai teks sederhana:
//   ## Subjudul
//   - butir daftar
//   1. langkah berurutan
//   > catatan penting (kotak sorot)
//   ![keterangan gambar](/illustrations/nama.png)
//   teks biasa = paragraf; baris kosong memisahkan blok.
// Tidak ada HTML mentah, jadi isi aman dirender tanpa sanitasi.

export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt: string };

export const LESSON_BODY_MAX_LENGTH = 20000;

/** Gambar hanya dari folder public website sendiri (bukan URL luar). */
const IMAGE_SRC = /^\/[A-Za-z0-9/_-]+\.(png|jpe?g|webp|svg)$/i;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

type TextBlockType = "paragraph" | "callout" | "list" | "steps";

export type ParseResult = { ok: true; blocks: LessonBlock[] } | { ok: false; error: string };

export function parseLessonBody(text: string): ParseResult {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const blocks: LessonBlock[] = [];
  let pendingType: TextBlockType | null = null;
  let parts: string[] = [];

  const flush = () => {
    if (pendingType === "list" || pendingType === "steps") blocks.push({ type: pendingType, items: parts });
    else if (pendingType) blocks.push({ type: pendingType, text: parts.join(" ") });
    pendingType = null;
    parts = [];
  };
  const push = (type: TextBlockType, part: string) => {
    if (pendingType !== type) {
      flush();
      pendingType = type;
    }
    parts.push(part);
  };

  for (const [index, raw] of lines.entries()) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      continue;
    }
    const image = IMAGE_LINE.exec(line);
    if (image) {
      flush();
      const [, alt, src] = image;
      if (!IMAGE_SRC.test(src) || src.includes("..")) {
        return { ok: false, error: `Baris ${index + 1}: gambar harus dari folder website, misalnya /illustrations/nama.png` };
      }
      if (!alt.trim()) return { ok: false, error: `Baris ${index + 1}: tulis keterangan gambar di antara [ ]` };
      blocks.push({ type: "image", src, alt: alt.trim() });
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      push("list", bullet[1].trim());
      continue;
    }
    const step = /^\d+[.)]\s+(.+)$/.exec(line);
    if (step) {
      push("steps", step[1].trim());
      continue;
    }
    if (line.startsWith(">")) {
      const content = line.slice(1).trim();
      if (content) push("callout", content);
      continue;
    }
    push("paragraph", line);
  }
  flush();

  if (blocks.length === 0) return { ok: false, error: "Isi materi masih kosong" };
  return { ok: true, blocks };
}

/** Kebalikan dari parseLessonBody, untuk mengisi ulang editor. */
export function lessonBodyToText(blocks: LessonBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `## ${block.text}`;
        case "paragraph":
          return block.text;
        case "callout":
          return `> ${block.text}`;
        case "list":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "steps":
          return block.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
        case "image":
          return `![${block.alt}](${block.src})`;
      }
    })
    .join("\n\n");
}

/** Baca blok dari kolom Json; data yang bentuknya tidak dikenal diabaikan. */
export function asLessonBlocks(value: unknown): LessonBlock[] {
  if (!Array.isArray(value)) return [];
  return value.filter((block): block is LessonBlock => {
    if (!block || typeof block !== "object") return false;
    const b = block as Record<string, unknown>;
    switch (b.type) {
      case "heading":
      case "paragraph":
      case "callout":
        return typeof b.text === "string";
      case "list":
      case "steps":
        return Array.isArray(b.items) && b.items.every((item) => typeof item === "string");
      case "image":
        return typeof b.src === "string" && IMAGE_SRC.test(b.src) && typeof b.alt === "string";
      default:
        return false;
    }
  });
}

/** Slug URL dari judul: huruf kecil, angka, tanda hubung. */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}
