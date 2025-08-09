"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import {
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  formatDateForDisplay,
} from "@/lib/quote-utils";
import { Download, FileText, MoreHorizontal, Pencil } from "lucide-react";
import type { Quote } from "@/types/apiInterfaces";

type Props = {
  companyId: string;
  quote: Quote;
  onEdit: () => void;
};

export function QuoteViewHeader({ companyId, quote, onEdit }: Props) {
  const canDownload = Boolean(quote.pdf_url);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">
              Orçamento {quote.quote_number}
            </h1>
            <Badge
              variant="outline"
              className={QUOTE_STATUS_COLORS[quote.status]}
            >
              {QUOTE_STATUS_LABELS[quote.status]}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
            <span>
              Emissão: <strong>{formatDateForDisplay(quote.issue_date)}</strong>
            </span>
            <span>•</span>
            <span>
              Validade:{" "}
              <strong>
                {quote.expiry_date
                  ? formatDateForDisplay(quote.expiry_date)
                  : "-"}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {canDownload && (
                <DropdownMenuItem
                  onClick={() => {
                    // abre em nova aba o PDF
                    window.open(
                      quote.pdf_url as string,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    `/dashboard/companies/${companyId}/quotes/${quote.id}`,
                    "_self"
                  )
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Visualização pública (WIP)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Enviar por e-mail (em breve)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
