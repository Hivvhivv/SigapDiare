import { ArrowRight, BookOpen, Droplets, Info, Pill, Siren, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";

export const metadata: Metadata = { title: "Edukasi" };

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "mengenal-diare": Info,
  pencegahan: Droplets,
  penanganan: Pill,
  "tanda-bahaya": Siren,
};

export default async function EducationPage() {
  await requireRespondent();
  const topics = await db.topic.findMany({ orderBy: { order: "asc" } });

  return (
    <Container>
      <PageHeader
        title="Edukasi Kesehatan Anak"
        description="Belajar pelan-pelan, sesuai waktu Ayah/Bunda: mulai dari mengenali diare, mencegahnya, sampai menanganinya."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.slug] ?? BookOpen;
          const published = topic.status === "PUBLISHED";
          const href = topic.slug === "tanda-bahaya" ? "/tanda-bahaya" : `/edukasi/${topic.slug}`;
          const card = (
            <>
              <span className="flex size-14 items-center justify-center rounded-lg bg-primary-50">
                <Icon aria-hidden className="size-7 text-primary-600" />
              </span>
              <h2 className="text-h3 font-bold">{topic.title}</h2>
              <p className="flex-1 text-body text-on-surface-variant">{topic.summary}</p>
              {published ? (
                <span className="inline-flex items-center gap-1 text-label font-semibold text-primary-700">
                  Pelajari Materi <ArrowRight aria-hidden className="size-4" />
                </span>
              ) : (
                <Chip tone="warning">Sedang ditinjau tenaga kesehatan</Chip>
              )}
            </>
          );
          return (
            <li key={topic.id}>
              {published ? (
                <Link href={href} className="flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-6 hover:bg-surface-container">
                  {card}
                </Link>
              ) : (
                <div className="flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-6 opacity-80">{card}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
