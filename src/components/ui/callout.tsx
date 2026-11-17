import { CircleCheck, Info, TriangleExclamationPoint, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "warning" | "danger" | "disclaimer";

const styles: Record<Variant, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-primary-600 bg-primary-50", icon: "text-primary-700", Icon: Info },
  success: { box: "border-success bg-success-soft", icon: "text-success-strong", Icon: CircleCheck },
  warning: { box: "border-warning bg-warning-soft", icon: "text-warning-strong", Icon: TriangleExclamationPoint },
  danger: { box: "border-danger bg-danger-soft", icon: "text-danger-strong", Icon: TriangleExclamationPoint },
  disclaimer: { box: "border-neutral-400 bg-neutral-100", icon: "text-neutral-600", Icon: Info },
};

export function Callout({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { box, icon, Icon } = styles[variant];
  return (
    <div className={cn("flex gap-3 rounded-md border-l-4 p-4", box, className)}>
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", icon)} />
      <div className="text-body">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-on-surface">{children}</div>
      </div>
    </div>
  );
}
