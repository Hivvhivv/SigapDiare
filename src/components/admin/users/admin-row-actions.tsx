"use client";

import { Ban, KeyRound, ShieldCheck, ShieldMinus, Stethoscope, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Callout } from "@/components/ui/callout";
import {
  resetAdminPassword,
  setAdminBanned,
  setAdminRole,
  setClinicalReviewer,
} from "@/server/actions/admin-users";
import { TempPasswordCard } from "./temp-password-card";

type Props = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  banned: boolean;
  isClinicalReviewer: boolean;
  isSelf: boolean;
};

const buttonClass =
  "inline-flex h-9 items-center gap-1 rounded-full px-3 text-[0.875rem] font-semibold disabled:opacity-40";

export function AdminRowActions({ id, name, email, role, banned, isClinicalReviewer, isSelf }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function run(confirmText: string | null, action: () => Promise<{ ok: boolean; message?: string; tempPassword?: string }>) {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const result = await action();
      setError(result.ok ? null : (result.message ?? "Gagal."));
      if (result.ok && result.tempPassword) setTempPassword(result.tempPassword);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {role === "ADMIN" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(`Jadikan ${name} Super Admin? Ia bisa mengelola akun admin lain.`, () => setAdminRole(id, "SUPER_ADMIN"))}
            className={`${buttonClass} text-primary-700 hover:bg-primary-50`}
          >
            <ShieldCheck aria-hidden className="size-4" />
            Jadikan Super Admin
          </button>
        ) : (
          !isSelf && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(`Turunkan ${name} menjadi Admin?`, () => setAdminRole(id, "ADMIN"))}
              className={`${buttonClass} text-primary-700 hover:bg-primary-50`}
            >
              <ShieldMinus aria-hidden className="size-4" />
              Jadikan Admin
            </button>
          )
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(null, () => setClinicalReviewer(id, !isClinicalReviewer))}
          className={`${buttonClass} text-on-surface hover:bg-surface-container`}
        >
          <Stethoscope aria-hidden className="size-4" />
          {isClinicalReviewer ? "Cabut Peninjau Klinis" : "Jadikan Peninjau Klinis"}
        </button>
        {!isSelf && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(`Reset password ${name}? Password lama tidak berlaku dan ia keluar dari semua perangkat.`, () =>
                  resetAdminPassword(id),
                )
              }
              className={`${buttonClass} text-on-surface hover:bg-surface-container`}
            >
              <KeyRound aria-hidden className="size-4" />
              Reset Password
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(banned ? `Aktifkan kembali ${name}?` : `Nonaktifkan ${name}? Ia tidak dapat masuk.`, () =>
                  setAdminBanned(id, !banned),
                )
              }
              className={`${buttonClass} text-danger-strong hover:bg-danger-soft`}
            >
              {banned ? <Undo2 aria-hidden className="size-4" /> : <Ban aria-hidden className="size-4" />}
              {banned ? "Aktifkan" : "Nonaktifkan"}
            </button>
          </>
        )}
      </div>
      {error && <Callout variant="danger">{error}</Callout>}
      {tempPassword && <TempPasswordCard title={`Password ${name} direset.`} email={email} password={tempPassword} />}
    </div>
  );
}
