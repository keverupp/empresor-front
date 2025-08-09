"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/quote-utils";
import type { Quote } from "@/types/apiInterfaces";

type Props = {
  quote: Quote;
};

export function QuoteViewTotals({ quote }: Props) {
  const subtotal = quote.subtotal_cents ?? 0;
  const discount = quote.discount_value_cents ?? 0; // pode ser 0
  const tax = quote.tax_amount_cents ?? 0;
  const total = quote.total_amount_cents ?? subtotal - discount + tax;

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="font-semibold text-base mb-3">Resumo</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {discount !== 0 && (
          <div className="flex justify-between text-red-600">
            <span>Desconto</span>
            <span className="font-medium">
              -{formatCurrency(Math.abs(discount))}
            </span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impostos</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
        )}

        <Separator className="my-3" />

        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {(quote.notes || quote.terms_and_conditions_content) && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            {quote.notes && (
              <div>
                <div className="text-muted-foreground mb-1">Observações</div>
                <div className="whitespace-pre-wrap">{quote.notes}</div>
              </div>
            )}
            {quote.terms_and_conditions_content && (
              <div>
                <div className="text-muted-foreground mb-1">
                  Termos e condições
                </div>
                <div className="whitespace-pre-wrap">
                  {quote.terms_and_conditions_content}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
