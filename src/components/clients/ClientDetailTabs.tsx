// src/components/clients/ClientDetailTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  Users,
  Clock,
  Edit,
} from "lucide-react";

import { ClientBasicInfo } from "./ClientBasicInfo";
import { ClientAddressInfo } from "./ClientAddressInfo";
import { ClientNotesInfo } from "./ClientNotesInfo";
import { ClientSystemInfo } from "./ClientSystemInfo";


interface ClientDetailTabsProps {
  client: any;
  isLoading: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  updateClient: (data: any) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function ClientDetailTabs({
  client,
  isLoading,
  isEditing,
  isUpdating,
  updateClient,
  onCancelEdit,
}: ClientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Configuração das tabs com informações melhoradas
  const tabConfig = {
    basic: {
      icon: User,
      label: "Informações Básicas",
      shortLabel: "Básico",
      mobileLabel: "Informações Básicas",
    },
    address: {
      icon: MapPin,
      label: "Endereço",
      shortLabel: "Endereço",
      mobileLabel: "Endereço",
    },
    notes: {
      icon: FileText,
      label: "Observações",
      shortLabel: "Notas",
      mobileLabel: "Observações",
    },
    system: {
      icon: Calendar,
      label: "Sistema",
      shortLabel: "Sistema",
      mobileLabel: "Informações do Sistema",
    },
  };

  // Calcular completude dos dados do cliente
  const calculateCompleteness = () => {
    if (!client || isLoading)
      return { percentage: 0, completed: 0, total: 0, missing: [] };

    const checks = {
      basic: {
        name: !!client.name,
        email: !!client.email,
        phone: !!client.phone_number,
        document: !!client.document_number,
      },
      address: {
        street: !!client.address_street,
        city: !!client.address_city,
        state: !!client.address_state,
        zipCode: !!client.address_zip_code,
      },
      notes: {
        notes: !!client.notes,
      },
    };

    const basicCompleted = Object.values(checks.basic).filter(Boolean).length;
    const addressCompleted = Object.values(checks.address).filter(
      Boolean
    ).length;
    const notesCompleted = Object.values(checks.notes).filter(Boolean).length;

    const totalCompleted = basicCompleted + addressCompleted + notesCompleted;
    const totalFields = 4 + 4 + 1; // 4 básicos + 4 endereço + 1 nota
    const percentage = Math.round((totalCompleted / totalFields) * 100);

    const missing = [];
    if (basicCompleted < 4) missing.push("Dados básicos incompletos");
    if (addressCompleted < 4) missing.push("Endereço incompleto");
    if (notesCompleted < 1) missing.push("Sem observações");

    return {
      percentage,
      completed: totalCompleted,
      total: totalFields,
      missing,
      sections: {
        basic: { completed: basicCompleted, total: 4 },
        address: { completed: addressCompleted, total: 4 },
        notes: { completed: notesCompleted, total: 1 },
      },
    };
  };

  const completeness = calculateCompleteness();

  // Determinar status da tab baseado na completude
  const getTabStatus = (tabKey: string) => {
    if (isLoading) return "loading";

    const section =
      completeness.sections[tabKey as keyof typeof completeness.sections];
    if (!section) return "unknown";

    if (section.completed === section.total) return "complete";
    if (section.completed > 0) return "partial";
    return "empty";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com status do cliente */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Perfil do Cliente</h3>
              <p className="text-sm text-muted-foreground">
                {client?.name || "Cliente"} • {completeness.percentage}%
                completo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Editando
              </Badge>
            )}

            {isUpdating && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3 animate-spin" />
                Salvando...
              </Badge>
            )}

            <Badge
              variant={completeness.percentage >= 75 ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {completeness.percentage >= 75 ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {completeness.percentage >= 75 ? "Completo" : "Incompleto"}
            </Badge>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completude dos dados</span>
            <span className="font-medium">
              {completeness.completed}/{completeness.total} campos
            </span>
          </div>
          <Progress value={completeness.percentage} className="h-2" />
        </div>
      </div>

      {/* Alerta para dados incompletos */}
      {completeness.percentage < 75 && completeness.missing.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Dados incompletos:</strong>{" "}
            {completeness.missing.join(", ").toLowerCase()}. Complete as
            informações para ter um perfil mais detalhado do cliente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Select para mobile */}
        <div className="block lg:hidden">
          <label className="mb-2 block text-sm font-medium">
            Navegar por seção
          </label>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tabConfig).map(([key, config]) => {
                const Icon = config.icon;
                const status = getTabStatus(key);
                return (
                  <SelectItem key={key} value={key} className="h-12">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{config.mobileLabel}</span>
                      {status === "complete" && (
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                      )}
                      {status === "partial" && (
                        <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs para desktop */}
        <TabsList className="hidden lg:grid w-full grid-cols-4 h-12">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            const status = getTabStatus(key);

            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 h-10 data-[state=active]:bg-background relative"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="hidden xl:inline">{config.label}</span>
                <span className="xl:hidden">{config.shortLabel}</span>

                {/* Indicador de status */}
                <div className="absolute -top-1 -right-1">
                  {status === "complete" && (
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  )}
                  {status === "partial" && (
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="basic" className="mt-0">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Informações Básicas</h2>
                  {getTabStatus("basic") === "complete" && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dados pessoais e de contato do cliente
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <ClientBasicInfo
                  client={client}
                  isLoading={isLoading}
                  isEditing={isEditing}
                  isUpdating={isUpdating}
                  updateClient={updateClient}
                  onCancelEdit={onCancelEdit}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="mt-0">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Endereço</h2>
                  {getTabStatus("address") === "complete" && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Localização e dados de entrega
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <ClientAddressInfo
                  client={client}
                  isLoading={isLoading}
                  isEditing={isEditing}
                  isUpdating={isUpdating}
                  updateClient={updateClient}
                  onCancelEdit={onCancelEdit}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Observações</h2>
                  {getTabStatus("notes") === "complete" && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Anotações e informações adicionais
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <ClientNotesInfo
                  client={client}
                  isLoading={isLoading}
                  isEditing={isEditing}
                  isUpdating={isUpdating}
                  updateClient={updateClient}
                  onCancelEdit={onCancelEdit}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">
                    Informações do Sistema
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    Somente leitura
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dados de criação e histórico de modificações
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <ClientSystemInfo client={client} isLoading={isLoading} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Resumo da completude por seção */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg border text-center">
            <div className="text-sm font-medium mb-1">Dados Básicos</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold">
                {completeness.sections.basic?.completed || 0}/
                {completeness.sections.basic?.total || 4}
              </span>
              {getTabStatus("basic") === "complete" && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border text-center">
            <div className="text-sm font-medium mb-1">Endereço</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold">
                {completeness.sections.address?.completed || 0}/
                {completeness.sections.address?.total || 4}
              </span>
              {getTabStatus("address") === "complete" && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border text-center">
            <div className="text-sm font-medium mb-1">Observações</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg font-bold">
                {completeness.sections.notes?.completed || 0}/
                {completeness.sections.notes?.total || 1}
              </span>
              {getTabStatus("notes") === "complete" && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
