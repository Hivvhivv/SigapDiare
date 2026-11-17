"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { loginWithAccessCode } from "@/server/actions/auth";

/** Hanya angka + tanda hubung otomatis setelah 4 angka: 123456 → 1234-56 */
function formatTyping(value: string) {
  const raw = value.replace(/\D/g, "").slice(0, 8);
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
}

export function AccessCodeLoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginWithAccessCode, initialFormState);
  const [code, setCode] = useState(state.values?.code ?? "");
  const errors = state.errors?.code;

  return (
    <form action={action} className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <div className="flex flex-col gap-2">
        <label htmlFor="field-code" className="text-label font-semibold">
          Kode Akses
        </label>
        <input
          id="field-code"
          name="code"
          value={code}
          onChange={(e) => setCode(formatTyping(e.target.value))}
          placeholder="8 angka"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          required
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? "field-code-error" : undefined}
          className={cn(inputClass, "h-14 text-center text-[1.375rem] font-bold tracking-[0.2em] tabular-nums")}
        />
        <FieldError id="field-code" errors={errors} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
      <div className="flex flex-col items-center gap-2 text-body">
        <Link href="/lupa-kode" className="font-semibold text-primary-700 hover:underline">
          Lupa kode akses?
        </Link>
        <p>
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-primary-700 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </form>
  );
}
