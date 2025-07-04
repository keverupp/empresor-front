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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  MapPin,
  Save,
  Trash2,
  FileText,
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useCompanyDetail,
  type CompanyApiResponse,
} from "@/hooks/useCompanyDetail";
import { CompanyDeleteDialog } from "@/components/company/CompanyDeleteDialog";
import { formatters } from "@/config/app";
import {
  formatCNPJ,
  formatPhone,
  formatCEP,
  detectDocumentType,
} from "@/lib/format-utils";
import { toast } from "sonner";

// Schema de validação ajustado para a estrutura da API
const companyUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  legal_name: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone_number: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
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
      website: "",
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

  // Atualizar form quando company data carrega
  useEffect(() => {
    if (company) {
      const formData: CompanyUpdateFormData = {
        name: company.name || "",
        legal_name: company.legal_name || "",
        email: company.email || "",
        phone_number: company.phone_number || "",
        website: "", // A API não tem campo website, mas mantemos no form
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
        website: "",
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

  // Breadcrumbs
  const breadcrumbs = createBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empresas", href: "/dashboard/companies" },
    { label: company?.name || "Empresa" },
  ]);

  // Handlers
  const handleDelete = async (): Promise<boolean> => {
    const success = await deleteCompany();
    if (success) {
      router.push("/dashboard/companies");
    }
    return success;
  };

  // Actions no header
  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchCompany}
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
      <CompanyDeleteDialog
        company={company!}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      >
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading || !company}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </CompanyDeleteDialog>
    </div>
  );

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
        website: "",
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

  // Função para obter iniciais da empresa
  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Função para obter badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativa", variant: "default" as const },
      pending: { label: "Pendente", variant: "secondary" as const },
      pending_validation: { label: "Pendente", variant: "secondary" as const },
      inactive: { label: "Inativa", variant: "destructive" as const },
      suspended: { label: "Suspensa", variant: "destructive" as const },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout
        title="Carregando..."
        description="Carregando informações da empresa"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6 px-4 py-6 md:px-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && !company) {
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
    <DashboardLayout
      title={company?.name || "Empresa"}
      description="Informações e configurações da empresa"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6 px-4 py-6 md:px-6">
        {/* Header com avatar e status */}
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={company?.logo_url || undefined}
                  alt={company?.name || "Empresa"}
                />
                <AvatarFallback className="text-xl">
                  {company ? getCompanyInitials(company.name) : "??"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold">{company?.name}</h1>
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {company?.document_type}: {company?.document_number}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {company && (
                    <Badge variant={getStatusBadge(company.status).variant}>
                      {getStatusBadge(company.status).label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulário de edição */}
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Informações básicas */}
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

          {/* Endereço */}
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
                    {...form.register("address_zip_code")}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Criada em
                  </p>
                  <p className="font-medium">
                    {company ? formatters.date(company.created_at) : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Última atualização
                  </p>
                  <p className="font-medium">
                    {company ? formatters.date(company.updated_at) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          {hasChanges && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800">
                      Alterações não salvas
                    </p>
                    <p className="text-sm text-amber-600">
                      Você tem alterações que não foram salvas.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isUpdating}
                    >
                      Descartar
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
