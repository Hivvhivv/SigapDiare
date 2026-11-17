import type { ReactNode } from "react";
import { LogoMark } from "./logo";

export function AuthCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[440px] px-4 py-10 lg:py-16">
      <div className="rounded-xl border border-outline-variant bg-surface p-6 shadow-[0_1px_2px_rgb(15_23_42/0.06)] sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-14" />
          <h1 className="text-h2 font-bold">{title}</h1>
          {description && <p className="text-body text-on-surface-variant">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
