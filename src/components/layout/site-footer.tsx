import { Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EMERGENCY_NUMBER } from "@/content/copy/danger";
import { FOOTER_LINKS, TAGLINE } from "@/content/copy/site";
import { Logo } from "./logo";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-label font-bold">{title}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-caption text-on-surface-variant hover:text-primary-700 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3">
          <Logo tagline={false} />
          <p className="text-caption text-on-surface-variant">{TAGLINE}</p>
          <p className="text-caption text-on-surface-variant">
            Materi mengacu pada pedoman kesehatan dan ditinjau tenaga kesehatan. Bukan pengganti pemeriksaan dokter.
          </p>
        </div>
        <FooterColumn title="Edukasi & Penanganan" links={FOOTER_LINKS.education} />
        <FooterColumn title="Fitur Pendamping" links={FOOTER_LINKS.features} />
        <div>
          <h2 className="mb-3 text-label font-bold">Layanan Darurat</h2>
          <div className="rounded-lg border border-danger-border bg-danger-soft p-4">
            <a href={`tel:${EMERGENCY_NUMBER}`} className="flex items-center gap-2 text-label font-bold text-danger-strong hover:underline">
              <Phone aria-hidden className="size-5" />
              Hotline Darurat {EMERGENCY_NUMBER}
            </a>
            <p className="mt-2 text-caption text-on-surface">
              Segera ke puskesmas atau rumah sakit terdekat bila ada tanda bahaya.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/70">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-caption text-on-surface-variant lg:px-8">
          <p>© 2026 SIGAP DIARE</p>
          <p className="flex gap-3">
            <Link href="/lupa-kode" className="hover:underline">
              Bantuan
            </Link>
            <span aria-hidden>·</span>
            <Link href="/kebijakan-privasi" className="hover:underline">
              Kebijakan Privasi
            </Link>
          </p>
        </div>
      </div>
      <div className="pb-6 text-center">
        <Link
          href="/admin/masuk"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-caption text-on-surface-variant hover:text-on-surface hover:underline"
        >
          <ShieldCheck aria-hidden className="size-4" />
          Login Admin
        </Link>
      </div>
    </footer>
  );
}
