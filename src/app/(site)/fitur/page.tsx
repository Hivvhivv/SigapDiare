import type { Metadata } from "next";
import Link from "next/link";
import { FEATURE_TONE } from "@/components/home/quick-access";
import { IconBubble, TONES } from "@/components/ui/icon-bubble";
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
      <PageHeader
        title="Fitur & Pemantauan"
        description="Alat bantu sederhana untuk menjaga si kecil tetap sehat setiap hari."
        illustration="fitur"
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link href={href} className={`flex h-full items-center gap-4 rounded-xl border p-5 ${TONES[FEATURE_TONE[href] ?? "blue"].tile}`}>
              <IconBubble Icon={Icon} tone={FEATURE_TONE[href] ?? "blue"} />
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
