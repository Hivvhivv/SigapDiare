import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, PageHeader } from "@/components/layout/page-header";
import { CarePlanForm } from "@/components/tracker/care-plan-form";
import { requireRespondent } from "@/server/guards";
import { getActiveChild } from "@/server/queries/home";
import { getActiveEpisode } from "@/server/queries/tracker";

export const metadata: Metadata = { title: "Anjuran Tenaga Kesehatan" };

export default async function CarePlanPage() {
  const user = await requireRespondent();
  const child = await getActiveChild(user);
  if (!child) return null;
  const episode = await getActiveEpisode(child.id);
  if (!episode) redirect("/fitur/pelacak");

  return (
    <Container narrow>
      <PageHeader
        title="Anjuran Tenaga Kesehatan"
        description={`Catat anjuran dokter/bidan untuk ${child.nickname} supaya mudah diingat dan dipantau setiap hari.`}
        back={{ href: "/fitur/pelacak", label: "Catatan Diare" }}
      />
      <CarePlanForm
        initial={{
          zincDays: episode.zincDays ?? null,
          fluidTargetMl: episode.fluidTargetMl ?? null,
          instructionNote: episode.instructionNote ?? null,
        }}
      />
    </Container>
  );
}
