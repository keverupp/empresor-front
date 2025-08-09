// _components/FooterActions.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ChevronLeft } from "lucide-react";
import { formatCurrency } from "@/lib/quote-utils";

export function FooterActions({
  subtotalCents,
  totalCents,
  saving,
  updatingStatus,
  onBack,
}: {
  subtotalCents: number;
  totalCents: number;
  saving: boolean;
  updatingStatus: boolean;
  onBack: () => void;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-muted-foreground">
            Subtotal:{" "}
            <span className="font-medium">{formatCurrency(subtotalCents)}</span>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-semibold">{formatCurrency(totalCents)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button type="submit" disabled={saving || updatingStatus}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
