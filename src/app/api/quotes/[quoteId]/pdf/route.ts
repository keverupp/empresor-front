export const runtime = "nodejs"; // evita Edge

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { Quote, QuoteItem, QuoteClient } from "@/types/quote";
import type { Company } from "@/types/company";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

async function buildPdfPayload(quoteId: string) {
  const quote = await db<Quote>("quotes").where({ id: quoteId }).first();
  if (!quote) throw new Error("quote not found");
  const company = await db<Company>("companies")
    .where({ id: quote.company_id })
    .first();
  const client = await db<QuoteClient>("clients")
    .where({ id: quote.client_id })
    .first();
  const items = await db<QuoteItem>("quote_items").where({ quote_id: quoteId });

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
      logo: { url: company?.logo_url ?? "" },
      watermark: {
        type: "logo",
        logo: { url: company?.logo_url ?? "" },
      },
      budget: {
        number: quote.quote_number,
        validUntil: quote.expiry_date,
        status: "Em Análise",
        company: {
          name: company?.name,
          cnpj: company?.document_number,
          address: formatAddress(company),
          phone: company?.phone,
          email: company?.email,
          website: company?.website,
        },
        client: {
          name: client?.name,
          contact: client?.name,
          phone: client?.phone_number,
        },
        items: items.map((i) => ({
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

async function processJob(jobId: string, quoteId: string): Promise<string> {
  try {
    const payload = await buildPdfPayload(quoteId);
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
  _req: NextRequest,
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;
  const jobId = randomUUID();
  await db("pdf_jobs").insert({
    id: jobId,
    quote_id: quoteId,
    status: "pending",
  });
  try {
    const url = await processJob(jobId, quoteId);
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
