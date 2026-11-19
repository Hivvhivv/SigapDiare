"use client";

import { Minus, Plus } from "lucide-react";
import { FieldError } from "@/components/ui/field";

/** Pengisi angka kecil dengan tombol − / + besar (mudah di HP). Nilai kosong = tidak diisi. */
export function Stepper({
  name,
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 30,
  errors,
  optional,
}: {
  name: string;
  label: string;
  hint?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  errors?: string[];
  optional?: boolean;
}) {
  const id = `field-${name}`;
  const current = value ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label font-semibold">
        {label}
        {optional && <span className="font-normal text-on-surface-variant"> (opsional)</span>}
      </label>
      {hint && <p className="-mt-1 text-caption text-on-surface-variant">{hint}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, current - 1))}
          disabled={value === null || current <= min}
          aria-label={`Kurangi ${label}`}
          className="flex size-14 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface hover:bg-surface-container disabled:opacity-30"
        >
          <Minus aria-hidden className="size-6" />
        </button>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          placeholder="–"
          onChange={(e) => onChange(e.target.value === "" ? null : Math.min(max, Math.max(min, Number(e.target.value))))}
          aria-invalid={errors?.length ? true : undefined}
          className="h-14 w-20 rounded-md border border-outline-variant bg-surface text-center text-h2 font-bold tabular-nums focus:border-primary-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value === null ? Math.max(min, 1) : current + 1))}
          disabled={current >= max}
          aria-label={`Tambah ${label}`}
          className="flex size-14 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-30"
        >
          <Plus aria-hidden className="size-6" />
        </button>
      </div>
      <FieldError id={id} errors={errors} />
    </div>
  );
}
