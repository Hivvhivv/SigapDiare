"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { addCareLog } from "@/server/actions/tracker";

/** Catat pemberian oralit/cairan (jumlah sesuai anjuran tenaga kesehatan; sistem tidak menyarankan takaran). */
export function CareLogForm({ defaultGivenAt }: { defaultGivenAt: string }) {
  const [state, action, pending] = useActionState(addCareLog, initialFormState);
  const errors = state.errors ?? {};
  const sent = state.values;

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-label font-semibold">Yang diberikan</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["ORALIT", "Oralit"],
            ["FLUID", "Cairan lain (ASI/air/kuah)"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-outline-variant px-3 text-center text-label font-semibold has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
            >
              <input type="radio" name="type" value={value} defaultChecked={(sent?.type ?? "ORALIT") === value} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
        <FieldError id="field-type" errors={errors.type} />
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <TextField name="amountMl" label="Jumlah (ml)" type="number" inputMode="numeric" min={5} max={3000} defaultValue={sent?.amountMl} errors={errors.amountMl} required />
        <TextField name="givenAt" label="Jam" type="datetime-local" defaultValue={sent?.givenAt ?? defaultGivenAt} errors={errors.givenAt} required />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="tonal" disabled={pending}>
          {pending ? "Menyimpan…" : "Catat Pemberian"}
        </Button>
        {state.ok && (
          <span aria-live="polite" className="inline-flex items-center gap-1 text-caption text-success-strong">
            <Check aria-hidden className="size-4" />
            {state.message}
          </span>
        )}
        {state.message && !state.ok && <span className="text-caption text-danger-strong">{state.message}</span>}
      </div>
    </form>
  );
}
