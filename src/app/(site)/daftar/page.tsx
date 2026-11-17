import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthCard } from "@/components/layout/auth-card";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/beranda");

  return (
    <AuthCard
      title="Daftar Akun"
      description="Cukup isi nama dan nomor HP. Setelah mendaftar, Ibu akan mendapat kode akses untuk masuk."
    >
      <RegisterForm />
    </AuthCard>
  );
}
