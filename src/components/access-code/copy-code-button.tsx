"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

export function CopyCodeButton({
  code,
  variant = "tonal",
  size = "md",
  label = "Salin Kode",
  onCopied,
}: {
  code: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} aria-live="polite">
      {copied ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-5" />}
      {copied ? "Tersalin" : label}
    </Button>
  );
}
