"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldShell, TextField, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { loginAdmin } from "@/server/actions/auth";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialFormState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message && <Callout variant="danger">{state.message}</Callout>}
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        defaultValue={state.values?.email}
        errors={state.errors?.email}
        required
      />
      <FieldShell id="field-password" label="Password" errors={state.errors?.password}>
        <div className="relative">
          <input
            id="field-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface"
          >
            {showPassword ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        </div>
      </FieldShell>
      <Button type="submit" variant="inverted" disabled={pending} className="w-full">
        {pending ? "Memeriksa…" : "Masuk sebagai Admin"}
      </Button>
    </form>
  );
}
