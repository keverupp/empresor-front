import { NextRequest, NextResponse } from "next/server";
import { createUserInAuth0 } from "@/lib/auth/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { email, password, name } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
  }

  try {
    await createUserInAuth0({ email, password, name });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth0 register error", error);
    return NextResponse.json(
      { message: "Não foi possível criar a conta agora" },
      { status: 400 }
    );
  }
}
