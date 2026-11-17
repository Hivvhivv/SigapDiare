import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-md border border-outline-variant bg-surface px-4 text-body text-on-surface " +
  "placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 " +
  "aria-[invalid=true]:border-danger";

type FieldShellProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  errors?: string[];
  children: ReactNode;
};

export function FieldShell({ id, label, optional, hint, errors, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label font-semibold text-on-surface">
        {label}
        {optional && <span className="font-normal text-on-surface-variant"> (opsional)</span>}
      </label>
      {children}
      {hint && !errors?.length && (
        <p id={`${id}-hint`} className="text-caption text-on-surface-variant">
          {hint}
        </p>
      )}
      <FieldError id={id} errors={errors} />
    </div>
  );
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={`${id}-error`} className="flex items-start gap-1.5 text-caption text-danger-strong">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {errors[0]}
    </p>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  name: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  errors?: string[];
};

export function TextField({ name, label, optional, hint, errors, className, ...props }: TextFieldProps) {
  const id = `field-${name}`;
  const describedBy = errors?.length ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} errors={errors}>
      <input
        id={id}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, className)}
        {...props}
      />
    </FieldShell>
  );
}
