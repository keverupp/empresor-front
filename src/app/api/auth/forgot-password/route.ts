import { NextRequest, NextResponse } from "next/server";
import { requestPasswordResetEmail } from "@/lib/auth/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { email } = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  if (!email) {
    return NextResponse.json({ message: "Email é obrigatório" }, { status: 400 });
  }

  try {
    await requestPasswordResetEmail(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth0 forgot password error", error);
    return NextResponse.json(
      { message: "Não foi possível enviar o e-mail de recuperação" },
      { status: 400 }
    );
  }
}
