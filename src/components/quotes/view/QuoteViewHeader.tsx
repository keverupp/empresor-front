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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  formatDateForDisplay,
} from "@/lib/quote-utils";
import {
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Send,
  ExternalLink,
  Copy,
  Share2,
  Hash,
  User,
  DollarSign,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  companyId: string;
  quote: Quote;
  onEdit: () => void;
};

export function QuoteViewHeader({ companyId, quote, onEdit }: Props) {
  const [copied, setCopied] = useState(false);

  // Calcular status da validade
  const getExpiryStatus = () => {
    if (!quote.expiry_date) return null;

    const today = new Date();
    const expiry = new Date(quote.expiry_date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        type: "expired",
        days: Math.abs(diffDays),
        color: "destructive",
      };
    if (diffDays <= 3)
      return { type: "expiring", days: diffDays, color: "destructive" };
    if (diffDays <= 7)
      return { type: "warning", days: diffDays, color: "secondary" };
    return { type: "valid", days: diffDays, color: "secondary" };
  };

  const expiryStatus = getExpiryStatus();

  // Obter ícone do status
  const getStatusIcon = () => {
    const statusIcons = {
      draft: FileText,
      sent: Send,
      viewed: Eye,
      accepted: CheckCircle2,
      rejected: AlertTriangle,
      invoiced: FileText,
    };

    return statusIcons[quote.status as keyof typeof statusIcons] || FileText;
  };

  const StatusIcon = getStatusIcon();

  // Calcular total do orçamento
  const calculateTotal = () => {
    const items = quote.items || [];
    const subtotal = items.reduce((sum, item) => {
      return (
        sum + (Number(item.quantity) * Number(item.unit_price_cents)) / 100
      );
    }, 0);

    // Aplicar desconto se houver
    let total = subtotal;
    if (quote.discount_type && quote.discount_value_cents) {
      if (quote.discount_type === "percentage") {
        total = subtotal * (1 - quote.discount_value_cents / 100 / 100);
      } else if (quote.discount_type === "fixed_amount") {
        total = subtotal - quote.discount_value_cents / 100;
      }
    }

    // Adicionar impostos se houver
    if (quote.tax_amount_cents) {
      total += quote.tax_amount_cents / 100;
    }

    return total;
  };

  const totalValue = calculateTotal();

  // Copiar link do orçamento
  const copyQuoteLink = async () => {
    const url = `${window.location.origin}/dashboard/companies/${companyId}/quotes/${quote.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert de validade se necessário */}
      {expiryStatus &&
        (expiryStatus.type === "expired" ||
          expiryStatus.type === "expiring") && (
          <Alert
            className={cn(
              expiryStatus.type === "expired"
                ? "border-destructive bg-destructive/5"
                : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            )}
          >
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                expiryStatus.type === "expired"
                  ? "text-destructive"
                  : "text-amber-600 dark:text-amber-400"
              )}
            />
            <AlertDescription
              className={cn(
                expiryStatus.type === "expired"
                  ? "text-destructive"
                  : "text-amber-800 dark:text-amber-200"
              )}
            >
              {expiryStatus.type === "expired"
                ? `⚠️ Este orçamento expirou há ${expiryStatus.days} ${
                    expiryStatus.days === 1 ? "dia" : "dias"
                  }.`
                : `🕐 Este orçamento expira em ${expiryStatus.days} ${
                    expiryStatus.days === 1 ? "dia" : "dias"
                  }.`}
            </AlertDescription>
          </Alert>
        )}

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header principal */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-3">
              {/* Título e status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Orçamento {quote.quote_number}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  <Badge
                    variant="outline"
                    className={QUOTE_STATUS_COLORS[quote.status]}
                  >
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </Badge>

                  {expiryStatus && expiryStatus.type === "valid" && (
                    <Badge
                      variant="outline"
                      className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Válido
                    </Badge>
                  )}
                </div>
              </div>

              {/* Informações do cliente */}
              {quote.client && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{quote.client.name}</span>
                  {quote.client.email && (
                    <>
                      <span>•</span>
                      <span>{quote.client.email}</span>
                    </>
                  )}
                </div>
              )}

              {/* Datas */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Emissão:{" "}
                    <strong className="text-foreground">
                      {formatDateForDisplay(quote.issue_date)}
                    </strong>
                  </span>
                </div>

                <span className="hidden sm:inline">•</span>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Validade:{" "}
                    <strong
                      className={cn(
                        "text-foreground",
                        expiryStatus?.type === "expired" && "text-destructive",
                        expiryStatus?.type === "expiring" &&
                          "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {quote.expiry_date
                        ? formatDateForDisplay(quote.expiry_date)
                        : "Não definida"}
                    </strong>
                  </span>
                  {expiryStatus && expiryStatus.type === "valid" && (
                    <span className="text-green-600 dark:text-green-400">
                      ({expiryStatus.days} dias restantes)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Valor total e ações */}
            <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-3">
              {/* Valor total */}
              <div className="text-right">
                <div className="flex items-center gap-2 lg:justify-end">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Valor Total
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {totalValue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
                <div className="flex items-center gap-2 lg:justify-end text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>
                    {(quote.items || []).length}{" "}
                    {(quote.items || []).length === 1 ? "item" : "itens"}
                  </span>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">Ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </DropdownMenuLabel>

                    <DropdownMenuItem onClick={copyQuoteLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Link copiado!" : "Copiar link"}
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar PDF
                    </DropdownMenuItem>

                

                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          `/dashboard/companies/${companyId}/quotes/${quote.id}/public`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualização pública
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Comunicação
                    </DropdownMenuLabel>

                    <DropdownMenuItem disabled>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por e-mail
                      <Badge variant="outline" className="ml-auto text-xs">
                        Em breve
                      </Badge>
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar contrato
                      <Badge variant="outline" className="ml-auto text-xs">
                        Em breve
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
