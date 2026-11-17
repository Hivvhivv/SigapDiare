import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label?: string };
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 rounded-full py-1 pr-3 text-label font-semibold text-primary-700 hover:bg-primary-50"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {back.label ?? "Kembali"}
        </Link>
      )}
      <h1 className="text-h1 font-bold lg:text-h1-lg">{title}</h1>
      {description && <p className="max-w-prose text-body-lg text-on-surface-variant">{description}</p>}
      {children}
    </div>
  );
}

export function Container({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-4 py-8 lg:px-8 lg:py-12 ${narrow ? "max-w-[720px]" : "max-w-[1200px]"}`}>{children}</div>;
}
