"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldShell, TextField, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { saveTopic } from "@/server/actions/admin-content";
import { KindSelect } from "./kind-select";

export type TopicFormValues = { title: string; summary: string; kind: "GENERAL" | "CLINICAL" };

/** Tambah materi baru (tanpa topicId) atau ubah materi. */
export function TopicForm({ topicId, initial }: { topicId?: string; initial?: TopicFormValues }) {
  const [state, action, pending] = useActionState(saveTopic, initialFormState);
  const values = { title: "", summary: "", kind: "GENERAL", ...initial, ...state.values };

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-5">
      {topicId && <input type="hidden" name="topicId" value={topicId} />}
      <h2 className="text-h3 font-bold">{topicId ? "Data Materi" : "Tambah Materi"}</h2>
      {state.message && <Callout variant={state.ok ? "success" : "danger"}>{state.message}</Callout>}
      <TextField
        name="title"
        label="Judul materi"
        defaultValue={values.title}
        errors={state.errors?.title}
        required
        maxLength={80}
        placeholder="Contoh: Pencegahan Diare"
        hint="Singkat dan jelas, 2–5 kata. Contoh: Mengenal Diare, Pencegahan Diare, Makanan Saat Anak Diare."
      />
      <FieldShell
        id="field-summary"
        label="Ringkasan"
        hint="Satu kalimat (maks. 240 karakter) yang tampil di kartu materi halaman Edukasi. Contoh: Cegah diare dimulai dari rumah: kebersihan tangan, makanan, air, dan lingkungan."
        errors={state.errors?.summary}
      >
        <textarea
          id="field-summary"
          name="summary"
          rows={3}
          maxLength={240}
          required
          defaultValue={values.summary}
          placeholder="Contoh: Apa itu diare, penyebabnya, cara penularan, dan gejalanya pada anak."
          aria-describedby={state.errors?.summary?.length ? "field-summary-error" : "field-summary-hint"}
          aria-invalid={state.errors?.summary?.length ? true : undefined}
          className={cn(inputClass, "h-auto py-3")}
        />
      </FieldShell>
      <KindSelect
        defaultValue={values.kind}
        errors={state.errors?.kind}
        hint="Jenis bawaan untuk submateri baru. Materi klinis (oralit, zinc, makanan, tanda bahaya) wajib disetujui peninjau klinis."
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Menyimpan…" : topicId ? "Simpan Materi" : "Tambah Materi"}
      </Button>
    </form>
  );
}
