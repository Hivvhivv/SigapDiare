import type { Metadata } from "next";
import { AdminRowActions } from "@/components/admin/users/admin-row-actions";
import { CreateAdminForm } from "@/components/admin/users/create-admin-form";
import { Chip } from "@/components/ui/chip";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDateTimeId } from "@/lib/dates";
import { requireSuperAdmin } from "@/server/guards";
import { listAdmins } from "@/server/queries/admins";

export const metadata: Metadata = { title: "Kelola Admin" };

export default async function ManageAdminsPage() {
  const actor = await requireSuperAdmin();
  const admins = await listAdmins();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold">Kelola Admin</h1>
        <p className="text-body text-on-surface-variant">
          Khusus Super Admin. Admin mengelola responden dan evaluasi; Super Admin juga dapat mengelola akun admin.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <ul className="flex flex-col gap-3">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className={`rounded-lg border border-outline-variant p-4 ${admin.banned ? "bg-neutral-50" : "bg-surface"}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="font-semibold">{admin.name}</p>
                <Chip tone={admin.role === "SUPER_ADMIN" ? "primary" : "secondary"}>{ROLE_LABEL[admin.role]}</Chip>
                {admin.isClinicalReviewer && <Chip tone="success">Peninjau Klinis</Chip>}
                {admin.banned && <Chip tone="danger">Nonaktif</Chip>}
                {admin.mustChangePassword && <Chip tone="warning">Password sementara</Chip>}
                {admin.id === actor.id && <Chip tone="neutral">Anda</Chip>}
              </div>
              <p className="mb-3 text-caption text-on-surface-variant">
                {admin.email} · dibuat {formatDateTimeId(admin.createdAt)}
                {admin.lastActiveAt && ` · aktif terakhir ${formatDateTimeId(admin.lastActiveAt)}`}
              </p>
              {admin.role !== "USER" && (
                <AdminRowActions
                  id={admin.id}
                  name={admin.name}
                  email={admin.email ?? ""}
                  role={admin.role}
                  banned={admin.banned}
                  isClinicalReviewer={admin.isClinicalReviewer}
                  isSelf={admin.id === actor.id}
                />
              )}
            </li>
          ))}
        </ul>
        <CreateAdminForm />
      </div>
    </div>
  );
}
