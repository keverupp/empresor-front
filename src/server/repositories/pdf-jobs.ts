import { randomUUID } from "crypto";
import { db } from "@/server/db/client";

export interface PdfJob {
  id: string;
  quote_id: string;
  status: string;
  s3_key?: string | null;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string | null;
}

export interface CreatePdfJobInput {
  quoteId: string;
  s3Key?: string;
  createdBy: string;
}

export interface UpdatePdfJobInput {
  status?: string;
  s3Key?: string | null;
}

const TABLE = "pdf_jobs";

export const listPdfJobs = async (userId: string): Promise<PdfJob[]> => {
  return db<PdfJob>(TABLE).where({ created_by: userId }).orderBy("created_at", "desc");
};

export const getPdfJob = async (id: string, userId: string): Promise<PdfJob | undefined> => {
  return db<PdfJob>(TABLE).where({ id, created_by: userId }).first();
};

export const createPdfJob = async (
  input: CreatePdfJobInput
): Promise<PdfJob> => {
  const now = new Date();
  const job: PdfJob = {
    id: randomUUID(),
    quote_id: input.quoteId,
    status: "pending",
    s3_key: input.s3Key ?? null,
    created_at: now,
    updated_at: now,
    created_by: input.createdBy,
  };

  await db<PdfJob>(TABLE).insert({
    id: job.id,
    quote_id: job.quote_id,
    status: job.status,
    s3_key: job.s3_key,
    created_at: job.created_at,
    updated_at: job.updated_at,
    created_by: job.created_by,
  });

  return job;
};

export const updatePdfJob = async (
  id: string,
  userId: string,
  input: UpdatePdfJobInput
): Promise<PdfJob | null> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (input.status) patch.status = input.status;
  if (input.s3Key !== undefined) patch.s3_key = input.s3Key;

  const updated = await db<PdfJob>(TABLE)
    .where({ id, created_by: userId })
    .update(patch)
    .returning("*");

  return updated[0] ?? null;
};
