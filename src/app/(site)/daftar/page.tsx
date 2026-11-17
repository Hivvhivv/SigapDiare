import type { Metadata } from "next";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthCard } from "@/components/layout/auth-card";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(isStaff(user.role) ? "/admin" : "/beranda");

  return (
    <AuthCard
      title="Daftar Akun"
      description="Untuk ayah, bunda, atau pengasuh si kecil. Cukup isi nama dan nomor HP, lalu Anda akan mendapat kode akses 8 angka untuk masuk."
    >
      <RegisterForm />
    </AuthCard>
  );
}
