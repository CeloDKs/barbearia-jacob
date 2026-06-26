import { NextResponse, type NextRequest } from "next/server";
import { verificarToken } from "@/lib/jwt";

const SESSION_COOKIE = "bj_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const sessao = token ? await verificarToken(token) : null;

  const ehLogin = pathname === "/admin/login";

  if (!sessao && !ehLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (sessao && ehLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
