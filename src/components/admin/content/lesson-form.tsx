"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldShell, TextField, inputClass } from "@/components/ui/field";
import { LESSON_BODY_MAX_LENGTH } from "@/lib/content/lesson-body";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { saveLesson } from "@/server/actions/admin-content";
import { KindSelect } from "./kind-select";

export type LessonFormValues = { title: string; body: string; references: string; kind: "GENERAL" | "CLINICAL" };

// Contoh isi untuk konten umum (tanpa angka takaran).
const BODY_EXAMPLE = [
  "## Kapan harus cuci tangan?",
  "Cuci tangan pakai sabun di air mengalir membantu mencegah kuman penyebab diare masuk ke tubuh si kecil.",
  "",
  "- Sebelum menyiapkan makanan",
  "- Sebelum menyuapi anak",
  "- Setelah mengganti popok atau menceboki anak",
  "",
  "1. Basahi tangan dengan air mengalir",
  "2. Gosok sabun ke telapak, punggung tangan, dan sela jari",
  "3. Bilas lalu keringkan dengan kain bersih",
  "",
  "> Ajak si kecil ikut mencuci tangan supaya terbiasa sejak dini.",
].join("\n");

const SYNTAX: [string, string][] = [
  ["## Subjudul", "judul bagian"],
  ["- butir", "daftar berpoin"],
  ["1. langkah", "langkah berurutan"],
  ["> catatan", "kotak \"Penting\""],
  ["![keterangan](/illustrations/nama.png)", "gambar dari folder public"],
];

export function LessonForm({
  topicId,
  lessonId,
  initial,
  approvalWillReset,
}: {
  topicId: string;
  lessonId?: string;
  initial: LessonFormValues;
  /** Konten klinis yang sudah ditinjau/disetujui/terbit: menyimpan akan membatalkan persetujuan. */
  approvalWillReset?: boolean;
}) {
  const [state, action, pending] = useActionState(saveLesson, initialFormState);
  const values = { ...initial, ...state.values };

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-5">
      <input type="hidden" name="topicId" value={topicId} />
      {lessonId && <input type="hidden" name="lessonId" value={lessonId} />}
      {state.message && <Callout variant={state.ok ? "success" : "danger"}>{state.message}</Callout>}
      {approvalWillReset && (
        <Callout variant="warning">
          Submateri klinis ini sudah masuk tinjauan. Menyimpan perubahan akan mengembalikannya ke Draft: persetujuan lama dibatalkan dan
          submateri tidak tampil ke responden sampai disetujui & diterbitkan ulang.
        </Callout>
      )}
      <TextField
        name="title"
        label="Judul submateri"
        defaultValue={values.title}
        errors={state.errors?.title}
        required
        maxLength={120}
        placeholder="Contoh: Cuci Tangan Pakai Sabun"
        hint="Satu pokok bahasan per submateri. Contoh: Apa Itu Diare?, Penyebab Diare, Cuci Tangan Pakai Sabun."
      />
      <KindSelect defaultValue={values.kind} errors={state.errors?.kind} />
      <FieldShell
        id="field-body"
        label="Isi"
        errors={state.errors?.body}
        hint={
          <span className="flex flex-col gap-1">
            <span>Pisahkan paragraf dengan baris kosong. Format yang tersedia:</span>
            {SYNTAX.map(([code, meaning]) => (
              <span key={code}>
                <code className="rounded bg-surface-container px-1">{code}</code> = {meaning}
              </span>
            ))}
            <details className="mt-1">
              <summary className="cursor-pointer py-2 font-semibold text-primary-700">Lihat contoh isi lengkap</summary>
              <pre className="overflow-x-auto rounded-md bg-surface-container p-3 font-sans whitespace-pre-wrap">{BODY_EXAMPLE}</pre>
            </details>
          </span>
        }
      >
        <textarea
          id="field-body"
          name="body"
          rows={18}
          required
          maxLength={LESSON_BODY_MAX_LENGTH}
          defaultValue={values.body}
          placeholder={BODY_EXAMPLE}
          aria-invalid={state.errors?.body?.length ? true : undefined}
          aria-describedby={state.errors?.body?.length ? "field-body-error" : "field-body-hint"}
          className={cn(inputClass, "h-auto py-3 leading-relaxed")}
        />
      </FieldShell>
      <FieldShell id="field-references" label="Referensi" optional hint="Satu sumber per baris (maks. 10). Format: Penulis/Lembaga (tahun). Judul dokumen." errors={state.errors?.references}>
        <textarea
          id="field-references"
          name="references"
          rows={3}
          defaultValue={values.references}
          placeholder="Contoh: Kementerian Kesehatan RI (2023). Judul pedoman atau buku saku."
          aria-describedby={state.errors?.references?.length ? "field-references-error" : "field-references-hint"}
          aria-invalid={state.errors?.references?.length ? true : undefined}
          className={cn(inputClass, "h-auto py-3")}
        />
      </FieldShell>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Menyimpan…" : lessonId ? "Simpan Perubahan" : "Simpan sebagai Draft"}
      </Button>
    </form>
  );
}
