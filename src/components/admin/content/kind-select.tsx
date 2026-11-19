import type { ReactNode } from "react";
import { FieldShell, inputClass } from "@/components/ui/field";

export function KindSelect({ defaultValue, errors, hint }: { defaultValue: string; errors?: string[]; hint?: ReactNode }) {
  return (
    <FieldShell id="field-kind" label="Jenis konten" hint={hint} errors={errors}>
      <select
        id="field-kind"
        name="kind"
        defaultValue={defaultValue}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? "field-kind-error" : hint ? "field-kind-hint" : undefined}
        className={inputClass}
      >
        <option value="GENERAL">Umum: langsung dapat diterbitkan admin</option>
        <option value="CLINICAL">Klinis: wajib ditinjau & disetujui tenaga kesehatan</option>
      </select>
    </FieldShell>
  );
}
