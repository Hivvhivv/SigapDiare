"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { changeOwnPassword } from "@/server/actions/admin-users";

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, action, pending] = useActionState(changeOwnPassword, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="current"
        label="Password saat ini"
        type="password"
        autoComplete="current-password"
        errors={state.errors?.current}
        required
      />
      <TextField
        name="next"
        label="Password baru"
        type="password"
        autoComplete="new-password"
        minLength={minLength}
        hint={`Minimal ${minLength} karakter.`}
        errors={state.errors?.next}
        required
      />
      <TextField
        name="confirm"
        label="Ulangi password baru"
        type="password"
        autoComplete="new-password"
        errors={state.errors?.confirm}
        required
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Menyimpan…" : "Simpan Password Baru"}
      </Button>
    </form>
  );
}
