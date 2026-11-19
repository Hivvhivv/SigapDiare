"use server";

import { redirect } from "next/navigation";
import { formString, type FormState } from "@/lib/form";
import { DELETE_CONFIRM_WORD, isDeleteConfirmed } from "@/lib/validation/account";
import { requireRespondent } from "../guards";
import { deleteRespondentAccount } from "../services/account";
import { deleteCurrentSession } from "../session";

export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRespondent({ allowNoChild: true });
  const confirm = formString(formData, "confirm");
  if (!isDeleteConfirmed(confirm)) {
    return { errors: { confirm: [`Ketik ${DELETE_CONFIRM_WORD} untuk melanjutkan`] }, values: { confirm } };
  }

  await deleteRespondentAccount(user.id);
  await deleteCurrentSession();
  redirect("/?akun=dihapus");
}
