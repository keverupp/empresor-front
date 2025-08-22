// src/components/clients/CreateClientAction.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Client } from "@/types/apiInterfaces";
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

type ClientApiData = {
  name: string;
  email?: string;
  phone_number?: string;
  document_number?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  notes?: string;
};

interface CreateClientActionProps {
  companyId: string;
  onCreated?: (client: Client) => void;
  onSuccess?: () => void; // Novo callback para atualizar a tabela
}

export function CreateClientAction({
  companyId,
  onCreated,
  onSuccess,
}: CreateClientActionProps) {
  const { post } = useApi();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          + Novo cliente
        </Button>
      </DialogTrigger>

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
