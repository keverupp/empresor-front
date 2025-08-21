export const runtime = "nodejs"; // evita Edge

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { Quote } from "@/types/apiInterfaces";
import type { Company } from "@/types/company";
import { appConfig } from "@/config/app";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

async function buildPdfPayload(companyId: string, quoteId: string) {
  const baseUrl =
    process.env.API_BASE_URL ?? appConfig.development.api.baseURL;
  const quoteRes = await fetch(
    `${baseUrl}/companies/${companyId}/quotes/${quoteId}`
  );
  if (!quoteRes.ok) throw new Error("quote fetch failed");
  const quote = (await quoteRes.json()) as Quote;

  const companyRes = await fetch(`${baseUrl}/companies/${companyId}`);
  if (!companyRes.ok) throw new Error("company fetch failed");
  const company = (await companyRes.json()) as Company;

  const formatAddress = (c?: Company) => {
    const addr = c?.address ?? {};
    return [
      addr.street,
      addr.number,
      addr.neighborhood,
      addr.city,
      addr.state,
      addr.zip_code,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return {
    type: "budget-premium",
    title: "ORÇAMENTO PREMIUM",
    data: {
      logo: { url: company.logo_url ?? "" },
      watermark: {
        type: "logo",
        logo: { url: company.logo_url ?? "" },
      },
      budget: {
        number: quote.quote_number,
        validUntil: quote.expiry_date,
        status: "Em Análise",
        company: {
          name: company.name,
          cnpj: company.document_number,
          address: formatAddress(company),
          phone: company.phone,
          email: company.email,
          website: company.website,
        },
        client: {
          name: quote.client.name,
          contact: quote.client.name,
          phone: quote.client.phone_number ?? undefined,
        },
        items: quote.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unit_price_cents / 100,
        })),
        discount: (quote.discount_value_cents ?? 0) / 100,
        notes: quote.notes ?? "",
        terms: quote.terms_and_conditions_content ?? "",
      },
    },
    config: {
      format: "A4",
      orientation: "portrait",
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    },
  };
}

async function processJob(
  jobId: string,
  companyId: string,
  quoteId: string
): Promise<string> {
  try {
    const payload = await buildPdfPayload(companyId, quoteId);
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

    return `${process.env.S3_PUBLIC_URL ?? ""}/${key}`;
  } catch (err) {
    console.error("processJob failed", err);
    await db("pdf_jobs")
      .where({ id: jobId })
      .update({ status: "failed", updated_at: new Date() });
    throw err;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId)
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  const jobId = randomUUID();
  await db("pdf_jobs").insert({
    id: jobId,
    quote_id: quoteId,
    status: "pending",
  });
  try {
    const url = await processJob(jobId, companyId, quoteId);
    return NextResponse.json({ jobId, url }, { status: 200 });
  } catch {
    return NextResponse.json({ jobId, status: "failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;
  const jobId = req.nextUrl.searchParams.get("jobId");
  let query = db("pdf_jobs").where({ quote_id: quoteId });
  if (jobId) query = query.andWhere({ id: jobId });
  const job = await query.first();
  if (!job) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const url = job.s3_key
    ? `${process.env.S3_PUBLIC_URL ?? ""}/${job.s3_key}`
    : undefined;
  return NextResponse.json({ status: job.status, url });
}
