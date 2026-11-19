import { Lightbulb } from "lucide-react";
import Image from "next/image";
import type { LessonBlock } from "@/lib/content/lesson-body";

/** Isi submateri. Dipakai halaman baca responden dan pratinjau admin. */
export function LessonContent({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="flex flex-col gap-5 text-body leading-relaxed">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="mt-2 text-h3 font-bold text-on-surface">
                {block.text}
              </h2>
            );
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "list":
            return (
              <ul key={index} className="flex list-disc flex-col gap-2 pl-6 marker:text-primary-600">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={index} className="flex flex-col gap-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-label font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5">
                      <span className="sr-only">Langkah {i + 1}: </span>
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <aside key={index} className="flex gap-3 rounded-lg border-l-4 border-tertiary-500 bg-tertiary-50 p-4">
                <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-tertiary-700" />
                <p>
                  <span className="font-semibold">Penting: </span>
                  {block.text}
                </p>
              </aside>
            );
          case "image":
            return (
              <figure key={index} className="flex flex-col gap-2">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={1200}
                  height={900}
                  unoptimized={block.src.endsWith(".svg")}
                  sizes="(min-width: 768px) 672px, 100vw"
                  className="h-auto w-full rounded-lg bg-surface-container"
                />
                <figcaption className="text-caption text-on-surface-variant">{block.alt}</figcaption>
              </figure>
            );
        }
      })}
    </div>
  );
}
