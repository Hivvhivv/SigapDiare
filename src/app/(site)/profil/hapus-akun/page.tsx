import { CircleX, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/forms/delete-account-form";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Hapus Akun" };

export default async function DeleteAccountPage() {
  const user = await requireRespondent({ allowNoChild: true });
  const [children, entries, participant] = await Promise.all([
    db.childProfile.count({ where: { userId: user.id } }),
    db.trackerEntry.count({ where: { child: { userId: user.id } } }),
    db.participant.findFirst({ where: { userId: user.id }, select: { code: true } }),
  ]);

  const deleted = [
    "Nama, nomor HP, dan kode akses",
    `${children} profil anak`,
    `${entries} Catatan Diare, beserta rencana dan catatan pemberian cairan/zinc`,
    "Riwayat checklist harian dan progres baca materi",
  ];

  return (
    <Container narrow>
      <PageHeader
        title="Hapus Akun"
        description="Akun yang sudah dihapus tidak dapat dikembalikan."
        back={{ href: "/profil", label: "Profil Saya" }}
      />

      <div className="flex flex-col gap-6 rounded-xl border border-danger-border bg-surface p-6">
        <section aria-labelledby="deleted-title">
          <h2 id="deleted-title" className="mb-3 text-h3 font-bold">
            Yang akan dihapus permanen
          </h2>
          <ul className="flex flex-col gap-2">
            {deleted.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body">
                <CircleX aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {participant && (
          <section aria-labelledby="kept-title">
            <h2 id="kept-title" className="mb-3 text-h3 font-bold">
              Yang tetap disimpan tanpa nama
            </h2>
            <p className="flex items-start gap-2 text-body">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success-strong" />
              <span>
                Jawaban Kuis Awal dan Kuis Akhir tetap disimpan untuk penelitian dengan nomor peserta {participant.code} saja,
                sesuai persetujuan saat mendaftar. Jawaban itu tidak lagi terhubung ke nama atau nomor HP Ayah/Bunda.
              </span>
            </p>
          </section>
        )}

        <Callout variant="warning">
          Bila hanya ingin berhenti sementara, cukup tekan Keluar. Akun dan catatan si kecil tetap aman dan bisa dibuka lagi dengan
          kode akses.
        </Callout>

        <DeleteAccountForm />
      </div>
    </Container>
  );
}
