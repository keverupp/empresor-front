// src/hooks/useClientForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidCPF, isValidCNPJ, isValidCEP } from "@/lib/utils";

// Schema base para cliente
export const clientSchema = z.object({
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
  notes: z.string().optional().or(z.literal("")),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Hook personalizado para formulários de cliente
export const useClientForm = (defaultValues?: Partial<ClientFormData>) => {
  return useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
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
      ...defaultValues,
    },
  });
};
