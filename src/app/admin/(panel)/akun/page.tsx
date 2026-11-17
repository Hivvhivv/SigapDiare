import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/admin/users/change-password-form";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { requireAdmin } from "@/server/guards";

export const metadata: Metadata = { title: "Akun Saya" };

export default async function MyAccountPage() {
  const admin = await requireAdmin({ allowPasswordChange: true });

  return (
    <div className="flex max-w-[560px] flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold">Akun Saya</h1>
        <p className="flex flex-wrap items-center gap-2 text-body text-on-surface-variant">
          {admin.name} · {admin.email}
          <Chip tone={admin.role === "SUPER_ADMIN" ? "primary" : "secondary"}>{ROLE_LABEL[admin.role]}</Chip>
        </p>
      </div>
      {admin.mustChangePassword && (
        <Callout variant="warning" title="Ganti password sementara">
          Akun Anda masih memakai password sementara. Buat password baru sebelum memakai panel admin.
        </Callout>
      )}
      <section className="rounded-xl border border-outline-variant bg-surface p-5">
        <h2 className="mb-4 text-h3 font-bold">Ganti Password</h2>
        <ChangePasswordForm minLength={MIN_ADMIN_PASSWORD_LENGTH} />
      </section>
    </div>
  );
}
