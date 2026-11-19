import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EntryForm } from "@/components/tracker/entry-form";
import { utcToJakartaLocalInput } from "@/lib/dates";
import { requireRespondent } from "@/server/guards";
import { getOwnEntry } from "@/server/queries/tracker";

export const metadata: Metadata = { title: "Ubah Catatan" };

export default async function EditEntryPage(props: PageProps<"/fitur/pelacak/[id]">) {
  const user = await requireRespondent();
  const { id } = await props.params;
  const entry = await getOwnEntry(user.id, id);
  if (!entry) notFound();

  return (
    <Container narrow>
      <PageHeader title="Ubah Catatan" back={{ href: "/fitur/pelacak", label: "Catatan Diare" }} />
      <EntryForm
        initial={{
          entryId: entry.id,
          recordedAt: utcToJakartaLocalInput(entry.recordedAt),
          stoolCount: entry.stoolCount,
          consistency: entry.consistency,
          bloodInStool: entry.bloodInStool ?? null,
          vomitCount: entry.vomitCount ?? null,
          persistentVomiting: entry.persistentVomiting === true,
          drinkingAbility: entry.drinkingAbility ?? null,
          generalCondition: entry.generalCondition ?? null,
          sunkenEyes: entry.sunkenEyes === true,
          dryMouth: entry.dryMouth === true,
          worsening: entry.worsening === true,
          notes: entry.notes ?? "",
        }}
      />
    </Container>
  );
}
