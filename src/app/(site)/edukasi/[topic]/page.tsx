import { notFound, redirect } from "next/navigation";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Container, PageHeader } from "@/components/layout/page-header";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";

export default async function TopicPage(props: PageProps<"/edukasi/[topic]">) {
  await requireRespondent();
  const { topic: slug } = await props.params;
  if (slug === "tanda-bahaya") redirect("/tanda-bahaya");

  const topic = await db.topic.findUnique({
    where: { slug },
    include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } },
  });
  if (!topic) notFound();

  return (
    <Container narrow>
      <PageHeader title={topic.title} description={topic.summary} back={{ href: "/edukasi", label: "Semua Materi" }} />
      {topic.status !== "PUBLISHED" ? (
        <ComingSoon
          title="Materi sedang ditinjau"
          description="Materi ini sedang ditinjau tenaga kesehatan sebelum diterbitkan. Sementara itu, Ibu dapat membaca halaman Tanda Bahaya."
        />
      ) : topic.lessons.length === 0 ? (
        <ComingSoon title="Submateri sedang disiapkan" />
      ) : (
        <ol className="flex flex-col gap-3">
          {topic.lessons.map((lesson, index) => (
            <li key={lesson.id} className="rounded-lg border border-outline-variant bg-surface p-4 text-body font-semibold">
              {index + 1}. {lesson.title}
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
