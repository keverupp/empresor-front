// _components/ClientTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, User } from "lucide-react";
import { formatDateForDisplay } from "@/lib/quote-utils";
import type { QuoteFormData } from "@/lib/quote-schemas";
import type { UseFormReturn } from "react-hook-form";
import type { Quote } from "@/types/apiInterfaces";

export function ClientTab({
  form,
  quote,
}: {
  form: UseFormReturn<QuoteFormData>;
  quote: Quote;
}) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Cliente</Label>
          <div className="p-2.5 bg-muted rounded-md flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="font-medium truncate">
                {quote.client?.name ?? "—"}
              </div>
              {quote.client?.email && (
                <div className="text-xs text-muted-foreground truncate">
                  {quote.client.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote_number">Identificação</Label>
          <Input id="quote_number" {...form.register("quote_number")} />
        </div>

        <div className="space-y-2">
          <Label>Emitido em</Label>
          <div className="p-2.5 bg-muted rounded-md flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDateForDisplay(quote.issue_date)}
            </span>
          </div>
        </div>

        <div className="space-y-2 md:col-start-3">
          <Label htmlFor="expiry_date">Validade</Label>
          <Input
            id="expiry_date"
            type="date"
            {...form.register("expiry_date")}
          />
        </div>
      </div>
    </Card>
  );
}
