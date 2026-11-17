import type { Metadata } from "next";
import { Callout } from "@/components/ui/callout";
import { requireAdmin } from "@/server/guards";
import { getDashboardStats } from "@/server/queries/dashboard";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage(props: PageProps<"/admin">) {
  await requireAdmin();
  const [stats, search] = await Promise.all([getDashboardStats(), props.searchParams]);

  return (
    <div>
      <h1 className="mb-6 text-h1 font-bold">Dashboard</h1>
      {search.password === "diganti" && (
        <Callout variant="success" className="mb-6">
          Password berhasil diganti. Sesi di perangkat lain sudah dikeluarkan.
        </Callout>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="rounded-lg bg-surface-container p-5">
            <p className="text-h2 font-bold tabular-nums">{stat.value.toLocaleString("id-ID")}</p>
            <p className="text-caption text-on-surface-variant">{stat.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
