import { ArrowRight, CircleCheck, PartyPopper } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DangerLink } from "@/components/education/danger-link";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { requireRespondent } from "@/server/guards";
import { DANGER_TOPIC_SLUG, getTopicForReader } from "@/server/queries/content";

export default async function TopicPage(props: PageProps<"/edukasi/[topic]">) {
  const user = await requireRespondent();
  const { topic: slug } = await props.params;
  if (slug === DANGER_TOPIC_SLUG) redirect("/tanda-bahaya");

  const topic = await getTopicForReader(slug, user.id);
  if (!topic || topic.status === "ARCHIVED") notFound();
  const search = await props.searchParams;
  const finished = search.selesai === "1" && topic.lessons.length > 0 && topic.lessons.every((l) => l.done);
  const firstUnread = topic.lessons.find((l) => !l.done) ?? topic.lessons[0];

  return (
    <Container narrow>
      <PageHeader title={topic.title} description={topic.summary} back={{ href: "/edukasi", label: "Semua Materi" }} />
      {topic.status !== "PUBLISHED" ? (
        <ComingSoon
          title={topic.kind === "CLINICAL" ? "Materi sedang ditinjau" : "Materi sedang disiapkan"}
          description="Materi ini belum diterbitkan. Sementara itu, Ayah/Bunda dapat membaca halaman Tanda Bahaya."
        />
      ) : topic.lessons.length === 0 ? (
        <ComingSoon title="Submateri sedang disiapkan" />
      ) : (
        <div className="flex flex-col gap-6">
          {finished && (
            <section aria-labelledby="summary-title" className="flex flex-col gap-4 rounded-xl border border-success-border bg-success-soft p-6">
              <div className="flex items-center gap-3">
                <PartyPopper aria-hidden className="size-8 shrink-0 text-success-strong" />
                <h2 id="summary-title" className="text-h3 font-bold">
                  Hebat! Materi ini sudah selesai dibaca
                </h2>
              </div>
              <p className="text-body">Rangkuman yang sudah Ayah/Bunda pelajari:</p>
              <ul className="flex flex-col gap-2">
                {topic.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-start gap-2 text-body">
                    <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success-strong" />
                    {lesson.title}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                {topic.nextTopic ? (
                  <ButtonLink href={`/edukasi/${topic.nextTopic.slug}`}>
                    Lanjut: {topic.nextTopic.title}
                    <ArrowRight aria-hidden className="size-5" />
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/evaluasi">Uji Pemahaman di Kuis</ButtonLink>
                )}
                <ButtonLink href="/edukasi" variant="outlined">
                  Semua Materi
                </ButtonLink>
              </div>
            </section>
          )}

          {!finished && (
            <ButtonLink href={`/edukasi/${topic.slug}/${firstUnread.slug}`} className="w-full sm:w-fit">
              {topic.lessons.some((l) => l.done) ? "Lanjutkan Membaca" : "Mulai Membaca"}
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
          )}

          <ol className="flex flex-col gap-3">
            {topic.lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <Link
                  href={`/edukasi/${topic.slug}/${lesson.slug}`}
                  className="flex min-h-14 items-center gap-3 rounded-lg border border-outline-variant bg-surface p-4 hover:bg-surface-container"
                >
                  <span
                    aria-hidden
                    className={
                      lesson.done
                        ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong"
                        : "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 font-bold text-primary-700"
                    }
                  >
                    {lesson.done ? <CircleCheck className="size-5" /> : index + 1}
                  </span>
                  <span className="flex-1 text-body font-semibold">{lesson.title}</span>
                  {lesson.done && <span className="text-caption text-success-strong">Sudah dibaca</span>}
                </Link>
              </li>
            ))}
          </ol>
          <DangerLink />
        </div>
      )}
    </Container>
  );
}
