"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { gradeAnswer } from "@/server/actions/admin-eval";

export function GradeForm({
  answerId,
  maxPoints,
  score,
  note,
}: {
  answerId: string;
  maxPoints: number;
  score: number | null;
  note: string | null;
}) {
  const [state, action, pending] = useActionState(gradeAnswer, initialFormState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="answerId" value={answerId} />
      <label className="flex flex-col gap-1 text-caption font-semibold">
        Nilai (0–{maxPoints})
        <input
          type="number"
          name="score"
          min={0}
          max={maxPoints}
          step={1}
          required
          defaultValue={score ?? ""}
          className={cn(inputClass, "h-11 w-24 text-center tabular-nums")}
        />
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-caption font-semibold">
        Catatan (opsional)
        <input name="scoreNote" maxLength={300} defaultValue={note ?? ""} className={cn(inputClass, "h-11")} />
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Menyimpan…" : score === null ? "Simpan Nilai" : "Perbarui"}
      </Button>
      <span aria-live="polite" className="text-caption">
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-success-strong">
            <Check aria-hidden className="size-4" />
            {state.message}
          </span>
        )}
        {state.message && !state.ok && <span className="text-danger-strong">{state.message}</span>}
      </span>
    </form>
  );
}
