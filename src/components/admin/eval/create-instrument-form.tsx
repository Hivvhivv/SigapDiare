"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { createInstrument } from "@/server/actions/admin-eval";

const PHASES = [
  { value: "PRETEST", label: "Pretest" },
  { value: "POSTTEST", label: "Posttest" },
];

export function CreateInstrumentForm() {
  const [state, action, pending] = useActionState(createInstrument, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-5">
      <h2 className="text-h3 font-bold">Buat Instrumen Baru</h2>
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <fieldset>
        <legend className="mb-2 text-label font-semibold">Fase</legend>
        <div className="grid grid-cols-2 gap-3">
          {PHASES.map((phase) => (
            <label
              key={phase.value}
              className="flex h-12 cursor-pointer items-center justify-center rounded-md border border-outline-variant text-label font-semibold has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
            >
              <input
                type="radio"
                name="phase"
                value={phase.value}
                defaultChecked={(state.values?.phase ?? "PRETEST") === phase.value}
                className="sr-only"
              />
              {phase.label}
            </label>
          ))}
        </div>
        <FieldError id="field-phase" errors={state.errors?.phase} />
      </fieldset>
      <TextField
        name="title"
        label="Judul"
        placeholder="Contoh: Pretest Pengetahuan Diare Balita"
        defaultValue={state.values?.title}
        errors={state.errors?.title}
        required
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Membuat…" : "Buat & Susun Soal"}
      </Button>
    </form>
  );
}
