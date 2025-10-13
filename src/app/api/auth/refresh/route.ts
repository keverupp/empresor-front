import { NextRequest, NextResponse } from "next/server";
import {
  getAuthCookieName,
  readSession,
  sessionCookie,
} from "@/lib/auth/config";
import { refreshTokens } from "@/lib/auth/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = readSession(cookieValue);

  if (!session || !session.refreshToken) {
    return NextResponse.json({ message: "Unable to refresh" }, { status: 401 });
  }

  try {
    const refreshed = await refreshTokens(session.refreshToken);
    const response = NextResponse.json({ success: true });
    response.headers.append("Set-Cookie", sessionCookie(refreshed));
    return response;
  } catch (error) {
    console.error("Failed to refresh tokens", error);
    return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
  }
}
