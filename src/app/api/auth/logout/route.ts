import { NextRequest, NextResponse } from "next/server";
import {
  buildLogoutUrl,
  clearCookie,
  getAuth0Config,
  getAuthCookieName,
} from "@/lib/auth/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getAuth0Config();
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? undefined;

  const response = NextResponse.redirect(buildLogoutUrl(config, returnTo));
  response.headers.append("Set-Cookie", clearCookie(getAuthCookieName()));

  return response;
}
