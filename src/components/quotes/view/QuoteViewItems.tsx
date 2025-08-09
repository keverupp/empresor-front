"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quote } from "@/types/apiInterfaces";

type Props = {
  items: Quote["items"];
  currency: string;
};

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });

export function QuoteViewItems({ items, currency }: Props) {
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="font-semibold text-base mb-3">Itens</h2>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Descrição</TableHead>
              <TableHead className="w-[120px] font-semibold">Qtd</TableHead>
              <TableHead className="w-[160px] font-semibold">
                Preço Unit.
              </TableHead>
              <TableHead className="w-[160px] font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum item informado.
                </TableCell>
              </TableRow>
            ) : (
              items!.map((it, idx) => (
                <TableRow
                  key={it.id ?? `row-${idx}`}
                  className="odd:bg-muted/30"
                >
                  <TableCell>
                    <div className="font-medium">{it.description}</div>
                    {it.product_id && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Produto do catálogo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums font-mono">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="tabular-nums font-mono">
                    {money(it.unit_price_cents ?? 0, currency)}
                  </TableCell>
                  <TableCell className="tabular-nums font-mono font-semibold">
                    {money(
                      it.total_price_cents ??
                        it.quantity * (it.unit_price_cents ?? 0),
                      currency
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
