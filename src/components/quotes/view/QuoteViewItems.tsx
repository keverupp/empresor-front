"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Calculator,
  Hash,
  DollarSign,
  Tag,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteItem } from "@/types/apiInterfaces";

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });

type Props = {
  items?: QuoteItem[];
  currency: string;
};

export function QuoteViewItems({ items, currency }: Props) {
  const itemsArray = items || [];
  const totalItems = itemsArray.length;

  // Calcular estatísticas
  const statistics = {
    totalQuantity: itemsArray.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    ),
    totalValue: itemsArray.reduce((sum, item) => {
      return (
        sum +
        (item.total_price_cents ??
          Number(item.quantity) * (item.unit_price_cents ?? 0))
      );
    }, 0),
    catalogItems: itemsArray.filter((item) => item.product_id).length,
    averagePrice:
      itemsArray.length > 0
        ? itemsArray.reduce(
            (sum, item) => sum + (item.unit_price_cents ?? 0),
            0
          ) / itemsArray.length
        : 0,
    mostExpensive: Math.max(
      ...itemsArray.map((item) => item.unit_price_cents ?? 0),
      0
    ),
    cheapest:
      itemsArray.length > 0
        ? Math.min(
            ...itemsArray
              .map((item) => item.unit_price_cents ?? 0)
              .filter((price) => price > 0)
          )
        : 0,
  };

  // Identificar item mais valioso
  const mostValuableItem = itemsArray.reduce((max, item) => {
    const itemTotal =
      item.total_price_cents ??
      Number(item.quantity) * (item.unit_price_cents ?? 0);
    const maxTotal =
      max.total_price_cents ??
      Number(max.quantity) * (max.unit_price_cents ?? 0);
    return itemTotal > maxTotal ? item : max;
  }, itemsArray[0]);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">Lista de Itens</h2>
          {totalItems > 0 && (
            <Badge variant="outline">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </Badge>
          )}
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Descrição
                  </div>
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Qtd
                  </div>
                </TableHead>
                <TableHead className="w-[140px] font-semibold text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4" />
                    Preço Unit.
                  </div>
                </TableHead>
                <TableHead className="w-[140px] font-semibold text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Total
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalItems === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                      <div>
                        <p className="font-medium">Nenhum item informado</p>
                        <p className="text-sm">
                          Este orçamento ainda não possui itens adicionados
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                itemsArray.map((item, idx) => {
                  const itemTotal =
                    item.total_price_cents ??
                    Number(item.quantity) * (item.unit_price_cents ?? 0);
                  const isHighValue =
                    mostValuableItem && item.id === mostValuableItem.id;

                  return (
                    <TableRow
                      key={item.id ?? `row-${idx}`}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        isHighValue && "bg-blue-50/50 dark:bg-blue-950/20"
                      )}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {item.description}
                            </span>
                            {isHighValue && (
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Maior valor
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {item.product_id && (
                              <Badge variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                Catálogo
                              </Badge>
                            )}

                            {Number(item.quantity) > 10 && (
                              <Badge variant="outline" className="text-xs">
                                Alto volume
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-mono font-semibold text-lg">
                          {item.quantity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(item.quantity) === 1 ? "unidade" : "unidades"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="font-mono font-semibold">
                          {money(item.unit_price_cents ?? 0, currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          por unidade
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="font-mono font-bold text-lg text-primary">
                          {money(itemTotal, currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((itemTotal / statistics.totalValue) * 100).toFixed(
                            1
                          )}
                          % do total
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Resumo da tabela */}
        {totalItems > 0 && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Resumo dos Itens</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center sm:text-right">
                  <div className="text-muted-foreground">Total de Itens</div>
                  <div className="font-semibold">{totalItems}</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-muted-foreground">Quantidade Total</div>
                  <div className="font-semibold">
                    {statistics.totalQuantity}
                  </div>
                </div>
                <div className="text-center sm:text-right col-span-2 sm:col-span-1">
                  <div className="text-muted-foreground">Valor Total</div>
                  <div className="font-bold text-lg text-primary">
                    {money(statistics.totalValue, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Insights sobre os itens */}
      {totalItems > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {statistics.catalogItems > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                  Produtos do Catálogo
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {statistics.catalogItems} de {totalItems} itens são do catálogo
                ({((statistics.catalogItems / totalItems) * 100).toFixed(0)}%)
              </p>
            </div>
          )}

          {statistics.totalQuantity > totalItems * 5 && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200 text-sm">
                  Alto Volume
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Quantidade média de{" "}
                {(statistics.totalQuantity / totalItems).toFixed(1)} unidades
                por item
              </p>
            </div>
          )}

          {mostValuableItem && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Item Principal
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {mostValuableItem.description} representa o maior valor
                individual
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
