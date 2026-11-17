"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { Chip } from "@/components/ui/chip";
import { initialFormState } from "@/lib/form";
import { saveChecklist } from "@/server/actions/checklist";

export function ChecklistCard({ items, checked }: { items: { id: string; label: string }[]; checked: string[] }) {
  const [state, action, pending] = useActionState(saveChecklist, initialFormState);
  const [selected, setSelected] = useState(() => new Set(checked));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section aria-labelledby="checklist-title" className="rounded-xl border border-outline-variant bg-surface p-5 lg:p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 id="checklist-title" className="text-h3 font-bold">
          Ceklis Rutin Hari Ini
        </h2>
        <Chip>
          {selected.size}/{items.length} Selesai
        </Chip>
      </div>
      <p className="mb-4 text-caption text-on-surface-variant">Yuk, pastikan kebiasaan sehat berikut dilakukan setiap hari!</p>

      {items.length === 0 ? (
        <p className="text-body text-on-surface-variant">Daftar kebiasaan sedang disiapkan admin.</p>
      ) : (
        <form action={action}>
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const isChecked = selected.has(item.id);
              return (
                <li key={item.id}>
                  <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-outline-variant px-4 py-3 has-[:checked]:border-primary-200 has-[:checked]:bg-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-300">
                    <input
                      type="checkbox"
                      name="item"
                      value={item.id}
                      checked={isChecked}
                      onChange={() => toggle(item.id)}
                      className="size-6 shrink-0 accent-primary-600"
                    />
                    <span className="flex-1 text-body">{item.label}</span>
                    {isChecked && <Check aria-hidden className="size-5 text-primary-600" />}
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-caption text-on-surface-variant">
              {state.ok ? state.message : "Centang kebiasaan yang sudah dilakukan, lalu simpan."}
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center rounded-full px-4 text-label font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40"
            >
              {pending ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
