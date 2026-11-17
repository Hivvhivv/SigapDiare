"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldShell, TextField, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { updateInstrumentSettings } from "@/server/actions/admin-eval";

export type InstrumentSettings = {
  title: string;
  intro: string;
  opensAt: string; // nilai datetime-local WIB
  closesAt: string;
  showResultsAfterClose: boolean;
};

export function InstrumentSettingsForm({ instrumentId, initial }: { instrumentId: string; initial: InstrumentSettings }) {
  const [state, action, pending] = useActionState(updateInstrumentSettings, initialFormState);
  const values = { ...initial, ...state.values };

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-5">
      <input type="hidden" name="instrumentId" value={instrumentId} />
      <h2 className="text-h3 font-bold">Pengaturan & Jadwal</h2>
      {state.message && <Callout variant={state.ok ? "success" : "danger"}>{state.message}</Callout>}
      <TextField name="title" label="Judul" defaultValue={values.title} errors={state.errors?.title} required />
      <FieldShell
        id="field-intro"
        label="Teks pembuka"
        optional
        hint="Kosongkan untuk memakai teks bawaan pretest/posttest."
        errors={state.errors?.intro}
      >
        <textarea id="field-intro" name="intro" rows={3} defaultValue={values.intro} className={cn(inputClass, "h-auto py-3")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="opensAt"
          label="Dibuka (WIB)"
          type="datetime-local"
          optional
          defaultValue={values.opensAt}
          errors={state.errors?.opensAt}
          hint="Kosong = draft, belum terlihat responden."
        />
        <TextField
          name="closesAt"
          label="Ditutup (WIB)"
          type="datetime-local"
          optional
          defaultValue={values.closesAt}
          errors={state.errors?.closesAt}
          hint="Kosong = tidak ada batas waktu."
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="showResultsAfterClose"
          defaultChecked={initial.showResultsAfterClose}
          className="mt-1 size-5 accent-primary-600"
        />
        <span className="text-body">Tampilkan skor ke responden setelah evaluasi ditutup</span>
      </label>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Menyimpan…" : "Simpan Pengaturan"}
      </Button>
    </form>
  );
}
