// _components/FinanceTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Calculator,
  Percent,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Info,
  Target,
} from "lucide-react";
import { formatCurrency } from "@/lib/quote-utils";
import type { UseFormReturn } from "react-hook-form";
import type { QuoteFormData } from "@/lib/quote-schemas";
import { cn } from "@/lib/utils";

export function FinanceTab({
  form,
  subtotalCents,
  discountCents,
  totalCents,
}: {
  form: UseFormReturn<QuoteFormData>;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}) {
  const discountType = form.watch("discount_type") || "";
  const discountValue = form.watch("discount_value") || 0; // In reais or percentage
  const taxAmount = form.watch("tax_amount") || 0; // In reais

  // Calcular percentual de desconto em relação ao subtotal
  const discountPercentage =
    subtotalCents > 0 ? (discountCents / subtotalCents) * 100 : 0;

  // Calcular margem de lucro estimada (assumindo 30% como custo base)
  const estimatedCost = subtotalCents * 0.3;
  const profit = totalCents - estimatedCost;
  const profitMargin = totalCents > 0 ? (profit / totalCents) * 100 : 0;

  // Validações (discountValue in reais for fixed_amount, percentage for percentage)
  const isDiscountValid =
    discountType === "" ||
    (discountValue >= 0 &&
      discountValue <=
        (discountType === "percentage" ? 100 : subtotalCents / 100));
  const isTaxAmountValid = taxAmount >= 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com resumo financeiro */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Calculator className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Configurações Financeiras</h3>
              <p className="text-sm text-muted-foreground">
                Descontos, impostos e resumo de valores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {profitMargin > 0
                ? `${profitMargin.toFixed(1)}% margem`
                : "Sem margem"}
            </Badge>
          </div>
        </div>

        {/* Indicadores rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Itens</div>
            <div className="font-semibold text-sm">
              {formatCurrency(subtotalCents)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Desconto</div>
            <div className="font-semibold text-sm text-red-600 dark:text-red-400">
              {discountCents > 0 ? `-${formatCurrency(discountCents)}` : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Impostos</div>
            <div className="font-semibold text-sm">
              {taxAmount > 0 ? `+${formatCurrency(taxAmount * 100)}` : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-semibold text-sm text-green-600 dark:text-green-400">
              {formatCurrency(totalCents)}
            </div>
          </div>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Seção de Desconto */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Desconto</h4>
              {discountCents > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {discountPercentage.toFixed(1)}% do subtotal
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Tipo de Desconto
                </Label>
                <Select
                  value={(discountType || "none") as string}
                  onValueChange={(v) => {
                    if (v === "none") {
                      form.setValue("discount_type", "");
                      form.setValue("discount_value", 0);
                    } else {
                      form.setValue("discount_type", v as any);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span>—</span>
                        <span>Sem desconto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span>Percentual (%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Valor fixo (R$)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountType !== "" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {discountType === "percentage" ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    Valor do Desconto
                    {discountType === "percentage" ? " (%)" : " (R$)"}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={discountType === "percentage" ? "100" : undefined}
                      placeholder={
                        discountType === "percentage" ? "0.00" : "0,00"
                      }
                      {...form.register("discount_value", {
                        valueAsNumber: true,
                      })}
                      className={cn(
                        "pr-10",
                        isDiscountValid
                          ? "border-green-200 dark:border-green-800"
                          : "border-destructive"
                      )}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      {isDiscountValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  {discountType === "percentage" && discountValue > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Equivale a{" "}
                      {formatCurrency((subtotalCents * discountValue) / 100)}
                    </p>
                  )}

                  {discountType === "fixed_amount" && discountValue > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Equivale a{" "}
                      {((discountValue * 100) / subtotalCents || 0).toFixed(1)}%
                      do subtotal
                    </p>
                  )}

                  {!isDiscountValid && (
                    <p className="text-xs text-destructive">
                      {discountType === "percentage"
                        ? "Percentual deve estar entre 0% e 100%"
                        : "Valor não pode ser maior que o subtotal"}
                    </p>
                  )}
                </div>
              )}

              {discountCents > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Desconto Aplicado
                  </Label>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(discountCents)}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {discountPercentage.toFixed(1)}% de redução
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção de Impostos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Impostos e Taxas</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="tax_amount"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Valor dos Impostos (R$)
                </Label>
                <div className="relative">
                  <Input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...form.register("tax_amount", { valueAsNumber: true })}
                    className={cn(
                      "pr-10",
                      isTaxAmountValid
                        ? "border-green-200 dark:border-green-800"
                        : "border-destructive"
                    )}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    {isTaxAmountValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione impostos como ICMS, ISS, PIS/COFINS, etc.
                </p>
              </div>

              {taxAmount > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Imposto Aplicado
                  </Label>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        +{formatCurrency(taxAmount * 100)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {(((taxAmount * 100) / totalCents) * 100).toFixed(1)}% do
                      total
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="p-4 sm:p-6 bg-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-semibold">Resumo Financeiro</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Subtotal</span>
            </div>
            <div className="font-semibold text-lg">
              {formatCurrency(subtotalCents)}
            </div>
            <p className="text-xs text-muted-foreground">Valor dos itens</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">Desconto</span>
            </div>
            <div className="font-semibold text-lg text-red-600 dark:text-red-400">
              {discountCents > 0 ? `-${formatCurrency(discountCents)}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {discountCents > 0
                ? `${discountPercentage.toFixed(1)}% redução`
                : "Sem desconto"}
            </p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">Impostos</span>
            </div>
            <div className="font-semibold text-lg">
              {taxAmount > 0 ? `+${formatCurrency(taxAmount * 100)}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {taxAmount > 0 ? "Incluídos no total" : "Sem impostos"}
            </p>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground font-medium">
                Total Final
              </span>
            </div>
            <div className="font-bold text-xl text-primary">
              {formatCurrency(totalCents)}
            </div>
            <p className="text-xs text-muted-foreground">Valor a cobrar</p>
          </div>
        </div>
      </Card>

      {/* Insights e Dicas */}
      {(discountCents > 0 || taxAmount > 0 || profitMargin < 20) && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Análise Financeira:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {discountCents > 0 && (
                <li>
                  • Desconto de {discountPercentage.toFixed(1)}% aplicado -
                  considere o impacto na margem
                </li>
              )}
              {taxAmount > 0 && <li>• Impostos adicionados ao valor final</li>}
              {profitMargin < 20 && (
                <li>
                  • ⚠️ Margem de lucro estimada baixa ({profitMargin.toFixed(1)}
                  %) - revise os valores
                </li>
              )}
              {profitMargin >= 20 && (
                <li>
                  • ✅ Margem de lucro saudável ({profitMargin.toFixed(1)}%)
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
