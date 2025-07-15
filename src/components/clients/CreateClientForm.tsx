"use client";

import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; // MELHORIA: Biblioteca para notificações (toast)

import { useApi } from "@/hooks/useApi";
import { Client } from "@/types/apiInterfaces";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// MELHORIA: Validações mais robustas e transformações para limpar os dados.
// Por exemplo, remover caracteres não numéricos de telefone, CEP e CPF/CNPJ.
const clientFormSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  email: z
    .string()
    .email({ message: "Formato de e-mail inválido." })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)), // Converte string vazia para null
  phone_number: z
    .string()
    .optional()
    .transform((val) => val?.replace(/\D/g, "") || null), // Remove não-números
  document_number: z
    .string()
    .optional()
    .transform((val) => val?.replace(/\D/g, "") || null), // Remove não-números
  address_street: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
  address_city: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
  address_state: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
  address_zip_code: z
    .string()
    .optional()
    .transform((val) => val?.replace(/\D/g, "") || null), // Remove não-números
  notes: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || null),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface CreateClientFormProps {
  companyId: string;
  onSuccess?: (client: Client) => void;
}

export default function CreateClientForm({
  companyId,
  onSuccess,
}: CreateClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues, any>,
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      document_number: "",
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip_code: "",
      notes: "",
    },
  });

  // MELHORIA: Extrair `error` do hook para exibir mensagens de erro da API.
  const { post, isLoading, error } = useApi();

  const onSubmit = async (values: ClientFormValues) => {
    try {
      const { data } = await post<Client>(
        `/companies/${companyId}/clients`,
        values
      );
      if (data) {
        toast.success("Cliente criado com sucesso! ✨");
        onSuccess?.(data);
        form.reset();
      }
      // MELHORIA: O hook `useApi` deve lançar um erro em caso de falha para o catch funcionar.
      // Se o hook já define o estado `error`, podemos usá-lo também.
      if (error) {
        toast.error("Falha ao criar o cliente.", {
          description: error.message,
        });
      }
    } catch (err) {
      // Fallback para erros não capturados pelo hook
      toast.error("Ocorreu um erro inesperado.", {
        description: "Por favor, tente novamente mais tarde.",
      });
      console.error(err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* MELHORIA: Usar <fieldset> para desabilitar todos os campos durante o envio */}
        <fieldset disabled={isLoading} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MELHORIA: Agrupamento de campos de contato */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@cliente.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    {/* Para melhor UX, considere usar uma lib de máscara, como 'react-input-mask' */}
                    <Input
                      placeholder="(99) 99999-9999"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apenas números"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MELHORIA: Agrupamento visual dos campos de endereço */}
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-sm font-medium">Endereço (Opcional)</h3>
            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Av. Brasil, 123"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* MELHORIA: Grid responsivo que se torna uma coluna em telas pequenas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UF"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address_zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione observações sobre o cliente..."
                    rows={4}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {/* MELHORIA: Ícone de carregamento para feedback visual mais claro */}
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isLoading ? "Salvando..." : "Salvar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
