import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "tonal" | "inverted" | "outlined" | "danger" | "text" | "white";
export type ButtonSize = "md" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  tonal: "bg-primary-100 text-primary-800 hover:bg-primary-200",
  inverted: "bg-neutral-800 text-white hover:bg-neutral-900",
  outlined: "border border-outline bg-transparent text-neutral-800 hover:bg-surface-container",
  danger: "bg-danger text-white hover:bg-danger-strong",
  text: "bg-transparent px-2 text-primary-700 hover:bg-primary-50",
  white: "bg-white text-primary-700 hover:bg-primary-50",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-6",
  sm: "h-10 px-4",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-label font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-40",
    sizes[size],
    variants[variant],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
