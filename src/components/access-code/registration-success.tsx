"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/utils";
import { CopyCodeButton } from "./copy-code-button";

export function RegistrationSuccess({ code, nextHref }: { code: string; nextHref: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 px-4 py-6 text-center">
        <p className="text-caption font-semibold text-on-surface-variant">Kode Akses Ibu</p>
        <p className="mt-1 text-[2rem] leading-tight font-extrabold tracking-[0.15em] text-primary-700 tabular-nums">
          {code}
        </p>
      </div>
      <div className="flex justify-center">
        <CopyCodeButton code={code} />
      </div>
      <Callout variant="warning">
        Simpan kode ini baik-baik. Kode dipakai setiap kali masuk. Kami sarankan screenshot layar ini atau catat di buku.
      </Callout>
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-4">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-primary-600"
        />
        <span className="text-body">Saya sudah menyimpan kode akses</span>
      </label>
      <ButtonLink
        href={nextHref}
        aria-disabled={!saved}
        tabIndex={saved ? undefined : -1}
        className={cn("w-full", !saved && "pointer-events-none opacity-40")}
      >
        Lanjut Isi Profil Anak
      </ButtonLink>
    </div>
  );
}
