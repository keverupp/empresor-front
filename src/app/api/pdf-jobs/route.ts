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
import {
  createPdfJob,
  listPdfJobs,
} from "@/server/repositories/pdf-jobs";

export const runtime = "nodejs";

async function authenticate(request: NextRequest) {
  const cookieValue = request.cookies.get(getAuthCookieName())?.value;
  const session = await readSession(cookieValue);
  if (!session) return null;
  const refreshed = await ensureFreshSession(session);
  return { session: refreshed ?? session, refreshed: !!refreshed };
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = getUserFromSession(auth.session);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await listPdfJobs(user.sub as string);
    const response = NextResponse.json({ data: jobs });
    if (auth.refreshed) {
      response.headers.append("Set-Cookie", await sessionCookie(auth.session));
    }
    return response;
  } catch (error) {
    console.error("Failed to list pdf jobs", error);
    return NextResponse.json(
      { message: "Não foi possível carregar as solicitações de PDF" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = getUserFromSession(auth.session);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    quoteId?: string;
    s3Key?: string;
  };

  if (!body.quoteId) {
    return NextResponse.json({ message: "quoteId é obrigatório" }, { status: 400 });
  }

  try {
    const job = await createPdfJob({
      quoteId: body.quoteId,
      s3Key: body.s3Key,
      createdBy: user.sub as string,
    });
    const response = NextResponse.json(job, { status: 201 });
    if (auth.refreshed) {
      response.headers.append("Set-Cookie", await sessionCookie(auth.session));
    }
    return response;
  } catch (error) {
    console.error("Failed to create pdf job", error);
    return NextResponse.json(
      { message: "Não foi possível criar a solicitação" },
      { status: 500 }
    );
  }
}
