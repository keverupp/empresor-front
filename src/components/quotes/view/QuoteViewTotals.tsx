"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Receipt,
  FileText,
  MessageSquare,
  Copy,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/quote-utils";
import type { Quote } from "@/types/apiInterfaces";
import { useState } from "react";

type Props = {
  quote: Quote;
};

export function QuoteViewTotals({ quote }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const subtotal = quote.subtotal_cents ?? 0;
  const discount = quote.discount_value_cents ?? 0;
  const tax = quote.tax_amount_cents ?? 0;
  const total = quote.total_amount_cents ?? subtotal - discount + tax;

  // Calcular porcentagens
  const discountPercentage =
    subtotal > 0 ? (Math.abs(discount) / subtotal) * 100 : 0;
  const taxPercentage = total > 0 ? (tax / total) * 100 : 0;

  // Calcular porcentagens básicas
  const hasDiscount = discount > 0;
  const hasTax = tax > 0;

  // Função para copiar valores
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com resumo executivo */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Calculator className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Resumo Financeiro</h3>
              <p className="text-sm text-muted-foreground">
                Valores e condições do orçamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasDiscount && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-red-600 dark:text-red-400"
              >
                <TrendingDown className="h-3 w-3" />
                {discountPercentage.toFixed(0)}% desconto
              </Badge>
            )}

            {hasTax && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Impostos inclusos
              </Badge>
            )}
          </div>
        </div>

        {/* Valor total destacado */}
        <div className="text-center py-2">
          <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(total)}
          </div>
          <div className="text-xs text-muted-foreground">
            {quote.items?.length || 0}{" "}
            {(quote.items?.length || 0) === 1 ? "item" : "itens"}
          </div>
        </div>
      </div>

      {/* Card principal com breakdown */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">Breakdown de Valores</h2>
        </div>

        <div className="space-y-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-medium">Subtotal</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(formatCurrency(subtotal), "subtotal")
                }
                className="h-6 w-6 p-0"
              >
                {copiedField === "subtotal" ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(subtotal)}</div>
              <div className="text-xs text-muted-foreground">
                Valor dos itens
              </div>
            </div>
          </div>

          {/* Desconto */}
          {hasDiscount && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="font-medium text-red-700 dark:text-red-300">
                  Desconto
                </span>
                <Badge variant="outline" className="text-xs">
                  <Percent className="h-3 w-3 mr-1" />
                  {discountPercentage.toFixed(1)}%
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      formatCurrency(Math.abs(discount)),
                      "discount"
                    )
                  }
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "discount" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="text-right">
                <div className="font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(Math.abs(discount))}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {quote.discount_type === "percentage"
                    ? "Percentual"
                    : "Valor fixo"}
                </div>
              </div>
            </div>
          )}

          {/* Impostos */}
          {hasTax && (
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  Impostos
                </span>
                <Badge variant="outline" className="text-xs">
                  <Receipt className="h-3 w-3 mr-1" />
                  {taxPercentage.toFixed(1)}%
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatCurrency(tax), "tax")}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "tax" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="text-right">
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  +{formatCurrency(tax)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Incluído no total
                </div>
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Total final */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-bold text-lg">Total</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formatCurrency(total), "total")}
                className="h-6 w-6 p-0"
              >
                {copiedField === "total" ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="text-right">
              <div className="font-bold text-2xl text-primary">
                {formatCurrency(total)}
              </div>
              <div className="text-xs text-muted-foreground">
                Valor final a pagar
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Observações e Termos */}
      {(quote.notes || quote.terms_and_conditions_content) && (
        <div className="space-y-4">
          {quote.notes && (
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Observações</h4>
                <Badge variant="outline" className="text-xs">
                  Para o cliente
                </Badge>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {quote.notes}
                </p>
              </div>
            </Card>
          )}

          {quote.terms_and_conditions_content && (
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Termos e Condições</h4>
                <Badge variant="secondary" className="text-xs">
                  Importante
                </Badge>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {quote.terms_and_conditions_content}
                </pre>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Resumo visual final */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 text-center bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {hasDiscount ? `${discountPercentage.toFixed(0)}%` : "0%"}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            Desconto aplicado
          </div>
        </div>
      </div>
    </div>
  );
}
