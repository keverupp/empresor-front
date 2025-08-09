// _components/ObservationsTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { QuoteFormData } from "@/lib/quote-schemas";

export function ObservationsTab({
  form,
}: {
  form: UseFormReturn<QuoteFormData>;
}) {
  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold">Observações</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Observações para o cliente</Label>
          <Textarea id="notes" rows={4} {...form.register("notes")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internal_notes">Observações internas</Label>
          <Textarea
            id="internal_notes"
            rows={4}
            {...form.register("internal_notes")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms_and_conditions_content">Termos e condições</Label>
        <Textarea
          id="terms_and_conditions_content"
          rows={4}
          {...form.register("terms_and_conditions_content")}
        />
      </div>
    </Card>
  );
}
