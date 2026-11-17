"use client";

import { Ban, Check, Copy, RefreshCw, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  recordAccessCodeCopy,
  regenerateRespondentAccessCode,
  setRespondentBanned,
} from "@/server/actions/admin";

export function AccessCodeCell({ userId, code }: { userId: string; code: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!code) return <span className="text-on-surface-variant">–</span>;

  async function copy() {
    await navigator.clipboard.writeText(code!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    await recordAccessCodeCopy(userId);
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-bold tracking-[0.12em] tabular-nums">{code}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Salin kode akses ${code}`}
        className="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
      >
        {copied ? <Check aria-hidden className="size-4 text-success" /> : <Copy aria-hidden className="size-4" />}
      </button>
    </span>
  );
}

export function RespondentRowActions({ userId, name, banned }: { userId: string; name: string; banned: boolean }) {
  const [pending, startTransition] = useTransition();

  function regenerate() {
    const ok = window.confirm(
      `Buat ulang kode akses untuk ${name}?\n\nKode lama tidak dapat dipakai lagi dan responden akan keluar dari semua perangkat.`,
    );
    if (ok) startTransition(() => regenerateRespondentAccessCode(userId));
  }

  function toggleBan() {
    const ok = window.confirm(banned ? `Aktifkan kembali akun ${name}?` : `Nonaktifkan akun ${name}? Responden tidak dapat masuk.`);
    if (ok) startTransition(() => setRespondentBanned(userId, !banned));
  }

  return (
    <span className="inline-flex gap-1">
      <button
        type="button"
        onClick={regenerate}
        disabled={pending}
        className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[0.875rem] font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40"
      >
        <RefreshCw aria-hidden className="size-4" />
        Kode baru
      </button>
      <button
        type="button"
        onClick={toggleBan}
        disabled={pending}
        className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[0.875rem] font-semibold text-danger-strong hover:bg-danger-soft disabled:opacity-40"
      >
        {banned ? <Undo2 aria-hidden className="size-4" /> : <Ban aria-hidden className="size-4" />}
        {banned ? "Aktifkan" : "Nonaktifkan"}
      </button>
    </span>
  );
}
