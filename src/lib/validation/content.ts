// Validasi formulir Kelola Edukasi (materi & submateri). Fungsi murni; dipakai server action dan unit test.
import { z } from "zod";
import { LESSON_BODY_MAX_LENGTH, parseLessonBody, type LessonBlock } from "@/lib/content/lesson-body";
import { mentionsDose } from "@/lib/content/workflow";

const kindSchema = z.enum(["GENERAL", "CLINICAL"], { error: "Pilih jenis konten" });

export const topicSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(80, "Judul maksimal 80 karakter"),
  summary: z.string().trim().min(10, "Ringkasan minimal 10 karakter").max(240, "Ringkasan maksimal 240 karakter"),
  kind: kindSchema,
});

const MAX_REFERENCES = 10;

const lessonFieldsSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(120, "Judul maksimal 120 karakter"),
  body: z.string().max(LESSON_BODY_MAX_LENGTH, `Isi maksimal ${LESSON_BODY_MAX_LENGTH} karakter`),
  references: z.string().max(3000, "Daftar referensi terlalu panjang"),
  kind: kindSchema,
});

export type LessonData = {
  title: string;
  body: LessonBlock[];
  references: string[];
  kind: "GENERAL" | "CLINICAL";
};

type Result = { ok: true; data: LessonData } | { ok: false; errors: Record<string, string[]> };

export function parseLessonForm(values: Record<string, string>): Result {
  const parsed = lessonFieldsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }
  const { title, body, references, kind } = parsed.data;

  const blocks = parseLessonBody(body);
  if (!blocks.ok) return { ok: false, errors: { body: [blocks.error] } };

  const refs = references
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (refs.length > MAX_REFERENCES) return { ok: false, errors: { references: [`Maksimal ${MAX_REFERENCES} referensi`] } };
  if (refs.some((ref) => ref.length > 300)) return { ok: false, errors: { references: ["Satu referensi maksimal 300 karakter"] } };

  // Takaran hanya boleh muncul di konten klinis yang ditinjau tenaga kesehatan.
  if (kind === "GENERAL" && mentionsDose(`${title}\n${body}`)) {
    return {
      ok: false,
      errors: { kind: ["Isi memuat angka takaran (ml, mg, sachet, dll.). Pilih jenis Klinis agar ditinjau tenaga kesehatan."] },
    };
  }

  return { ok: true, data: { title, body: blocks.blocks, references: refs, kind } };
}
