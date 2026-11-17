import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Container, PageHeader } from "@/components/layout/page-header";
import { requireRespondent } from "@/server/guards";

// Fitur yang belum dibangun. Masing-masing akan mendapat route sendiri.
const UPCOMING: Record<string, { title: string; description: string }> = {
  pelacak: {
    title: "Catatan Diare",
    description: "Catat kondisi si kecil untuk memantau perubahannya dari waktu ke waktu.",
  },
  pengingat: {
    title: "Pengingat",
    description: "Atur pengingat kebersihan, oralit sesuai instruksi, dan jadwal kontrol.",
  },
  "panduan-takaran": {
    title: "Panduan Takaran",
    description: "Informasi oralit dan zinc akan tampil setelah disetujui tenaga kesehatan.",
  },
};

export default async function UpcomingFeaturePage(props: PageProps<"/fitur/[slug]">) {
  await requireRespondent();
  const { slug } = await props.params;
  const feature = UPCOMING[slug];
  if (!feature) notFound();

  return (
    <Container narrow>
      <PageHeader title={feature.title} description={feature.description} back={{ href: "/fitur" }} />
      <ComingSoon title="Segera hadir" />
    </Container>
  );
}
