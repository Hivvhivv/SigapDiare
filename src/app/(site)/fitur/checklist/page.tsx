import type { Metadata } from "next";
import { ChecklistCard } from "@/components/home/checklist-card";
import { Container, PageHeader } from "@/components/layout/page-header";
import { requireRespondent } from "@/server/guards";
import { getHomeData } from "@/server/queries/home";

export const metadata: Metadata = { title: "Checklist Harian" };

export default async function ChecklistPage() {
  const user = await requireRespondent();
  const data = await getHomeData(user);

  return (
    <Container narrow>
      <PageHeader
        title="Checklist Pencegahan Harian"
        description="Centang kebiasaan sehat yang sudah dilakukan hari ini. Checklist dimulai baru setiap hari."
        back={{ href: "/fitur" }}
      />
      {data && <ChecklistCard items={data.checklist.items} checked={data.checklist.checked} />}
    </Container>
  );
}
