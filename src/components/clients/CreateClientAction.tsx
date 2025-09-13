// src/components/clients/CreateClientAction.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Client } from "@/types/apiInterfaces";
import type { ClientApiData } from "./CreateClientForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateClientForm from "./CreateClientForm";
import { toast } from "sonner";

interface CreateClientActionProps {
  companyId: string;
  onCreated?: (client: Client) => void;
  onSuccess?: () => void; // Novo callback para atualizar a tabela
  /** Controle externo do estado do dialog */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Conteúdo opcional que aciona o dialog (ex.: botão) */
  trigger?: React.ReactNode | null;
}

export function CreateClientAction({
  companyId,
  onCreated,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: CreateClientActionProps) {
  const { post } = useApi();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = controlledOpen !== undefined && onOpenChange;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen;

  const handleSubmit = useCallback(
    async (payload: ClientApiData) => {
      setIsSubmitting(true);

      try {
        const { data } = await post<Client>(
          `/companies/${companyId}/clients`,
          payload
        );

        if (data) {
          // Fecha o modal
          setOpen(false);

          // Exibe toast de sucesso
          toast.success("Cliente criado com sucesso!", {
            description: `${data.name} foi adicionado à sua lista de clientes.`,
          });

          // Chama os callbacks
          onCreated?.(data);
          onSuccess?.(); // Atualiza a tabela
        }
      } catch (err) {
        // O useApi já cuida dos toasts de erro
        console.error("Erro ao criar cliente:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyId, post, onCreated, onSuccess]
  );

  // Reset do estado quando o modal fecha
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setIsSubmitting(false);
      }
    },
    [setOpen]
  );

  const dialogTrigger =
    trigger === undefined ? (
      <Button size="sm" className="flex items-center gap-2">
        + Novo cliente
      </Button>
    ) : trigger;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogTrigger && <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>}

      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden flex flex-col sm:w-[90vw] sm:max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <CreateClientForm
            companyId={companyId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateClientAction;
