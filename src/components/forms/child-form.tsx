"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { createChild } from "@/server/actions/child";

const SEX_OPTIONS = [
  { value: "FEMALE", label: "Perempuan" },
  { value: "MALE", label: "Laki-laki" },
];

export function ChildForm({ maxDate, minDate }: { maxDate: string; minDate: string }) {
  const [state, action, pending] = useActionState(createChild, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <TextField
        name="nickname"
        label="Nama Panggilan Anak"
        placeholder="Contoh: Arka"
        defaultValue={state.values?.nickname}
        errors={state.errors?.nickname}
        required
      />
      <TextField
        name="birthDate"
        label="Tanggal Lahir"
        type="date"
        min={minDate}
        max={maxDate}
        defaultValue={state.values?.birthDate}
        errors={state.errors?.birthDate}
        required
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label font-semibold">Jenis Kelamin</legend>
        <div className="grid grid-cols-2 gap-3">
          {SEX_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex h-14 cursor-pointer items-center justify-center rounded-md border border-outline-variant bg-surface text-label font-semibold has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-300"
            >
              <input
                type="radio"
                name="sex"
                value={option.value}
                defaultChecked={state.values?.sex === option.value}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError id="field-sex" errors={state.errors?.sex} />
      </fieldset>
      <TextField
        name="weightKg"
        label="Berat Badan (kg)"
        optional
        inputMode="decimal"
        placeholder="Contoh: 11,5"
        defaultValue={state.values?.weightKg}
        errors={state.errors?.weightKg}
        hint="Hanya dipakai untuk fitur yang membutuhkannya."
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Menyimpan…" : "Simpan Profil Anak"}
      </Button>
    </form>
  );
}
