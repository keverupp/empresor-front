"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Loader2, User, ChevronsUpDown, Check } from "lucide-react";

// UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// shadcn Combobox building blocks
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Tipos/utilitários
import type { Client } from "@/types/apiInterfaces";
import { generateQuoteNumber as localGenerateQuoteNumber } from "@/lib/quote-utils";

// -------------------- Schema mínimo do formulário --------------------
const minimalQuoteSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  quote_number: z.string().min(1, "Informe a identificação"),
  // expiry_date: string ISO yyyy-mm-dd (opcional)
  expiry_date: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Data de validade inválida"
    ),
});

type MinimalQuoteFormData = z.infer<typeof minimalQuoteSchema>;

// -------------------- Props --------------------
interface CreateQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Recebe o payload já transformado para a API; quem chama faz o POST + redireciona
  onSuccess: (apiPayload: {
    client_id: string;
    quote_number: string;
    expiry_date?: string | null;
  }) => Promise<any>;
  companyId: string; // mantido por compatibilidade
  preSelectedClient?: Client | null;
  clients?: Client[];
  onLoadClients?: () => Promise<Client[]>;
  onGenerateQuoteNumber?: () => Promise<string>;
}

// -------------------- Componente --------------------
export function CreateQuoteDialog({
  isOpen,
  onClose,
  onSuccess,
  companyId, // eslint-disable-line @typescript-eslint/no-unused-vars
  preSelectedClient,
  clients: initialClients = [],
  onLoadClients,
  onGenerateQuoteNumber,
}: CreateQuoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const form = useForm<MinimalQuoteFormData>({
    resolver: zodResolver(minimalQuoteSchema),
    defaultValues: {
      client_id: preSelectedClient?.id || "",
      quote_number: "",
      expiry_date: "", // opcional
    },
  });

  // Carregamento/Reset ao abrir
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      // Resetar form sempre que abrir (respeitando cliente pré-selecionado)
      form.reset({
        client_id: preSelectedClient?.id || "",
        quote_number: "",
        expiry_date: "",
      });

      // Carregar clientes se necessário (quando não há preSelectedClient e lista vazia)
      if (!preSelectedClient && clients.length === 0 && onLoadClients) {
        setLoadingClients(true);
        try {
          const loaded = await onLoadClients();
          setClients(loaded ?? []);
        } finally {
          setLoadingClients(false);
        }
      }

      // Gerar identificação
      try {
        const idf =
          (await onGenerateQuoteNumber?.()) ?? localGenerateQuoteNumber();
        form.setValue("quote_number", idf);
      } catch {
        form.setValue("quote_number", localGenerateQuoteNumber());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Lista de clientes mostrada no combobox (client-side filter via CommandInput)
  const clientsById = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach((c) => map.set(c.id, c));
    if (preSelectedClient) map.set(preSelectedClient.id, preSelectedClient);
    return map;
  }, [clients, preSelectedClient]);

  const selectedClient = clientsById.get(form.watch("client_id") || "");

  // Submit mínimo (sem itens/observações/impostos)
  const handleSubmit = async (data: MinimalQuoteFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        client_id: data.client_id,
        quote_number: data.quote_number.trim(),
        // issue_date fica por conta do backend (data atual)
        expiry_date: data.expiry_date ? data.expiry_date : undefined,

        // 👇 API exige a propriedade 'items'
        items: [],

        // (opcional) se sua API também validar campos financeiros,
        // pode enviar defaults seguros:
        // discount_type: null,
        // discount_value_cents: 0,
        // tax_amount_cents: 0,
        // notes: "",
        // internal_notes: "",
        // terms_and_conditions_content: "",
      };

      await onSuccess(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Criar Novo Orçamento
          </DialogTitle>
          <DialogDescription>
            Informe o cliente, a identificação e (opcionalmente) a data de
            validade. Você poderá adicionar itens e detalhes na edição.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 pt-2"
        >
          {/* Cliente (Combobox) */}
          <div className="space-y-2">
            <Label>Cliente *</Label>

            {preSelectedClient ? (
              <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {preSelectedClient.name}
                  </div>
                  {preSelectedClient.email && (
                    <div className="text-xs text-muted-foreground truncate">
                      {preSelectedClient.email}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Popover open={clientsOpen} onOpenChange={setClientsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientsOpen}
                    className="w-full justify-between"
                  >
                    {selectedClient ? (
                      <span className="truncate">{selectedClient.name}</span>
                    ) : loadingClients ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando clientes...
                      </span>
                    ) : (
                      "Selecione um cliente"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingClients
                          ? "Carregando..."
                          : "Nenhum cliente encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {Array.from(clientsById.values()).map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email ?? ""}`}
                            // guardamos o id no form
                            onSelect={() => {
                              form.setValue("client_id", client.id, {
                                shouldValidate: true,
                              });
                              setClientsOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <User className="h-4 w-4 opacity-60 shrink-0" />
                              <div className="min-w-0">
                                <div className="truncate">{client.name}</div>
                                {client.email && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {client.email}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Check
                              className={[
                                "ml-auto h-4 w-4",
                                form.watch("client_id") === client.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              ].join(" ")}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {form.formState.errors.client_id && (
              <p className="text-sm text-destructive">
                {form.formState.errors.client_id.message}
              </p>
            )}
          </div>

          {/* Identificação */}
          <div className="space-y-2">
            <Label htmlFor="quote_number">Identificação *</Label>
            <Input
              id="quote_number"
              {...form.register("quote_number")}
              placeholder="Ex: ORC-2025-001"
            />
            {form.formState.errors.quote_number && (
              <p className="text-sm text-destructive">
                {form.formState.errors.quote_number.message}
              </p>
            )}
          </div>

          {/* Validade (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Data de Validade</Label>
            <Input
              id="expiry_date"
              type="date"
              {...form.register("expiry_date")}
            />
            {form.formState.errors.expiry_date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.expiry_date.message}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar e continuar edição"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
