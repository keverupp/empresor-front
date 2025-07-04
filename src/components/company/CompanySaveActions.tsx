// src/components/company/CompanySaveActions.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface CompanySaveActionsProps {
  hasChanges: boolean;
  isUpdating: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function CompanySaveActions({
  hasChanges,
  isUpdating,
  onSave,
  onReset,
}: CompanySaveActionsProps) {
  if (!hasChanges) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">Alterações não salvas</p>
            <p className="text-sm text-amber-600">
              Você tem alterações que não foram salvas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={isUpdating}
            >
              Descartar
            </Button>
            <Button type="button" onClick={onSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
