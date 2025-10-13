import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName, readSession, sessionCookie } from "@/lib/auth/config";
import {
  ensureFreshSession,
  getUserFromSession,
} from "@/lib/auth/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = await readSession(cookieValue);

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const refreshed = await ensureFreshSession(session);
  const effectiveSession = refreshed ?? session;

  const user = getUserFromSession(effectiveSession);
  if (!user) {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }

  const response = NextResponse.json({
    user,
    tokens: {
      accessToken: effectiveSession.accessToken,
      refreshToken: effectiveSession.refreshToken ?? null,
    },
  });

  if (refreshed) {
      response.headers.append("Set-Cookie", await sessionCookie(refreshed));
  }

  return response;
}
