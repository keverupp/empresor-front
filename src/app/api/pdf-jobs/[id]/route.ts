import { NextRequest, NextResponse } from "next/server";
import {
  getAuthCookieName,
  readSession,
  sessionCookie,
} from "@/lib/auth/config";
import {
  ensureFreshSession,
  getUserFromSession,
} from "@/lib/auth/service";
import { getPdfJob, updatePdfJob } from "@/server/repositories/pdf-jobs";

export const runtime = "nodejs";

async function authenticate(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = await readSession(cookieValue);
  if (!session) return null;
  const refreshed = await ensureFreshSession(session);
  return { session: refreshed ?? session, refreshed: !!refreshed };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = getUserFromSession(auth.session);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const job = await getPdfJob(params.id, user.sub as string);
    if (!job) {
      return NextResponse.json({ message: "Registro não encontrado" }, { status: 404 });
    }
    const response = NextResponse.json(job);
    if (auth.refreshed) {
      response.headers.append("Set-Cookie", await sessionCookie(auth.session));
    }
    return response;
  } catch (error) {
    console.error("Failed to get pdf job", error);
    return NextResponse.json(
      { message: "Não foi possível carregar o registro" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = getUserFromSession(auth.session);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    s3Key?: string | null;
  };

  try {
    const updated = await updatePdfJob(params.id, user.sub as string, {
      status: body.status,
      s3Key: body.s3Key,
    });

    if (!updated) {
      return NextResponse.json({ message: "Registro não encontrado" }, { status: 404 });
    }

    const response = NextResponse.json(updated);
    if (auth.refreshed) {
      response.headers.append("Set-Cookie", await sessionCookie(auth.session));
    }
    return response;
  } catch (error) {
    console.error("Failed to update pdf job", error);
    return NextResponse.json(
      { message: "Não foi possível atualizar o registro" },
      { status: 500 }
    );
  }
}
