import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccessCodeLoginForm } from "@/components/forms/access-code-login-form";
import { AuthCard } from "@/components/layout/auth-card";
import { safeNextPath } from "@/lib/form";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage(props: PageProps<"/masuk">) {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/beranda");
  const { next } = await props.searchParams;

  return (
    <AuthCard title="Masuk ke SIGAP DIARE" description="Masukkan kode akses yang Anda terima saat mendaftar.">
      <AccessCodeLoginForm next={safeNextPath(typeof next === "string" ? next : null) ?? undefined} />
    </AuthCard>
  );
}
