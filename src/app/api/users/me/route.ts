import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName, readSession } from "@/lib/auth/config";
import { getUserFromSession } from "@/lib/auth/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = await readSession(cookieValue);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const payload = getUserFromSession(session);
  if (!payload) {
    return NextResponse.json({ message: "Sessão inválida" }, { status: 401 });
  }

  return NextResponse.json({
    id: (payload.sub as string) ?? "",
    name:
      (payload.name as string) ||
      (payload.nickname as string) ||
      (payload.email as string) ||
      "Usuário",
    email: (payload.email as string) ?? "",
    role:
      (payload["https://empresor.com.br/roles"] as string[] | undefined)?.[0] ??
      "user",
    active_plan:
      (payload["https://empresor.com.br/active_plan"] as Record<string, unknown> | null) ??
      null,
  });
}
