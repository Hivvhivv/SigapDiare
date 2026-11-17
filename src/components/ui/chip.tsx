import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "neutral" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  primary: "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-800",
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-success-soft text-success-strong border border-success-border",
  warning: "bg-warning-soft text-warning-strong border border-warning-border",
  danger: "bg-danger-soft text-danger-strong border border-danger-border",
};

export function Chip({ tone = "primary", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-3 text-[0.875rem] font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
