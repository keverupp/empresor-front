// src/components/clients/CreateClientAction.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi"; // já trata POST, toasts, token refresh :contentReference[oaicite:0]{index=0}
import { Client } from "@/types/apiInterfaces";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // shadcn/ui ou seu wrapper de Dialog
import CreateClientForm from "./CreateClientForm";

interface CreateClientActionProps {
  companyId: string;
  onCreated?: (client: Client) => void;
}

export function CreateClientAction({
  companyId,
  onCreated,
}: CreateClientActionProps) {
  const router = useRouter();
  const { post } = useApi();
  const [open, setOpen] = useState(false);

  const handleSubmit = useCallback(
    async (payload: Omit<Client, "id" | "created_at" | "updated_at">) => {
      // chama POST /companies/{companyId}/clients :contentReference[oaicite:1]{index=1}
      const { data, error } = await post<Client>(
        `/companies/${companyId}/clients`,
        payload
      );
      if (data) {
        setOpen(false);
        onCreated?.(data);
      }
      // em caso de erro, useApi já exibe toast
    },
    [companyId, post, onCreated]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="primary" className="flex items-center gap-2">
          + Novo cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar.
          </DialogDescription>
        </DialogHeader>
        <CreateClientForm companyId={companyId} onSubmit={handleSubmit} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default CreateClientAction;
