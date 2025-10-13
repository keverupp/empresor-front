import { NextRequest, NextResponse } from "next/server";
import {
  getPkceCookieName,
  readPkceSession,
  sessionCookie,
  clearCookie,
} from "@/lib/auth/config";
import { exchangeCodeForTokens } from "@/lib/auth/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect("/login?error=invalid_callback");
  }

  const pkceValue = request.cookies.get(getPkceCookieName())?.value;
  const pkceSession = await readPkceSession(pkceValue);

  if (!pkceSession || pkceSession.state !== state) {
    return NextResponse.redirect("/login?error=invalid_state");
  }

  try {
    const newSession = await exchangeCodeForTokens(code, pkceSession.codeVerifier);
      const response = NextResponse.redirect(pkceSession.returnTo ?? "/dashboard");

      response.headers.append("Set-Cookie", await sessionCookie(newSession));
      response.headers.append("Set-Cookie", clearCookie(getPkceCookieName()));

      return response;
  } catch (error) {
    console.error("Auth0 callback error", error);
    return NextResponse.redirect("/login?error=auth0_callback_failed");
  }
}
