// src/utils/pdfToastHistory.ts
"use client";

export const PDF_TOAST_HISTORY_STORAGE_KEY = "empresor_pdf_toast_history";
export const PDF_TOAST_HISTORY_EVENT = "empresor:pdf-toast-history";

const MAX_HISTORY_ENTRIES = 50;

export interface PdfToastHistoryEntry {
  id: string;
  companyId: string;
  quoteId: string;
  title: string;
  url: string;
  createdAt: string;
}

type PdfToastHistoryEventDetail =
  | { type: "added"; entry: PdfToastHistoryEntry }
  | { type: "removed"; id: string }
  | { type: "cleared" };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParseHistory(value: string | null): PdfToastHistoryEntry[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (
          !item ||
          typeof item !== "object" ||
          typeof item.url !== "string" ||
          typeof item.quoteId !== "string" ||
          typeof item.companyId !== "string"
        ) {
          return null;
        }

        return {
          id: typeof item.id === "string" ? item.id : createId(),
          companyId: item.companyId,
          quoteId: item.quoteId,
          title: typeof item.title === "string" ? item.title : "PDF gerado",
          url: item.url,
          createdAt:
            typeof item.createdAt === "string"
              ? item.createdAt
              : new Date().toISOString(),
        } satisfies PdfToastHistoryEntry;
      })
      .filter((entry): entry is PdfToastHistoryEntry => Boolean(entry));
  } catch (error) {
    console.error("Erro ao ler histórico de PDFs do localStorage:", error);
    return [];
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dispatchHistoryEvent(detail: PdfToastHistoryEventDetail) {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent<PdfToastHistoryEventDetail>(PDF_TOAST_HISTORY_EVENT, {
      detail,
    }),
  );
}

export function getPdfToastHistory(): PdfToastHistoryEntry[] {
  if (!isBrowser()) return [];

  const stored = localStorage.getItem(PDF_TOAST_HISTORY_STORAGE_KEY);
  const history = safeParseHistory(stored);

  return history
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function addPdfToastHistoryEntry(
  entry: Omit<PdfToastHistoryEntry, "id" | "createdAt"> & {
    createdAt?: string;
  },
): void {
  if (!isBrowser()) return;

  const history = getPdfToastHistory();

  const newEntry: PdfToastHistoryEntry = {
    id: createId(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
    ...entry,
  };

  const updated = [newEntry, ...history]
    .slice(0, MAX_HISTORY_ENTRIES)
    .map((item, index, array) => {
      // Evitar duplicatas consecutivas pelo mesmo URL
      if (index === 0) return item;
      const prev = array[index - 1];
      if (item.url === prev.url && item.createdAt === prev.createdAt) {
        return { ...item, id: createId() };
      }
      return item;
    });

  try {
    localStorage.setItem(
      PDF_TOAST_HISTORY_STORAGE_KEY,
      JSON.stringify(updated),
    );
    dispatchHistoryEvent({ type: "added", entry: newEntry });
  } catch (error) {
    console.error("Erro ao salvar histórico de PDFs:", error);
  }
}

export function clearPdfToastHistory(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(PDF_TOAST_HISTORY_STORAGE_KEY);
    dispatchHistoryEvent({ type: "cleared" });
  } catch (error) {
    console.error("Erro ao limpar histórico de PDFs:", error);
  }
}

export function removePdfToastHistoryEntry(id: string): void {
  if (!isBrowser()) return;

  const history = getPdfToastHistory();
  const updated = history.filter((entry) => entry.id !== id);

  try {
    localStorage.setItem(
      PDF_TOAST_HISTORY_STORAGE_KEY,
      JSON.stringify(updated),
    );
    dispatchHistoryEvent({ type: "removed", id });
  } catch (error) {
    console.error("Erro ao remover item do histórico de PDFs:", error);
  }
}
