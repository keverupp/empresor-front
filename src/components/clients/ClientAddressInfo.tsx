// src/components/clients/ClientAddressInfo.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCEP, isValidCEP } from "@/lib/utils";

const addressSchema = z.object({
  address_street: z.string().optional().or(z.literal("")),
  address_city: z.string().optional().or(z.literal("")),
  address_state: z.string().optional().or(z.literal("")),
  address_zip_code: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return isValidCEP(value.replace(/\D/g, ""));
    }, "CEP inválido")
    .or(z.literal("")),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface ClientAddressInfoProps {
  client: any;
  isLoading: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  updateClient: (data: any) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function ClientAddressInfo({
  client,
  isLoading,
  isEditing,
  isUpdating,
  updateClient,
  onCancelEdit,
}: ClientAddressInfoProps) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip_code: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        address_street: client.address_street || "",
        address_city: client.address_city || "",
        address_state: client.address_state || "",
        address_zip_code: client.address_zip_code || "",
      });
    }
  }, [client, form]);

  const handleZipCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.length === 8 ? formatCEP(cleaned) : value;
    form.setValue("address_zip_code", formatted);
  };

  const handleSave = async (data: AddressFormData) => {
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
        address_street: client.address_street || "",
        address_city: client.address_city || "",
        address_state: client.address_state || "",
        address_zip_code: client.address_zip_code || "",
      });
    }
    onCancelEdit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address_street">Rua/Endereço</Label>
              {isEditing ? (
                <Input
                  id="address_street"
                  {...form.register("address_street")}
                  placeholder="Rua, número, complemento"
                />
              ) : (
                <div className="text-sm">{client?.address_street || "-"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_city">Cidade</Label>
              {isEditing ? (
                <Input
                  id="address_city"
                  {...form.register("address_city")}
                  placeholder="Cidade"
                />
              ) : (
                <div className="text-sm">{client?.address_city || "-"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_state">Estado</Label>
              {isEditing ? (
                <Input
                  id="address_state"
                  {...form.register("address_state")}
                  placeholder="Estado"
                />
              ) : (
                <div className="text-sm">{client?.address_state || "-"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_zip_code">CEP</Label>
              {isEditing ? (
                <Input
                  id="address_zip_code"
                  {...form.register("address_zip_code")}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  placeholder="00000-000"
                />
              ) : (
                <div className="text-sm">
                  {client?.address_zip_code
                    ? formatCEP(client.address_zip_code)
                    : "-"}
                </div>
              )}
              {form.formState.errors.address_zip_code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address_zip_code.message}
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
