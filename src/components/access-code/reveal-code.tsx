"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyCodeButton } from "./copy-code-button";

export function RevealCode({ code }: { code: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="min-w-[10ch] rounded-md bg-primary-50 px-4 py-2 text-h3 font-extrabold tracking-[0.15em] text-primary-700 tabular-nums">
        {visible ? code : "••••-••••"}
      </span>
      <Button variant="outlined" size="sm" onClick={() => setVisible((v) => !v)}>
        {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
        {visible ? "Sembunyikan" : "Tampilkan"}
      </Button>
      <CopyCodeButton code={code} size="sm" />
    </div>
  );
}
