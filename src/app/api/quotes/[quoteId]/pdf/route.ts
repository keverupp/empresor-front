export const runtime = "nodejs"; // evita Edge

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

async function processJob(
  jobId: string,
  quoteId: string,
  payload: unknown
): Promise<void> {
  try {
    const response = await fetch(
      process.env.PDF_API_URL ?? "http://pdf.empresor.com.br/pdf",
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

    const buffer = Buffer.from(await response.arrayBuffer());
    const key = `quotes/${quoteId}.pdf`;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
        })
      );
    } catch {
      // ignore delete errors
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    await db("pdf_jobs")
      .where({ id: jobId })
      .update({ status: "completed", s3_key: key, updated_at: new Date() });
  } catch {
    await db("pdf_jobs")
      .where({ id: jobId })
      .update({ status: "failed", updated_at: new Date() });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  const payload = await req.json().catch(() => undefined);
  const jobId = randomUUID();
  await db("pdf_jobs").insert({
    id: jobId,
    quote_id: params.quoteId,
    status: "pending",
  });
  void processJob(jobId, params.quoteId, payload);
  return NextResponse.json({ jobId }, { status: 202 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  let query = db("pdf_jobs").where({ quote_id: params.quoteId });
  if (jobId) query = query.andWhere({ id: jobId });
  const job = await query.first();
  if (!job) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const url = job.s3_key
    ? `${process.env.S3_PUBLIC_URL ?? ""}/${job.s3_key}`
    : undefined;
  return NextResponse.json({ status: job.status, url });
}
