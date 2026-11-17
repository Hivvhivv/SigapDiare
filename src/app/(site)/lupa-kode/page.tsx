import { MessageCircleQuestionMark } from "lucide-react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/layout/auth-card";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { getSupportWhatsapp } from "@/server/queries/settings";

export const metadata: Metadata = { title: "Lupa Kode Akses" };

const WA_MESSAGE =
  "Halo Admin SIGAP DIARE, saya lupa kode akses.\nNama: \nNomor HP terdaftar: ";

export default async function ForgotCodePage() {
  const whatsapp = await getSupportWhatsapp();

  return (
    <AuthCard
      title="Lupa Kode Akses?"
      description="Hubungi admin SIGAP DIARE dan sebutkan nama serta nomor HP yang Ibu daftarkan."
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <MessageCircleQuestionMark aria-hidden className="size-16 text-primary-300" />
        </div>
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(WA_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary-600 px-6 text-label font-semibold text-white hover:bg-primary-700"
          >
            Hubungi Admin via WhatsApp
          </a>
        ) : (
          <Callout variant="info">Nomor WhatsApp admin belum diatur. Silakan hubungi peneliti atau kader yang mendampingi Ibu.</Callout>
        )}
        <p className="text-caption text-on-surface-variant">
          Demi keamanan, admin akan memastikan pesan berasal dari nomor HP yang terdaftar sebelum memberikan kode.
        </p>
        <ButtonLink href="/masuk" variant="outlined" className="w-full">
          Kembali ke Masuk
        </ButtonLink>
      </div>
    </AuthCard>
  );
}
