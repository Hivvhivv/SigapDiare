import type { Metadata } from "next";
import { requireAdmin } from "@/server/guards";
import { getDashboardStats } from "@/server/queries/dashboard";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="mb-6 text-h1 font-bold">Dashboard</h1>
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
