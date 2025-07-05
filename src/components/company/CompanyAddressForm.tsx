// src/components/company/CompanyAddressForm.tsx
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
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { CompanyApiResponse } from "@/hooks/useCompanyDetail";
import { formatCEP } from "@/lib/format-utils";

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

interface CompanyAddressFormProps {
  company: CompanyApiResponse | null;
  form: UseFormReturn<CompanyUpdateFormData>;
  isLoading: boolean;
}

export function CompanyAddressForm({
  company,
  form,
  isLoading,
}: CompanyAddressFormProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Endereço
        </CardTitle>
        <CardDescription>
          Informações de localização da empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address_street">Logradouro</Label>
            <Input
              id="address_street"
              {...form.register("address_street")}
              placeholder="Rua, Avenida, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_number">Número</Label>
            <Input
              id="address_number"
              {...form.register("address_number")}
              placeholder="123"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input
              id="address_complement"
              {...form.register("address_complement")}
              placeholder="Sala, Andar, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_neighborhood">Bairro</Label>
            <Input
              id="address_neighborhood"
              {...form.register("address_neighborhood")}
              placeholder="Nome do bairro"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="address_city">Cidade</Label>
            <Input
              id="address_city"
              {...form.register("address_city")}
              placeholder="Nome da cidade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_state">Estado</Label>
            <Input
              id="address_state"
              {...form.register("address_state")}
              placeholder="SP"
              maxLength={2}
            />
            {form.formState.errors.address_state && (
              <p className="text-sm text-destructive">
                {form.formState.errors.address_state.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_zip_code">CEP</Label>
            <Input
              id="address_zip_code"
              value={formatCEP(form.watch("address_zip_code") || "")}
              onChange={(e) => {
                // para salvar sem formatação
                const raw = e.target.value.replace(/\D/g, "");
                form.setValue("address_zip_code", raw);
              }}
              placeholder="00000-000"
            />
            <p className="text-xs text-muted-foreground">
              Atual:{" "}
              {company?.address_zip_code
                ? formatCEP(company.address_zip_code)
                : "Não informado"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
