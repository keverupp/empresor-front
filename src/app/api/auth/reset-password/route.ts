import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "A redefinição de senha deve ser concluída pelo link enviado por e-mail pela Auth0.",
    },
    { status: 400 }
  );
}
