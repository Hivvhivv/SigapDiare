import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/layout/logo";
import { canManageAdmins, ROLE_LABEL } from "@/lib/auth/roles";
import { logoutAdmin } from "@/server/actions/auth";
import { requireAdmin } from "@/server/guards";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Halaman masing-masing tetap memanggil requireAdmin(); layout membolehkan halaman ganti password.
  const admin = await requireAdmin({ allowPasswordChange: true });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-neutral-800 text-white">
        <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <LogoMark className="size-8" />
            <span className="font-bold">SIGAP DIARE · Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.9375rem] text-neutral-300 sm:inline">
              {admin.email ?? admin.name} · {ROLE_LABEL[admin.role]}
            </span>
            <form action={logoutAdmin}>
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.9375rem] font-semibold hover:bg-white/10">
                <LogOut aria-hidden className="size-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="border-b border-outline-variant bg-surface-container p-3 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:p-4">
          <AdminNav isSuperAdmin={canManageAdmins(admin.role)} />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
