"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldShell, TextField, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { NOTES_MAX } from "@/lib/validation/tracker";
import { saveCarePlan } from "@/server/actions/tracker";

export function CarePlanForm({
  initial,
}: {
  initial: { zincDays: number | null; fluidTargetMl: number | null; instructionNote: string | null };
}) {
  const [state, action, pending] = useActionState(saveCarePlan, initialFormState);
  const errors = state.errors ?? {};
  const sent = state.values;

  return (
    <form action={action} className="flex flex-col gap-5">
      <Callout variant="info" title="Isi sesuai anjuran dokter, bidan, atau petugas puskesmas">
        SIGAP DIARE tidak menentukan takaran obat atau cairan. Kosongkan bagian yang tidak dijelaskan oleh tenaga kesehatan.
      </Callout>
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <TextField
        name="zincDays"
        label="Zinc diberikan selama berapa hari?"
        type="number"
        inputMode="numeric"
        min={1}
        max={30}
        optional
        defaultValue={sent?.zincDays ?? initial.zincDays ?? ""}
        errors={errors.zincDays}
        hint="Sesuai yang dikatakan tenaga kesehatan."
      />
      <TextField
        name="fluidTargetMl"
        label="Target cairan/oralit per hari (ml)"
        type="number"
        inputMode="numeric"
        min={50}
        max={5000}
        optional
        defaultValue={sent?.fluidTargetMl ?? initial.fluidTargetMl ?? ""}
        errors={errors.fluidTargetMl}
        hint="Isi hanya bila tenaga kesehatan menyebutkan jumlahnya."
      />
      <FieldShell id="field-instructionNote" label="Catatan anjuran" optional errors={errors.instructionNote} hint="Tulis pesan dokter/bidan agar tidak lupa.">
        <textarea
          id="field-instructionNote"
          name="instructionNote"
          rows={4}
          maxLength={NOTES_MAX}
          defaultValue={sent?.instructionNote ?? initial.instructionNote ?? ""}
          className={cn(inputClass, "h-auto py-3")}
        />
      </FieldShell>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan Rencana"}
        </Button>
        <Link href="/fitur/pelacak" className={buttonClass("outlined")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
