import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Tanya Jawab (FAQ)" };

export default async function FaqPage() {
  await requireRespondent();
  const items = await db.faqItem.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ category: "asc" }, { order: "asc" }] });
  const byCategory = Map.groupBy(items, (item) => item.category);

  return (
    <Container narrow>
      <PageHeader title="Tanya Jawab (FAQ)" description="Pertanyaan yang sering diajukan orang tua seputar diare dan penggunaan website." />
      {items.length === 0 && <Callout variant="info">Jawaban sedang disiapkan dan ditinjau tenaga kesehatan.</Callout>}
      <div className="flex flex-col gap-8">
        {[...byCategory].map(([category, faqs]) => (
          <section key={category}>
            <h2 className="mb-3 text-h3 font-bold">{category}</h2>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="group rounded-lg border border-outline-variant bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-[1.0625rem] font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown aria-hidden className="size-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-body whitespace-pre-line text-on-surface-variant">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
