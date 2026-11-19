import { ArrowRight, BookOpen, CircleCheck, Droplets, Info, Pill, Siren, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { requireRespondent } from "@/server/guards";
import { DANGER_TOPIC_SLUG, listTopicsForReader } from "@/server/queries/content";

export const metadata: Metadata = { title: "Edukasi" };

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "mengenal-diare": Info,
  pencegahan: Droplets,
  penanganan: Pill,
  "tanda-bahaya": Siren,
};

function Progress({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;
  if (done >= total) {
    return (
      <span className="inline-flex items-center gap-1.5 text-label font-semibold text-success-strong">
        <CircleCheck aria-hidden className="size-5" />
        Selesai dibaca
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-1.5">
      <span className="text-caption text-on-surface-variant">
        {done} dari {total} bagian dibaca
      </span>
      <span aria-hidden className="h-2 overflow-hidden rounded-full bg-primary-100">
        <span className="block h-full rounded-full bg-primary-600" style={{ width: `${(done / total) * 100}%` }} />
      </span>
    </span>
  );
}

export default async function EducationPage() {
  const user = await requireRespondent();
  const topics = await listTopicsForReader(user.id);

  return (
    <Container>
      <PageHeader
        title="Edukasi Kesehatan Anak"
        illustration="edukasi"
        description="Belajar pelan-pelan, sesuai waktu Ayah/Bunda: mulai dari mengenali diare, mencegahnya, sampai menanganinya."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.slug] ?? BookOpen;
          const isDangerTopic = topic.slug === DANGER_TOPIC_SLUG;
          const published = topic.status === "PUBLISHED";
          const href = isDangerTopic ? "/tanda-bahaya" : `/edukasi/${topic.slug}`;
          const card = (
            <>
              <span className="flex size-14 items-center justify-center rounded-lg bg-primary-50">
                <Icon aria-hidden className="size-7 text-primary-600" />
              </span>
              <h2 className="text-h3 font-bold">{topic.title}</h2>
              <p className="flex-1 text-body text-on-surface-variant">{topic.summary}</p>
              {published && !isDangerTopic && <Progress done={topic.doneCount} total={topic.lessonCount} />}
              {published ? (
                <span className="inline-flex items-center gap-1 text-label font-semibold text-primary-700">
                  {topic.doneCount > 0 && topic.doneCount < topic.lessonCount ? "Lanjutkan Membaca" : "Pelajari Materi"}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
              ) : (
                <Chip tone="warning">{topic.kind === "CLINICAL" ? "Sedang ditinjau tenaga kesehatan" : "Sedang disiapkan"}</Chip>
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
