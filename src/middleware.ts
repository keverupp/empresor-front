import { NextRequest, NextResponse } from "next/server";
import {
  getAuthCookieName,
  readSession,
  sessionCookie,
} from "@/lib/auth/config";
import { ensureFreshSession } from "@/lib/auth/service";

export async function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = await readSession(cookieValue);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const refreshed = await ensureFreshSession(session);
  const response = NextResponse.next();

  if (refreshed) {
    response.headers.append("Set-Cookie", await sessionCookie(refreshed));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/pdf-jobs/:path*"],
};
