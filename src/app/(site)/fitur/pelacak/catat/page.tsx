import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EntryForm } from "@/components/tracker/entry-form";
import { nowJakartaLocalInput } from "@/lib/dates";
import { requireRespondent } from "@/server/guards";
import { getActiveChild } from "@/server/queries/home";

export const metadata: Metadata = { title: "Catat Kondisi" };

export default async function NewEntryPage() {
  const user = await requireRespondent();
  const child = await getActiveChild(user);
  if (!child) return null;

  return (
    <Container narrow>
      <PageHeader
        title={`Catat Kondisi ${child.nickname}`}
        description="Yang wajib hanya jumlah BAB dan bentuk tinjanya. Bagian lain boleh dilewati."
        back={{ href: "/fitur/pelacak", label: "Catatan Diare" }}
      />
      <EntryForm
        initial={{
          entryId: null,
          recordedAt: nowJakartaLocalInput(),
          stoolCount: null,
          consistency: null,
          bloodInStool: null,
          vomitCount: null,
          persistentVomiting: false,
          drinkingAbility: null,
          generalCondition: null,
          sunkenEyes: false,
          dryMouth: false,
          worsening: false,
          notes: "",
        }}
      />
    </Container>
  );
}
