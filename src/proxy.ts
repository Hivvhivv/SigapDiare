import { NextResponse, type NextRequest } from "next/server";

// Pemeriksaan awal (tanpa database): hanya melihat ada/tidaknya cookie sesi.
// Otorisasi sebenarnya tetap dilakukan guard di server (src/server/guards.ts).
// /tanda-bahaya sengaja TIDAK dilindungi.
const SESSION_COOKIE = "sd_session";
const RESPONDENT_PREFIXES = ["/beranda", "/edukasi", "/fitur", "/evaluasi", "/faq", "/profil", "/onboarding", "/daftar/berhasil"];
const ADMIN_PUBLIC = ["/admin/masuk", "/admin/lupa-password"];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  if (matches(pathname, "/admin") && !ADMIN_PUBLIC.some((p) => matches(pathname, p))) {
    return NextResponse.redirect(new URL("/admin/masuk", request.url));
  }
  if (RESPONDENT_PREFIXES.some((p) => matches(pathname, p))) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
