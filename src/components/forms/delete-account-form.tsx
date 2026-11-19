"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { DELETE_CONFIRM_WORD } from "@/lib/validation/account";
import { deleteAccount } from "@/server/actions/account";

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="confirm"
        label={`Ketik ${DELETE_CONFIRM_WORD} untuk konfirmasi`}
        defaultValue={state.values?.confirm ?? ""}
        errors={state.errors?.confirm}
        autoComplete="off"
        autoCapitalize="characters"
        required
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <ButtonLink href="/profil" variant="outlined">
          Batal, Kembali ke Profil
        </ButtonLink>
        <Button type="submit" variant="danger" disabled={pending}>
          <Trash2 aria-hidden className="size-5" />
          {pending ? "Menghapus…" : "Hapus Akun Saya"}
        </Button>
      </div>
    </form>
  );
}
