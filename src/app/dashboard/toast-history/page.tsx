"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconExternalLink,
  IconHistory,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PDF_TOAST_HISTORY_EVENT,
  PDF_TOAST_HISTORY_STORAGE_KEY,
  clearPdfToastHistory,
  getPdfToastHistory,
  removePdfToastHistoryEntry,
  type PdfToastHistoryEntry,
} from "@/utils/pdfToastHistory";

function formatIdentifier(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default function ToastHistoryPage() {
  const [history, setHistory] = useState<PdfToastHistoryEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  );

  useEffect(() => {
    const loadHistory = () => {
      setHistory(getPdfToastHistory());
      setIsReady(true);
    };

    loadHistory();

    const historyListener: EventListener = () => loadHistory();
    const storageListener = (event: StorageEvent) => {
      if (event.key === PDF_TOAST_HISTORY_STORAGE_KEY) {
        loadHistory();
      }
    };

    window.addEventListener(PDF_TOAST_HISTORY_EVENT, historyListener);
    window.addEventListener("storage", storageListener);

    return () => {
      window.removeEventListener(PDF_TOAST_HISTORY_EVENT, historyListener);
      window.removeEventListener("storage", storageListener);
    };
  }, []);

  const handleRefresh = () => {
    setHistory(getPdfToastHistory());
    setIsReady(true);
  };

  const handleClear = () => {
    clearPdfToastHistory();
    setHistory([]);
  };

  const handleRemove = (id: string) => {
    removePdfToastHistoryEntry(id);
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  const hasEntries = history.length > 0;

  return (
    <DashboardLayout
      title="Histórico de Toasts"
      description="Acompanhe todos os PDFs gerados através dos toasts de orçamento. Os registros ficam salvos somente neste navegador."
    >
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Card>
          <CardHeader className="border-b pb-6">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <IconHistory className="size-5" />
                Histórico recente
              </CardTitle>
              <CardDescription>
                Cada PDF gerado pelo Empresor é registrado automaticamente.
              </CardDescription>
            </div>
            <CardAction className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={!isReady && !hasEntries}
              >
                <IconRefresh className="size-4" />
                Atualizar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!hasEntries}
                className="text-muted-foreground hover:text-destructive"
              >
                <IconTrash className="size-4" />
                Limpar tudo
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="py-6">
            {hasEntries ? (
              <ul className="flex flex-col gap-4">
                {history.map((entry) => {
                  const createdAt = dateFormatter.format(new Date(entry.createdAt));
                  let host = entry.url;
                  try {
                    const parsed = new URL(entry.url);
                    host = parsed.hostname;
                  } catch {
                    // manter url completa caso não seja válida
                  }

                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold sm:text-base">
                            {entry.title}
                          </span>
                          <Badge variant="outline" className="uppercase text-[10px]">
                            PDF
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="font-medium">
                            Orçamento {formatIdentifier(entry.quoteId)}
                          </Badge>
                          <Badge variant="outline" className="font-medium">
                            Empresa {formatIdentifier(entry.companyId)}
                          </Badge>
                          <span>{createdAt}</span>
                          <span className="truncate">{host}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild type="button" variant="outline" size="sm">
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <IconExternalLink className="size-4" />
                            Abrir PDF
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(entry.id)}
                        >
                          <IconX className="size-4" />
                          Remover
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
                <IconHistory className="size-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nenhum PDF registrado ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Gere um PDF de orçamento para ver os registros aparecerem aqui.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
