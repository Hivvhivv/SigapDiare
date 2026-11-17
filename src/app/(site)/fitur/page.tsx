import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/page-header";
import { QUICK_ACCESS } from "@/content/copy/site";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Fitur & Pemantauan" };

const FEATURE_HREFS = ["/fitur/panduan-takaran", "/fitur/checklist", "/fitur/pelacak", "/fitur/pengingat", "/evaluasi"];

export default async function FeaturesPage() {
  await requireRespondent();
  const features = QUICK_ACCESS.filter((item) => FEATURE_HREFS.includes(item.href));

  return (
    <Container>
      <PageHeader title="Fitur & Pemantauan" description="Alat bantu untuk mencegah, memantau, dan mengevaluasi." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex h-full gap-4 rounded-xl border border-outline-variant bg-surface p-5 hover:bg-surface-container">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-50">
                <Icon aria-hidden className="size-6 text-primary-600" />
              </span>
              <span>
                <span className="block text-h3 font-bold">{title}</span>
                <span className="text-body text-on-surface-variant">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
