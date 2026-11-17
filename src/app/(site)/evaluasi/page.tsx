import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Container, PageHeader } from "@/components/layout/page-header";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Evaluasi Pengetahuan" };

export default async function EvaluationPage() {
  await requireRespondent();
  return (
    <Container narrow>
      <PageHeader
        title="Evaluasi Pengetahuan"
        description="Pretest dan posttest untuk mengukur pemahaman Ibu tentang diare pada anak."
      />
      <ComingSoon title="Evaluasi sedang disiapkan" description="Pretest akan tersedia setelah peneliti membuka jadwal evaluasi." />
    </Container>
  );
}
