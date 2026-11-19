import { ChevronRight, Siren } from "lucide-react";
import Link from "next/link";

/** Tautan Tanda Bahaya yang selalu terlihat di halaman materi (EDU-06). Ikon + teks + warna. */
export function DangerLink() {
  return (
    <Link
      href="/tanda-bahaya"
      className="flex min-h-14 items-center gap-3 rounded-lg border border-danger-border bg-danger-soft p-4 text-danger-strong hover:bg-rose-100"
    >
      <Siren aria-hidden className="size-6 shrink-0" />
      <span className="flex-1 text-body">
        <span className="font-semibold">Anak tampak sangat lemas, BAB berdarah, atau tidak mau minum?</span> Lihat Tanda Bahaya dan segera ke
        fasilitas kesehatan.
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0" />
    </Link>
  );
}
