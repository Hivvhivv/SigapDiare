import { ArrowLeftRight, ChevronRight, FileText, KeyRound, LogOut, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RevealCode } from "@/components/access-code/reveal-code";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ageInMonths, formatAge, todayAsDateOnly } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { logout } from "@/server/actions/auth";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";
import { readableAccessCode } from "@/server/services/respondents";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilePage() {
  const user = await requireRespondent({ allowNoChild: true });
  const account = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      accessCodeEnc: true,
      participants: { take: 1, select: { code: true } },
      _count: { select: { children: true } },
    },
  });
  const activeChild = user.activeChildId
    ? await db.childProfile.findFirst({ where: { id: user.activeChildId, userId: user.id } })
    : null;
  const code = readableAccessCode(account.accessCodeEnc);
  const today = todayAsDateOnly(user.timezone);

  return (
    <Container narrow>
      <PageHeader title="Profil Saya" />

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-bold">Data Orang Tua / Pengasuh</h2>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-label font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              <LogOut aria-hidden className="size-5" />
              Keluar
            </button>
          </form>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-caption text-on-surface-variant">Nama</dt>
            <dd className="text-body font-semibold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-caption text-on-surface-variant">Nomor HP</dt>
            <dd className="text-body font-semibold">{user.phoneNumber ? formatPhone(user.phoneNumber) : "–"}</dd>
          </div>
          {account.participants[0] && (
            <div>
              <dt className="text-caption text-on-surface-variant">Nomor Peserta</dt>
              <dd className="text-body font-semibold">{account.participants[0].code}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface p-6">
        <h2 className="mb-1 flex items-center gap-2 text-h3 font-bold">
          <KeyRound aria-hidden className="size-5 text-primary-600" />
          Kode Akses
        </h2>
        <p className="mb-4 text-caption text-on-surface-variant">Kode ini dipakai setiap kali masuk. Jangan dibagikan ke orang lain.</p>
        {code && <RevealCode code={code} />}
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface p-6">
        <h2 className="mb-3 text-h3 font-bold">Profil Anak</h2>
        {activeChild ? (
          <p className="mb-4 flex flex-wrap items-center gap-2 text-body">
            <span className="font-semibold">{activeChild.nickname}</span>
            <span className="text-on-surface-variant">· {formatAge(ageInMonths(activeChild.birthDate, today))}</span>
            <Chip tone="success">Anak Aktif</Chip>
          </p>
        ) : (
          <p className="mb-4 text-body text-on-surface-variant">Belum ada profil anak.</p>
        )}
        <p className="mb-4 text-caption text-on-surface-variant">{account._count.children} profil anak terdaftar.</p>
        <ButtonLink href="/profil/anak" variant="tonal">
          <ArrowLeftRight aria-hidden className="size-5" />
          Ganti / Tambah Anak
        </ButtonLink>
      </section>

      <section aria-labelledby="account-title" className="rounded-xl border border-outline-variant bg-surface p-2">
        <h2 id="account-title" className="sr-only">
          Pengaturan Akun
        </h2>
        <Link href="/kebijakan-privasi" className="flex min-h-14 items-center gap-3 rounded-lg px-4 text-body font-semibold hover:bg-surface-container">
          <FileText aria-hidden className="size-5 text-on-surface-variant" />
          <span className="flex-1">Kebijakan Privasi</span>
          <ChevronRight aria-hidden className="size-5 text-on-surface-variant" />
        </Link>
        <Link
          href="/profil/hapus-akun"
          className="flex min-h-14 items-center gap-3 rounded-lg px-4 text-body font-semibold text-danger-strong hover:bg-danger-soft"
        >
          <Trash2 aria-hidden className="size-5" />
          <span className="flex-1">Hapus Akun</span>
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      </section>
    </Container>
  );
}
