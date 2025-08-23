// _components/ClientTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  User,
  Mail,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { formatDateForDisplay } from "@/lib/quote-utils";
import type { QuoteFormData } from "@/lib/quote-schemas";
import type { UseFormReturn } from "react-hook-form";
import type { Quote } from "@/types/apiInterfaces";
import { cn } from "@/lib/utils";

export function ClientTab({
  form,
  quote,
}: {
  form: UseFormReturn<QuoteFormData>;
  quote: Quote;
}) {
  // Verificar se os campos obrigatórios estão preenchidos
  const quoteNumber = form.watch("quote_number");
  const expiryDate = form.watch("expiry_date");

  const isQuoteNumberValid = quoteNumber && quoteNumber.trim().length > 0;
  const isExpiryDateValid = expiryDate && new Date(expiryDate) > new Date();

  // Calcular dias restantes até o vencimento
  const getDaysUntilExpiry = () => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  // Status do orçamento
  const getExpiryStatus = () => {
    if (!daysUntilExpiry) return null;
    if (daysUntilExpiry < 0)
      return {
        type: "expired",
        label: "Expirado",
        variant: "destructive" as const,
      };
    if (daysUntilExpiry <= 3)
      return {
        type: "expiring",
        label: "Expirando em breve",
        variant: "destructive" as const,
      };
    if (daysUntilExpiry <= 7)
      return {
        type: "warning",
        label: "Próximo ao vencimento",
        variant: "secondary" as const,
      };
    return { type: "valid", label: "Válido", variant: "secondary" as const };
  };

  const expiryStatus = getExpiryStatus();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com status do cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Informações do Cliente</h3>
            <p className="text-sm text-muted-foreground">
              Dados principais do orçamento
            </p>
          </div>
        </div>

        {expiryStatus && (
          <Badge variant={expiryStatus.variant} className="w-fit">
            <Clock className="h-3 w-3 mr-1" />
            {expiryStatus.label}
          </Badge>
        )}
      </div>

      {/* Alert de vencimento */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
        <Alert
          className={cn(
            daysUntilExpiry < 0
              ? "border-destructive bg-destructive/5"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          )}
        >
          <AlertCircle
            className={cn(
              "h-4 w-4",
              daysUntilExpiry < 0
                ? "text-destructive"
                : "text-amber-600 dark:text-amber-400"
            )}
          />
          <AlertDescription
            className={cn(
              daysUntilExpiry < 0
                ? "text-destructive"
                : "text-amber-800 dark:text-amber-200"
            )}
          >
            {daysUntilExpiry < 0
              ? `Este orçamento expirou há ${Math.abs(daysUntilExpiry)} ${
                  Math.abs(daysUntilExpiry) === 1 ? "dia" : "dias"
                }.`
              : `Este orçamento expira em ${daysUntilExpiry} ${
                  daysUntilExpiry === 1 ? "dia" : "dias"
                }.`}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Informações do Cliente */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </Label>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-background rounded-md">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {quote.client?.name ?? "Cliente não informado"}
                      </h4>
                      {quote.client?.name && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                    </div>

                    {quote.client?.email ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{quote.client.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>Email não cadastrado</span>
                      </div>
                    )}

                    {quote.client?.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>📞</span>
                        <span>{quote.client.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Data de Emissão */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Emissão
              </Label>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDateForDisplay(quote.issue_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações do Orçamento */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <Label
                htmlFor="quote_number"
                className="text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Hash className="h-4 w-4" />
                Número do Orçamento *
              </Label>
              <div className="relative">
                <Input
                  id="quote_number"
                  {...form.register("quote_number")}
                  placeholder="Ex: ORC-2024-001"
                  className={cn(
                    "pr-10",
                    isQuoteNumberValid
                      ? "border-green-200 dark:border-green-800"
                      : "border-muted-foreground/20"
                  )}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {isQuoteNumberValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              {!isQuoteNumberValid && (
                <p className="text-xs text-muted-foreground mt-1">
                  Campo obrigatório para identificação
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="expiry_date"
                className="text-sm font-medium mb-2 flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Data de Validade *
              </Label>
              <div className="relative">
                <Input
                  id="expiry_date"
                  type="date"
                  {...form.register("expiry_date")}
                  className={cn(
                    "pr-10",
                    isExpiryDateValid
                      ? "border-green-200 dark:border-green-800"
                      : "border-muted-foreground/20"
                  )}
                  min={new Date().toISOString().split("T")[0]}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {isExpiryDateValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {daysUntilExpiry !== null && isExpiryDateValid && (
                <p className="text-xs text-muted-foreground mt-1">
                  {daysUntilExpiry > 0
                    ? `Válido por mais ${daysUntilExpiry} ${
                        daysUntilExpiry === 1 ? "dia" : "dias"
                      }`
                    : "Data já passou"}
                </p>
              )}

              {!isExpiryDateValid && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione uma data futura
                </p>
              )}
            </div>

            {/* Status Summary */}
            <div className="p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status dos Campos</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Número do orçamento</span>
                  {isQuoteNumberValid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Data de validade</span>
                  {isExpiryDateValid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Dados do cliente</span>
                  {quote.client?.name ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dicas úteis */}
      <div className="p-4 bg-muted/20 rounded-lg border border-dashed">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="text-sm font-medium mb-1">Dicas importantes</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • Use números sequenciais para facilitar o controle (ex:
                ORC-2024-001)
              </li>
              <li>
                • Defina prazos de validade realistas, considerando negociação e
                aprovação
              </li>
              <li>• Mantenha os dados do cliente sempre atualizados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
