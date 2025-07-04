// src/components/company/CompanyBasicInfoForm.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { CompanyApiResponse } from "@/hooks/useCompanyDetail";
import { formatCNPJ, formatPhone } from "@/lib/format-utils";

type CompanyUpdateFormData = {
  name: string;
  legal_name?: string;
  email: string;
  phone_number?: string;
  website?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
};

interface CompanyBasicInfoFormProps {
  company: CompanyApiResponse | null;
  form: UseFormReturn<CompanyUpdateFormData>;
  isLoading: boolean;
}

export function CompanyBasicInfoForm({
  company,
  form,
  isLoading,
}: CompanyBasicInfoFormProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Informações Básicas
        </CardTitle>
        <CardDescription>
          Dados principais da empresa. O CNPJ não pode ser alterado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Nome da empresa"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">Razão Social</Label>
            <Input
              id="legal_name"
              {...form.register("legal_name")}
              placeholder="Razão social da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="email@empresa.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Telefone</Label>
            <Input
              id="phone_number"
              {...form.register("phone_number")}
              placeholder="(11) 99999-9999"
            />
            <p className="text-xs text-muted-foreground">
              Atual:{" "}
              {company?.phone_number
                ? formatPhone(company.phone_number)
                : "Não informado"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>CNPJ/CPF (Não editável)</Label>
          <Input
            value={formatCNPJ(company?.document_number || "")}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            O documento não pode ser alterado após o cadastro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
