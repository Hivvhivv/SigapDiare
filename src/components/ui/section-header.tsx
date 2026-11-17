import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  action,
  id,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  id?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow && (
          <p className="text-eyebrow font-bold tracking-[0.08em] text-primary-700 uppercase">{eyebrow}</p>
        )}
        <h2 id={id} className="text-h2 font-bold lg:text-h2-lg">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-label font-semibold text-primary-700 hover:bg-primary-50"
        >
          {action.label}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
