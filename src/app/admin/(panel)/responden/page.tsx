import { Search } from "lucide-react";
import type { Metadata } from "next";
import { AccessCodeCell, RespondentRowActions } from "@/components/admin/respondent-actions";
import { Chip } from "@/components/ui/chip";
import { formatDateId, formatDateTimeId } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { logAudit } from "@/server/audit";
import { requireAdmin } from "@/server/guards";
import { listRespondents, type EvalStatus } from "@/server/queries/respondents";

export const metadata: Metadata = { title: "Responden" };

const STATUS_TONE = { Belum: "neutral", Sedang: "warning", Selesai: "success" } as const;

function EvalChip({ status }: { status: EvalStatus }) {
  return <Chip tone={STATUS_TONE[status]}>{status}</Chip>;
}

export default async function RespondentsPage(props: PageProps<"/admin/responden">) {
  const admin = await requireAdmin();
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  const rows = await listRespondents(query);
  await logAudit(admin.id, "respondent.list_view", "respondents", { query: query ? "ya" : "tidak", count: rows.length });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Responden</h1>
          <p className="text-body text-on-surface-variant">{rows.length} responden ditampilkan. Kode akses bersifat rahasia.</p>
        </div>
        <form role="search" className="relative w-full max-w-sm">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari nama, nomor HP, atau kode"
            aria-label="Cari responden"
            className="h-12 w-full rounded-full border border-primary-200 bg-surface-container pr-4 pl-12 text-body focus:border-primary-600 focus:outline-none"
          />
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant p-8 text-center text-body text-on-surface-variant">
          {query ? "Tidak ada responden yang cocok." : "Belum ada responden yang mendaftar."}
        </p>
      ) : (
        <>
          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto rounded-lg border border-outline-variant bg-surface lg:block">
            <table className="w-full text-left text-[0.9375rem]">
              <thead className="bg-surface-container text-[0.875rem] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">No. HP</th>
                  <th className="px-4 py-3 font-semibold">Kode Akses</th>
                  <th className="px-4 py-3 font-semibold">Kode Resp.</th>
                  <th className="px-4 py-3 font-semibold">Terdaftar</th>
                  <th className="px-4 py-3 font-semibold">Anak</th>
                  <th className="px-4 py-3 font-semibold">Pretest</th>
                  <th className="px-4 py-3 font-semibold">Posttest</th>
                  <th className="px-4 py-3 font-semibold">Aktif terakhir</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {rows.map((row) => (
                  <tr key={row.id} className={row.banned ? "bg-neutral-50 text-on-surface-variant" : undefined}>
                    <td className="px-4 py-3 font-semibold">
                      {row.name}
                      {row.banned && <Chip tone="danger" className="ml-2">Nonaktif</Chip>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.phoneNumber ? formatPhone(row.phoneNumber) : "–"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AccessCodeCell userId={row.id} code={row.accessCode} />
                    </td>
                    <td className="px-4 py-3">{row.respondentCode ?? "–"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateId(row.createdAt)}</td>
                    <td className="px-4 py-3">{row.childCount}</td>
                    <td className="px-4 py-3">
                      <EvalChip status={row.pretest} />
                    </td>
                    <td className="px-4 py-3">
                      <EvalChip status={row.posttest} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.lastActiveAt ? formatDateTimeId(row.lastActiveAt) : "–"}</td>
                    <td className="px-4 py-3">
                      <RespondentRowActions userId={row.id} name={row.name} banned={row.banned} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: kartu */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-lg border border-outline-variant bg-surface p-4">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {row.name}
                  {row.banned && <Chip tone="danger">Nonaktif</Chip>}
                </p>
                <p className="text-caption text-on-surface-variant">
                  {row.phoneNumber ? formatPhone(row.phoneNumber) : "–"} · {row.respondentCode ?? "–"} · {row.childCount} anak
                </p>
                <div className="mt-2">
                  <AccessCodeCell userId={row.id} code={row.accessCode} />
                </div>
                <div className="mt-2 flex gap-2 text-caption">
                  Pretest <EvalChip status={row.pretest} /> Posttest <EvalChip status={row.posttest} />
                </div>
                <div className="mt-2">
                  <RespondentRowActions userId={row.id} name={row.name} banned={row.banned} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
