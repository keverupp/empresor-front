// _components/FinanceTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/quote-utils";
import type { UseFormReturn } from "react-hook-form";
import type { QuoteFormData } from "@/lib/quote-schemas";

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
  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold">Financeiro</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo de desconto</Label>
          <Select
            value={(form.watch("discount_type") || "none") as string}
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
              <SelectItem value="none">Sem desconto</SelectItem>
              <SelectItem value="percentage">Percentual (%)</SelectItem>
              <SelectItem value="fixed_amount">Valor fixo (R$)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(form.watch("discount_type") || "") !== "" && (
          <div className="space-y-2">
            <Label>
              Valor do desconto{" "}
              {form.watch("discount_type") === "percentage" ? "(%)" : "(R$)"}
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={
                form.watch("discount_type") === "percentage" ? "100" : undefined
              }
              {...form.register("discount_value", { valueAsNumber: true })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Impostos (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...form.register("tax_amount", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground">Subtotal</div>
          <div className="font-semibold">{formatCurrency(subtotalCents)}</div>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground">Desconto</div>
          <div className="font-semibold">
            {discountCents > 0 ? `-${formatCurrency(discountCents)}` : "—"}
          </div>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="font-semibold">{formatCurrency(totalCents)}</div>
        </div>
      </div>
    </Card>
  );
}
