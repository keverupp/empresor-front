// src/components/clients/ClientBasicInfo.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhone, isValidCPF, isValidCNPJ } from "@/lib/utils";
import { formatDocument } from "@/lib/client-utils";

const basicInfoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  document_number: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const cleanValue = value.replace(/\D/g, "");
      return (
        (cleanValue.length === 11 && isValidCPF(cleanValue)) ||
        (cleanValue.length === 14 && isValidCNPJ(cleanValue))
      );
    }, "CPF ou CNPJ inválido")
    .or(z.literal("")),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface ClientBasicInfoProps {
  client: any;
  isLoading: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  updateClient: (data: any) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function ClientBasicInfo({
  client,
  isLoading,
  isEditing,
  isUpdating,
  updateClient,
  onCancelEdit,
}: ClientBasicInfoProps) {
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      document_number: "",
    },
  });

  // Atualizar formulário quando cliente for carregado
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        document_number: client.document_number || "",
      });
    }
  }, [client, form]);

  // Handlers para formatação
  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value);
    form.setValue("document_number", formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    form.setValue("phone_number", formatted);
  };

  const handleSave = async (data: BasicInfoFormData) => {
    const updateData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? "N/F" : value;
      return acc;
    }, {} as any);

    const success = await updateClient(updateData);
    if (success) {
      onCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        document_number: client.document_number || "",
      });
    }
    onCancelEdit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              {isEditing ? (
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Nome do cliente"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {client?.name || "-"}
                </div>
              )}
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="email@exemplo.com"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {client?.email || "-"}
                </div>
              )}
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone_number"
                  {...form.register("phone_number")}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {client?.phone_number
                    ? formatPhone(client.phone_number)
                    : "-"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_number">CPF/CNPJ</Label>
              {isEditing ? (
                <Input
                  id="document_number"
                  {...form.register("document_number")}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {client?.document_number
                    ? formatDocument(client.document_number)
                    : "-"}
                </div>
              )}
              {form.formState.errors.document_number && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.document_number.message}
                </p>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              disabled={isUpdating}
            >
              Cancelar
            </button>
            <button
              onClick={form.handleSubmit(handleSave)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
