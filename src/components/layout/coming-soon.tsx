import { Hourglass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
      <Hourglass aria-hidden className="size-12 text-primary-300" />
      <h2 className="text-h3 font-bold">{title}</h2>
      <p className="max-w-prose text-body text-on-surface-variant">
        {description ?? "Bagian ini sedang disiapkan dan akan segera tersedia."}
      </p>
      <ButtonLink href="/beranda" variant="tonal" className="mt-2">
        Kembali ke Beranda
      </ButtonLink>
    </div>
  );
}
