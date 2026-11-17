import { BottomNav } from "@/components/layout/nav-links";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSessionUser } from "@/server/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const respondent = user?.role === "USER" ? user : null;

  return (
    <>
      <SiteHeader user={respondent ? { name: respondent.name } : null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {respondent && (
        <>
          <div aria-hidden className="h-24 lg:hidden" />
          <BottomNav />
        </>
      )}
    </>
  );
}
