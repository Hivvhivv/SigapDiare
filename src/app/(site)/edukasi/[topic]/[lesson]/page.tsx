import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DangerLink } from "@/components/education/danger-link";
import { LessonContent } from "@/components/education/lesson-content";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Button, buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { completeLesson } from "@/server/actions/education";
import { logActivity } from "@/server/audit";
import { requireRespondent } from "@/server/guards";
import { getLessonForReader } from "@/server/queries/content";

export async function generateMetadata(props: PageProps<"/edukasi/[topic]/[lesson]">): Promise<Metadata> {
  const { topic, lesson } = await props.params;
  const data = await getLessonForReader(topic, lesson);
  return { title: data?.lesson.title ?? "Edukasi" };
}

export default async function LessonPage(props: PageProps<"/edukasi/[topic]/[lesson]">) {
  const user = await requireRespondent();
  const params = await props.params;
  const data = await getLessonForReader(params.topic, params.lesson);
  if (!data) notFound();
  const { topic, lesson, position, total, previous, next } = data;
  await logActivity(user.id, "lesson.view", lesson.id);

  return (
    <Container narrow>
      <PageHeader title={lesson.title} back={{ href: `/edukasi/${topic.slug}`, label: topic.title }}>
        <div className="flex flex-col gap-2">
          <p className="text-label font-semibold text-primary-700">
            Bagian {position} dari {total}
          </p>
          <div
            role="progressbar"
            aria-label="Posisi bacaan"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={position}
            className="h-2 overflow-hidden rounded-full bg-primary-100"
          >
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${(position / total) * 100}%` }} />
          </div>
        </div>
      </PageHeader>

      <article className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface p-5 sm:p-8">
        <LessonContent blocks={lesson.blocks} />
        {lesson.kind === "CLINICAL" && (
          <Callout variant="disclaimer">
            Informasi ini sudah ditinjau tenaga kesehatan, tetapi bukan alat diagnosis atau pengganti pemeriksaan. Ikuti petunjuk
            dokter/bidan/perawat yang memeriksa anak.
          </Callout>
        )}
        {lesson.references.length > 0 && (
          <div className="border-t border-outline-variant pt-4">
            <p className="text-label font-semibold">Sumber</p>
            <ul className="mt-1 list-disc pl-5 text-caption text-on-surface-variant">
              {lesson.references.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <nav aria-label="Navigasi submateri" className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link href={`/edukasi/${topic.slug}/${previous.slug}`} className={buttonClass("outlined")}>
            <ArrowLeft aria-hidden className="size-5" />
            Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        <form action={completeLesson}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <Button type="submit" className="w-full sm:w-auto">
            {next ? (
              <>
                Sudah Paham, Lanjut
                <ArrowRight aria-hidden className="size-5" />
              </>
            ) : (
              <>
                <Check aria-hidden className="size-5" />
                Selesai Membaca
              </>
            )}
          </Button>
        </form>
      </nav>

      <div className="mt-6">
        <DangerLink />
      </div>
    </Container>
  );
}
