import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { LogoMark } from "@/components/layout/logo";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Login Admin" };

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") redirect("/admin");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-neutral-800 text-white">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 lg:px-8">
          <LogoMark className="size-8" />
          <span className="font-bold">SIGAP DIARE · Admin</span>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-[400px] rounded-xl border border-outline-variant bg-surface p-6 sm:p-8">
          <h1 className="mb-1 text-h2 font-bold">Login Admin</h1>
          <p className="mb-6 text-body text-on-surface-variant">Khusus pengelola dan peneliti SIGAP DIARE.</p>
          <AdminLoginForm />
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-caption text-on-surface-variant hover:underline">
            <ArrowLeft aria-hidden className="size-4" />
            Kembali ke website
          </Link>
        </div>
      </main>
    </div>
  );
}
