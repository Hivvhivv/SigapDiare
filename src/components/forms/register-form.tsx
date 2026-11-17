"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { registerRespondent } from "@/server/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerRespondent, initialFormState);
  const phoneTaken = state.errors?.phone?.[0]?.includes("sudah terdaftar");

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <TextField
        name="name"
        label="Nama Lengkap"
        autoComplete="name"
        defaultValue={state.values?.name}
        errors={state.errors?.name}
        required
      />
      <TextField
        name="phone"
        label="Nomor HP"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="08xxxxxxxxxx"
        defaultValue={state.values?.phone}
        errors={state.errors?.phone}
        hint="Satu nomor HP untuk satu akun."
        required
      />
      {phoneTaken && (
        <p className="-mt-3 flex gap-4 text-caption">
          <Link href="/masuk" className="font-semibold text-primary-700 hover:underline">
            Masuk
          </Link>
          <Link href="/lupa-kode" className="font-semibold text-primary-700 hover:underline">
            Lupa kode akses?
          </Link>
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant bg-surface p-4">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 size-5 shrink-0 accent-primary-600"
            aria-describedby={state.errors?.consent ? "field-consent-error" : undefined}
          />
          <span className="text-body">
            Saya menyetujui{" "}
            <Link href="/kebijakan-privasi" target="_blank" className="font-semibold text-primary-700 underline">
              kebijakan privasi
            </Link>{" "}
            dan bersedia data saya serta anak saya disimpan untuk keperluan pemantauan dan penelitian SIGAP DIARE.
          </span>
        </label>
        <FieldError id="field-consent" errors={state.errors?.consent} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Mendaftarkan…" : "Daftar & Dapatkan Kode Akses"}
      </Button>
      <p className="text-center text-body">
        Sudah punya kode akses?{" "}
        <Link href="/masuk" className="font-semibold text-primary-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
