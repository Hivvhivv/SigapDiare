"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { DangerAlert } from "@/components/safety/danger-alert";
import { Button, buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, FieldShell, inputClass } from "@/components/ui/field";
import {
  CONDITION_OPTIONS,
  CONSISTENCY_OPTIONS,
  DRINKING_OPTIONS,
  OTHER_SIGN_OPTIONS,
} from "@/content/copy/tracker";
import { initialFormState } from "@/lib/form";
import { detectDangerSigns } from "@/lib/safety/danger-signs";
import { cn } from "@/lib/utils";
import { NOTES_MAX, toDangerInput } from "@/lib/validation/tracker";
import { saveTrackerEntry } from "@/server/actions/tracker";
import { Stepper } from "./stepper";

export type EntryInitial = {
  entryId: string | null;
  recordedAt: string; // datetime-local WIB
  stoolCount: number | null;
  consistency: "NORMAL" | "SOFT" | "WATERY" | null;
  bloodInStool: boolean | null;
  vomitCount: number | null;
  persistentVomiting: boolean;
  drinkingAbility: "NORMAL" | "REDUCED" | "UNABLE" | null;
  generalCondition: "ACTIVE" | "FUSSY" | "LETHARGIC" | null;
  sunkenEyes: boolean;
  dryMouth: boolean;
  worsening: boolean;
  notes: string;
};

function Cards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  errors,
  optional,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  errors?: string[];
  optional?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label font-semibold">
        {legend}
        {optional && <span className="font-normal text-on-surface-variant"> (opsional)</span>}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-14 cursor-pointer flex-col justify-center rounded-md border px-4 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-300",
                checked ? "border-2 border-primary-600 bg-primary-50" : "border-outline-variant bg-surface",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                onClick={() => optional && checked && onChange(null)}
                className="sr-only"
              />
              <span className="text-body font-semibold">{option.label}</span>
              {option.hint && <span className="text-caption text-on-surface-variant">{option.hint}</span>}
            </label>
          );
        })}
      </div>
      <FieldError id={`field-${name}`} errors={errors} />
    </fieldset>
  );
}

/** Form Catatan Diare. Tanda bahaya diperiksa SEKETIKA saat diisi (CLAUDE.md aturan 4). */
export function EntryForm({ initial }: { initial: EntryInitial }) {
  const [state, action, pending] = useActionState(saveTrackerEntry, initialFormState);
  const errors = state.errors ?? {};
  const sent = state.values;

  const [stoolCount, setStoolCount] = useState<number | null>(initial.stoolCount);
  const [consistency, setConsistency] = useState(initial.consistency);
  const [blood, setBlood] = useState<"ya" | "tidak" | null>(
    initial.bloodInStool === null ? null : initial.bloodInStool ? "ya" : "tidak",
  );
  const [vomitCount, setVomitCount] = useState<number | null>(initial.vomitCount);
  const [persistentVomiting, setPersistentVomiting] = useState(initial.persistentVomiting);
  const [drinking, setDrinking] = useState(initial.drinkingAbility);
  const [condition, setCondition] = useState(initial.generalCondition);
  const [others, setOthers] = useState({ sunkenEyes: initial.sunkenEyes, dryMouth: initial.dryMouth, worsening: initial.worsening });

  const signs = detectDangerSigns(
    toDangerInput({
      generalCondition: condition,
      drinkingAbility: drinking,
      bloodInStool: blood === null ? null : blood === "ya",
      persistentVomiting: persistentVomiting || null,
      sunkenEyes: others.sunkenEyes || null,
      dryMouth: others.dryMouth || null,
      worsening: others.worsening || null,
    }),
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      {initial.entryId && <input type="hidden" name="entryId" value={initial.entryId} />}
      {state.message && <Callout variant="danger">{state.message}</Callout>}

      {signs.length > 0 && (
        <div className="sticky top-16 z-20 lg:top-20">
          <DangerAlert signs={signs} title="Tanda Bahaya: Segera ke Fasilitas Kesehatan" />
        </div>
      )}

      <section className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface p-5">
        <h2 className="text-h3 font-bold">1. BAB si kecil</h2>
        <FieldShell id="field-recordedAt" label="Kapan dicatat?" errors={errors.recordedAt}>
          <input
            id="field-recordedAt"
            name="recordedAt"
            type="datetime-local"
            required
            defaultValue={sent?.recordedAt ?? initial.recordedAt}
            className={inputClass}
          />
        </FieldShell>
        <Stepper
          name="stoolCount"
          label="Berapa kali BAB?"
          hint="Hitung sejak catatan terakhir. Kalau ini catatan pertama hari ini, hitung sejak pagi."
          value={stoolCount}
          onChange={setStoolCount}
          errors={errors.stoolCount}
        />
        <Cards name="consistency" legend="Bentuk tinja" options={CONSISTENCY_OPTIONS} value={consistency} onChange={setConsistency} errors={errors.consistency} />
        <Cards
          name="bloodInStool"
          legend="Ada darah di tinja?"
          optional
          options={[
            { value: "tidak", label: "Tidak ada" },
            { value: "ya", label: "Ya, ada darah" },
          ]}
          value={blood}
          onChange={setBlood}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface p-5">
        <h2 className="text-h3 font-bold">2. Kondisi si kecil</h2>
        <p className="-mt-3 text-caption text-on-surface-variant">Semua bagian ini boleh dilewati.</p>
        <Stepper name="vomitCount" label="Muntah berapa kali?" optional value={vomitCount} onChange={setVomitCount} errors={errors.vomitCount} />
        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 py-3 has-[:checked]:border-danger-border has-[:checked]:bg-danger-soft">
          <input
            type="checkbox"
            name="persistentVomiting"
            checked={persistentVomiting}
            onChange={(e) => setPersistentVomiting(e.target.checked)}
            className="size-6 shrink-0 accent-danger"
          />
          <span className="text-body">Muntah terus-menerus (memuntahkan hampir semua yang diminum/dimakan)</span>
        </label>
        <Cards name="drinkingAbility" legend="Minum / menyusu" optional options={DRINKING_OPTIONS} value={drinking} onChange={setDrinking} />
        <Cards name="generalCondition" legend="Keadaan si kecil" optional options={CONDITION_OPTIONS} value={condition} onChange={setCondition} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-semibold">
            Tanda lain yang terlihat <span className="font-normal text-on-surface-variant">(opsional)</span>
          </legend>
          {OTHER_SIGN_OPTIONS.map((option) => (
            <label
              key={option.name}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 py-3 has-[:checked]:border-danger-border has-[:checked]:bg-danger-soft"
            >
              <input
                type="checkbox"
                name={option.name}
                checked={others[option.name]}
                onChange={(e) => setOthers((prev) => ({ ...prev, [option.name]: e.target.checked }))}
                className="size-6 shrink-0 accent-danger"
              />
              <span className="text-body">{option.label}</span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-5">
        <h2 className="text-h3 font-bold">3. Catatan tambahan</h2>
        <FieldShell id="field-notes" label="Catatan" optional errors={errors.notes} hint="Misalnya: makan apa hari ini, sudah dibawa ke mana.">
          <textarea
            id="field-notes"
            name="notes"
            rows={3}
            maxLength={NOTES_MAX}
            defaultValue={sent?.notes ?? initial.notes}
            className={cn(inputClass, "h-auto py-3")}
          />
        </FieldShell>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Menyimpan…" : "Simpan Catatan"}
        </Button>
        <Link href="/fitur/pelacak" className={buttonClass("outlined", "md", "w-full sm:w-auto")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
