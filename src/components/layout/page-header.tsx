import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Illustration, type IllustrationName } from "@/components/illustrations/illustration";
import { SceneDecor } from "@/components/illustrations/scene";
import { cn } from "@/lib/utils";

type Tone = "sky" | "warm" | "mint" | "sunny";

const HERO_BG: Record<Tone, string> = {
  sky: "from-secondary-100 via-primary-50 to-surface border-primary-100",
  warm: "from-rose-100 via-danger-soft to-surface border-danger-border",
  mint: "from-emerald-100 via-success-soft to-surface border-success-border",
  sunny: "from-amber-100 via-tertiary-50 to-surface border-tertiary-200",
};

function BackLink({ back }: { back: { href: string; label?: string } }) {
  return (
    <Link
      href={back.href}
      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 py-1 pr-3 pl-2 text-label font-semibold text-primary-700 shadow-sm hover:bg-white"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {back.label ?? "Kembali"}
    </Link>
  );
}

/**
 * Judul halaman. Dengan `illustration`, tampil sebagai kartu hero berlatar warna + ilustrasi
 * (gaya mockup); tanpa itu, tampil sebagai judul biasa.
 */
export function PageHeader({
  title,
  description,
  back,
  children,
  illustration,
  tone = "sky",
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label?: string };
  children?: ReactNode;
  illustration?: IllustrationName;
  tone?: Tone;
}) {
  if (illustration) {
    return (
      <div
        className={cn(
          "relative isolate mb-8 flex items-end gap-4 overflow-hidden rounded-xl border bg-linear-to-b p-5 pb-10 sm:p-6 sm:pb-12 lg:p-8 lg:pb-14",
          HERO_BG[tone],
        )}
      >
        <SceneDecor tone={tone} />
        <div className="flex min-w-0 flex-1 flex-col gap-3 self-center">
          {back && <BackLink back={back} />}
          <h1 className="text-h1 font-extrabold text-primary-800 lg:text-display-lg">{title}</h1>
          {description && <p className="max-w-prose text-body-lg text-on-surface">{description}</p>}
          {children}
        </div>
        <Illustration name={illustration} className="w-28 shrink-0 sm:w-40 lg:w-56" />
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col gap-3">
      {back && <BackLink back={back} />}
      <h1 className="text-h1 font-bold lg:text-h1-lg">{title}</h1>
      {description && <p className="max-w-prose text-body-lg text-on-surface-variant">{description}</p>}
      {children}
    </div>
  );
}

export function Container({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-4 py-8 lg:px-8 lg:py-12 ${narrow ? "max-w-[720px]" : "max-w-[1200px]"}`}>{children}</div>;
}
