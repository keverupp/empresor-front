import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  generatePkce,
  getAuth0Config,
  pkceCookie,
} from "@/lib/auth/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getAuth0Config();
  const { codeVerifier, codeChallenge } = await generatePkce();
  const state = crypto.randomUUID();
  const screenHint = request.nextUrl.searchParams.get("screen_hint") ?? undefined;
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? undefined;

  const authorizeUrl = buildAuthorizeUrl(config, {
    state,
    codeChallenge,
    screenHint,
    returnTo,
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.headers.append(
    "Set-Cookie",
    await pkceCookie({ codeVerifier, state, returnTo, screenHint })
  );

  return response;
}
