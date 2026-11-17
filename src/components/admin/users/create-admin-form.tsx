"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, TextField } from "@/components/ui/field";
import { createAdmin, type CreatedAdminState } from "@/server/actions/admin-users";
import { TempPasswordCard } from "./temp-password-card";

const ROLES = [
  { value: "ADMIN", label: "Admin", hint: "Kelola responden & evaluasi" },
  { value: "SUPER_ADMIN", label: "Super Admin", hint: "Admin + kelola akun admin" },
];

export function CreateAdminForm() {
  const [state, action, pending] = useActionState<CreatedAdminState, FormData>(createAdmin, {});

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-5">
      <h2 className="text-h3 font-bold">Tambah Admin</h2>
      {state.created && (
        <TempPasswordCard title={`Akun ${state.created.name} dibuat.`} email={state.created.email} password={state.created.tempPassword} />
      )}
      <form action={action} className="flex flex-col gap-4">
        {state.message && <Callout variant="danger">{state.message}</Callout>}
        <TextField name="name" label="Nama" defaultValue={state.values?.name} errors={state.errors?.name} required />
        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="off"
          defaultValue={state.values?.email}
          errors={state.errors?.email}
          required
        />
        <fieldset>
          <legend className="mb-2 text-label font-semibold">Role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer flex-col rounded-md border border-outline-variant p-3 has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <span className="flex items-center gap-2 text-label font-semibold">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    defaultChecked={(state.values?.role ?? "ADMIN") === role.value}
                    className="size-4 accent-primary-600"
                  />
                  {role.label}
                </span>
                <span className="text-caption text-on-surface-variant">{role.hint}</span>
              </label>
            ))}
          </div>
          <FieldError id="field-role" errors={state.errors?.role} />
        </fieldset>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Membuat…" : "Buat Akun & Password Sementara"}
        </Button>
      </form>
    </div>
  );
}
