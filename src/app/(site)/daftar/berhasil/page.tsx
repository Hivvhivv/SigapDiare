import { CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import { RegistrationSuccess } from "@/components/access-code/registration-success";
import { db } from "@/server/db";
import { requireRespondent } from "@/server/guards";
import { readableAccessCode } from "@/server/services/respondents";

export const metadata: Metadata = { title: "Pendaftaran Berhasil" };

export default async function RegistrationSuccessPage() {
  const user = await requireRespondent({ allowNoChild: true });
  const account = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { accessCodeEnc: true } });
  const code = readableAccessCode(account.accessCodeEnc);

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-10 lg:py-16">
      <div className="rounded-xl border border-outline-variant bg-surface p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <CircleCheck aria-hidden className="size-14 text-success" />
          <h1 className="text-h2 font-bold">Pendaftaran Berhasil!</h1>
          <p className="text-body text-on-surface-variant">Selamat bergabung, {user.name}. Ini kode akses untuk masuk.</p>
        </div>
        {code && <RegistrationSuccess code={code} nextHref={user.activeChildId ? "/beranda" : "/onboarding/anak"} />}
      </div>
    </div>
  );
}
