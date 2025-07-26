// src/components/clients/ClientActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Edit3, Save, X, Trash2, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientDeleteDialog } from "./ClientDeleteDialog";

interface ClientActionsProps {
  client: any;
  isEditing: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  companyId: string;
  clientId: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => Promise<boolean>;
  onSave?: () => void;
}

export function ClientActions({
  client,
  isEditing,
  isLoading,
  isUpdating,
  isDeleting,
  companyId,
  clientId,
  onEdit,
  onCancelEdit,
  onDelete,
  onSave,
}: ClientActionsProps) {
  const router = useRouter();

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={isLoading}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/dashboard/companies/${companyId}/quotes/new?clientId=${clientId}`
                )
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Criar orçamento
            </DropdownMenuItem>
            {client && (
              <ClientDeleteDialog
                client={client}
                onConfirm={onDelete}
                isLoading={isDeleting}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir cliente
                </DropdownMenuItem>
              </ClientDeleteDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancelEdit}
        disabled={isUpdating}
      >
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button size="sm" onClick={onSave} disabled={isUpdating}>
        <Save className="h-4 w-4 mr-2" />
        {isUpdating ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
