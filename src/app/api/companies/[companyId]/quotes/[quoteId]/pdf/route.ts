export const runtime = "nodejs"; // evita Edge

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

async function processJob(
  jobId: string,
  companyId: string,
  quoteId: string,
  authHeader?: string | null
): Promise<void> {
  try {
    // Fetch PDF data from backend API
    const dataRes = await fetch(
      `${process.env.API_URL ?? ""}/api/companies/${companyId}/quotes/${quoteId}/pdf-data`,
      {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      }
    );

    if (!dataRes.ok) throw new Error("pdf-data error");

    const payload = await dataRes.json();

    // Call PDF service
    const response = await fetch(
      process.env.PDF_API_URL ?? "https://pdf.empresor.com.br/pdf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.PDF_API_KEY ?? "",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("pdf service error");

    const { url } = (await response.json()) as { url: string };

    await db("pdf_jobs")
      .where({ id: jobId })
      .update({ status: "completed", s3_key: url, updated_at: new Date() });
  } catch {
    await db("pdf_jobs")
      .where({ id: jobId })
      .update({ status: "failed", updated_at: new Date() });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string; quoteId: string } }
) {
  const jobId = randomUUID();
  await db("pdf_jobs").insert({
    id: jobId,
    quote_id: params.quoteId,
    status: "pending",
  });
  const authHeader = req.headers.get("authorization");
  void processJob(jobId, params.companyId, params.quoteId, authHeader);
  return NextResponse.json({ jobId }, { status: 202 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string; quoteId: string } }
) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  let query = db("pdf_jobs").where({ quote_id: params.quoteId });
  if (jobId) query = query.andWhere({ id: jobId });
  const job = await query.first();
  if (!job) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const url = job.s3_key || undefined;
  return NextResponse.json({ status: job.status, url });
}
