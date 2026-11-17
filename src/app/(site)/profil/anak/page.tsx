import { Check, Plus } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ageInMonths, formatAge, todayAsDateOnly } from "@/lib/dates";
import { setActiveChild } from "@/server/actions/child";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Ganti Anak" };

// Halaman tujuan tombol "Ganti Anak": hanya memilih/menambah anak, tanpa tombol keluar.
export default async function SwitchChildPage() {
  const user = await requireRespondent({ allowNoChild: true });
  const children = await db.childProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  const today = todayAsDateOnly(user.timezone);

  return (
    <Container narrow>
      <PageHeader
        title="Pilih Anak"
        description="Pilih anak yang ingin Ibu pantau. Beranda akan menampilkan data anak yang dipilih."
        back={{ href: "/beranda", label: "Kembali ke Beranda" }}
      />

      <ul className="flex flex-col gap-3">
        {children.map((child) => {
          const active = child.id === user.activeChildId;
          return (
            <li
              key={child.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                active ? "border-2 border-primary-600 bg-primary-50" : "border-outline-variant bg-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-h3 font-bold text-secondary-800">
                  {child.nickname[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-body font-semibold">
                    {child.nickname}
                    {active && <Chip tone="success">Anak Aktif</Chip>}
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    {formatAge(ageInMonths(child.birthDate, today))} · {child.sex === "FEMALE" ? "Perempuan" : "Laki-laki"}
                  </p>
                </div>
              </div>
              {active ? (
                <span className="inline-flex items-center gap-1 text-label font-semibold text-primary-700">
                  <Check aria-hidden className="size-5" />
                  Dipilih
                </span>
              ) : (
                <form action={setActiveChild}>
                  <input type="hidden" name="childId" value={child.id} />
                  <Button type="submit" variant="primary" size="sm">
                    Pilih
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      <ButtonLink href="/onboarding/anak" variant="tonal" className="mt-6 w-full sm:w-auto">
        <Plus aria-hidden className="size-5" />
        Tambah Anak
      </ButtonLink>
    </Container>
  );
}
