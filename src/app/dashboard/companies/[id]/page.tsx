"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Trash2, RefreshCw } from "lucide-react";
import {
  useCompanyDetail,
  apiResponseToCompany,
} from "@/hooks/useCompanyDetail";
import { CompanyDeleteDialog } from "@/components/company/CompanyDeleteDialog";
import { CompanyHeaderSection } from "@/components/company/CompanyHeaderSection";
import { CompanyBasicInfoForm } from "@/components/company/CompanyBasicInfoForm";
import { CompanyAddressForm } from "@/components/company/CompanyAddressForm";
import { CompanySystemInfo } from "@/components/company/CompanySystemInfo";
import { CompanySaveActions } from "@/components/company/CompanySaveActions";
import { toast } from "sonner";

// Schema de validação ajustado para a estrutura da API
const companyUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  legal_name: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone_number: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().max(2, "Estado deve ter 2 caracteres").optional(),
  address_zip_code: z.string().optional(),
  address_country: z.string().optional(),
});

type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { createBreadcrumbs } = useDashboardLayout();

  // Hook para gerenciar dados da empresa
  const {
    company,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    fetchCompany,
    updateCompany,
    deleteCompany,
  } = useCompanyDetail(companyId);

  // Form setup
  const form = useForm<CompanyUpdateFormData>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      name: "",
      legal_name: "",
      email: "",
      phone_number: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
      address_zip_code: "",
      address_country: "BR",
    },
  });

  // Estados
  const [hasChanges, setHasChanges] = useState(false);

  // Handlers
  const handleDelete = async (): Promise<boolean> => {
    try {
      console.log("Iniciando processo de exclusão da empresa");
      const success = await deleteCompany();

      if (success) {
        console.log("Empresa excluída com sucesso, redirecionando...");
        // Usar setTimeout para garantir que o toast seja exibido antes da navegação
        setTimeout(() => {
          router.push("/dashboard/");
        }, 1000);
        return true;
      } else {
        console.log("Falha ao excluir empresa");
        return false;
      }
    } catch (error) {
      console.error("Erro durante o processo de exclusão:", error);
      return false;
    }
  };

  // Atualizar form quando company data carrega
  useEffect(() => {
    if (company) {
      const formData: CompanyUpdateFormData = {
        name: company.name || "",
        legal_name: company.legal_name || "",
        email: company.email || "",
        phone_number: company.phone_number || "",
        address_street: company.address_street || "",
        address_number: company.address_number || "",
        address_complement: company.address_complement || "",
        address_neighborhood: company.address_neighborhood || "",
        address_city: company.address_city || "",
        address_state: company.address_state || "",
        address_zip_code: company.address_zip_code || "",
        address_country: company.address_country || "BR",
      };

      form.reset(formData);
      setHasChanges(false);
    }
  }, [company, form]);

  // Watch for changes
  const watchedValues = form.watch();
  useEffect(() => {
    if (company) {
      const currentData = JSON.stringify(watchedValues);
      const originalData = JSON.stringify({
        name: company.name || "",
        legal_name: company.legal_name || "",
        email: company.email || "",
        phone_number: company.phone_number || "",
        address_street: company.address_street || "",
        address_number: company.address_number || "",
        address_complement: company.address_complement || "",
        address_neighborhood: company.address_neighborhood || "",
        address_city: company.address_city || "",
        address_state: company.address_state || "",
        address_zip_code: company.address_zip_code || "",
        address_country: company.address_country || "BR",
      });

      setHasChanges(currentData !== originalData);
    }
  }, [watchedValues, company]);

  // Actions no header
  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchCompany}
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">Atualizar</span>
      </Button>
      {company && (
        <CompanyDeleteDialog
          company={apiResponseToCompany(company)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        >
          <Button variant="destructive" size="sm" disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </CompanyDeleteDialog>
      )}
    </div>
  );

  // Breadcrumbs
  const breadcrumbs = createBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empresas", href: "/dashboard/companies" },
    { label: company?.name || "Empresa" },
  ]);

  const handleSave = async (data: CompanyUpdateFormData) => {
    try {
      const success = await updateCompany(data);
      if (success) {
        setHasChanges(false);
        toast.success("Empresa atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleReset = () => {
    if (company) {
      form.reset({
        name: company.name || "",
        legal_name: company.legal_name || "",
        email: company.email || "",
        phone_number: company.phone_number || "",
        address_street: company.address_street || "",
        address_number: company.address_number || "",
        address_complement: company.address_complement || "",
        address_neighborhood: company.address_neighborhood || "",
        address_city: company.address_city || "",
        address_state: company.address_state || "",
        address_zip_code: company.address_zip_code || "",
        address_country: company.address_country || "BR",
      });
      setHasChanges(false);
    }
  };

  // Error state
  if (error && !company && !isLoading) {
    return (
      <DashboardLayout
        title="Erro"
        description="Erro ao carregar empresa"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6 px-4 py-6 md:px-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Empresa não encontrada</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => router.push("/dashboard/companies")}>
                Voltar às Empresas
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Main render
  return (
    <DashboardLayout breadcrumbs={breadcrumbs} actions={actions}>
      <div className="space-y-6 px-4 py-6 md:px-6">
        {/* Header com avatar e status */}
        <CompanyHeaderSection company={company} isLoading={isLoading} />

        {/* Formulário de edição */}
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Informações básicas */}
          <CompanyBasicInfoForm
            company={company}
            form={form}
            isLoading={isLoading}
          />

          {/* Endereço */}
          <CompanyAddressForm
            company={company}
            form={form}
            isLoading={isLoading}
          />

          {/* Informações do sistema */}
          <CompanySystemInfo company={company} isLoading={isLoading} />
        </form>

        {/* Botões de ação para salvar/descartar */}
        <CompanySaveActions
          hasChanges={hasChanges}
          isUpdating={isUpdating}
          onSave={() => form.handleSubmit(handleSave)()}
          onReset={handleReset}
        />
      </div>
    </DashboardLayout>
  );
}
