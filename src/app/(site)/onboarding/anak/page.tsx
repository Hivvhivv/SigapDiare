import type { Metadata } from "next";
import { ChildForm } from "@/components/forms/child-form";
import { AuthCard } from "@/components/layout/auth-card";
import { localDateString } from "@/lib/dates";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Profil Anak" };

export default async function ChildOnboardingPage() {
  const user = await requireRespondent({ allowNoChild: true });
  const today = localDateString(new Date(), user.timezone);
  const [year, month, day] = today.split("-");
  const minDate = `${Number(year) - 5}-${month}-${day}`;

  return (
    <AuthCard
      title={user.activeChildId ? "Tambah Profil Anak" : "Isi Profil Si Kecil"}
      description="Data ini membantu kami menampilkan informasi yang sesuai usia si kecil."
    >
      <ChildForm maxDate={today} minDate={minDate} />
    </AuthCard>
  );
}
