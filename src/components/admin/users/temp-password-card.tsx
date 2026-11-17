"use client";

import { CopyCodeButton } from "@/components/access-code/copy-code-button";

/** Password sementara: tampil sekali, untuk diserahkan langsung ke admin yang bersangkutan. */
export function TempPasswordCard({ title, email, password }: { title: string; email: string; password: string }) {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-4">
      <p className="text-label font-semibold">{title}</p>
      <dl className="grid gap-1 text-body">
        <div className="flex flex-wrap gap-2">
          <dt className="text-on-surface-variant">Email:</dt>
          <dd className="font-semibold">{email}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="text-on-surface-variant">Password sementara:</dt>
          <dd className="font-mono text-h3 font-bold tracking-wider text-primary-700">{password}</dd>
        </div>
      </dl>
      <div>
        <CopyCodeButton code={password} size="sm" label="Salin Password" />
      </div>
      <p className="text-caption text-on-surface-variant">
        Password ini hanya tampil sekali. Serahkan langsung ke yang bersangkutan (jangan lewat grup). Admin wajib
        menggantinya saat pertama kali masuk.
      </p>
    </div>
  );
}
