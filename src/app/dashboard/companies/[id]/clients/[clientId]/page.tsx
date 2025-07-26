// src/app/dashboard/companies/[id]/clients/[clientId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  Building,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  useClientDetail,
  type ClientUpdatePayload,
} from "@/hooks/useClientDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientDeleteDialog } from "@/components/clients/ClientDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importações dos formatadores e validadores do utils
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
} from "@/lib/utils";

// Schema de validação com Zod
const clientSchema = z.object({
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

type ClientFormData = z.infer<typeof clientSchema>;

// Função para detectar e formatar documento
const formatDocument = (document: string): string => {
  if (!document) return "";
  const cleanDocument = document.replace(/\D/g, "");

  if (cleanDocument.length === 11) {
    return formatCPF(cleanDocument);
  } else if (cleanDocument.length === 14) {
    return formatCNPJ(cleanDocument);
  }

  return document;
};

// Função para formatar data
const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const clientId = params.clientId as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    client,
    isLoading,
    isUpdating,
    isDeleting,
    fetchClient,
    updateClient,
    deleteClient,
  } = useClientDetail(companyId, clientId);

  const form = useForm<ClientFormData>({
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
    },
  });

  // Buscar cliente ao carregar a página
  useEffect(() => {
    if (companyId && clientId) {
      fetchClient();
    }
  }, [companyId, clientId, fetchClient]);

  // Atualizar formulário quando cliente for carregado
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        document_number: client.document_number || "",
        address_street: client.address_street || "",
        address_city: client.address_city || "",
        address_state: client.address_state || "",
        address_zip_code: client.address_zip_code || "",
        notes: client.notes || "",
      });
    }
  }, [client, form]);

  // Handler para salvar alterações
  const handleSave = async (data: ClientFormData) => {
    // Converter strings vazias para null
    const updateData: ClientUpdatePayload = Object.entries(data).reduce(
      (acc, [key, value]) => {
        acc[key as keyof ClientUpdatePayload] = value === "" ? "N/F" : value;
        return acc;
      },
      {} as ClientUpdatePayload
    );

    const success = await updateClient(updateData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Handler para excluir cliente
  const handleDelete = async (): Promise<boolean> => {
    const success = await deleteClient();
    if (success) {
      router.push(`/dashboard/companies/${companyId}/clients`);
    }
    return success;
  };

  // Handler para cancelar edição
  const handleCancelEdit = () => {
    if (client) {
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        document_number: client.document_number || "",
        address_street: client.address_street || "",
        address_city: client.address_city || "",
        address_state: client.address_state || "",
        address_zip_code: client.address_zip_code || "",
        notes: client.notes || "",
      });
    }
    setIsEditing(false);
  };

  // Formatadores para inputs
  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value);
    form.setValue("document_number", formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    form.setValue("phone_number", formatted);
  };

  const handleZipCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.length === 8 ? formatCEP(cleaned) : value;
    form.setValue("address_zip_code", formatted);
  };

  // Ações da página
  const actions = (
    <div className="flex items-center gap-2">
      {!isEditing ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/companies/${companyId}/quotes/new?clientId=${clientId}`
                  )
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar orçamento
              </DropdownMenuItem>
              {client && (
                <ClientDeleteDialog
                  client={client}
                  onConfirm={handleDelete}
                  isLoading={isDeleting}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir cliente
                  </DropdownMenuItem>
                </ClientDeleteDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelEdit}
            disabled={isUpdating}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      <DashboardLayout
        title={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/companies/${companyId}/clients`)
              }
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              {isLoading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                <>
                  <h1 className="text-xl font-semibold">
                    {client?.name || "Cliente"}
                  </h1>
                  {client?.document_number && (
                    <p className="text-sm text-muted-foreground">
                      {formatDocument(client.document_number)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        }
        actions={actions}
      >
        <div className="space-y-6 p-4">
          {/* Select para mobile / Tabs para desktop */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Select para telas pequenas */}
            <div className="block md:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Informações Básicas</SelectItem>
                  <SelectItem value="address">Endereço</SelectItem>
                  <SelectItem value="notes">Observações</SelectItem>
                  <SelectItem value="system">Informações do Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs para telas médias e grandes */}
            <TabsList className="hidden md:grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Informações Básicas</span>
                <span className="lg:hidden">Básico</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">Endereço</span>
                <span className="lg:hidden">Endereço</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Observações</span>
                <span className="lg:hidden">Notas</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden lg:inline">Sistema</span>
                <span className="lg:hidden">Sistema</span>
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo das tabs */}
            {/* Informações básicas */}
            <TabsContent value="basic" className="space-y-4">
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
                            onChange={(e) =>
                              handleDocumentChange(e.target.value)
                            }
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Endereço */}
            <TabsContent value="address" className="space-y-4">
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
                          <div className="text-sm">
                            {client?.address_street || "-"}
                          </div>
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
                          <div className="text-sm">
                            {client?.address_city || "-"}
                          </div>
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
                          <div className="text-sm">
                            {client?.address_state || "-"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_zip_code">CEP</Label>
                        {isEditing ? (
                          <Input
                            id="address_zip_code"
                            {...form.register("address_zip_code")}
                            onChange={(e) =>
                              handleZipCodeChange(e.target.value)
                            }
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Observações */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : isEditing ? (
                    <Textarea
                      {...form.register("notes")}
                      placeholder="Observações sobre o cliente..."
                      rows={4}
                    />
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">
                      {client?.notes || "Nenhuma observação cadastrada."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Informações do sistema */}
            <TabsContent value="system" className="space-y-4">
              {client && !isLoading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Informações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            Cadastrado em:
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(client.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            Última atualização:
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(client.updated_at)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            ID do Cliente:
                          </span>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {client.id}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block">
                            ID da Empresa:
                          </span>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {client.company_id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
