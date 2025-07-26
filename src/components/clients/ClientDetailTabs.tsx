// src/components/clients/ClientDetailTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, MapPin, FileText, Calendar } from "lucide-react";

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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Select para mobile */}
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

      {/* Tabs para desktop */}
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

      <TabsContent value="basic" className="space-y-4">
        <ClientBasicInfo
          client={client}
          isLoading={isLoading}
          isEditing={isEditing}
          isUpdating={isUpdating}
          updateClient={updateClient}
          onCancelEdit={onCancelEdit}
        />
      </TabsContent>

      <TabsContent value="address" className="space-y-4">
        <ClientAddressInfo
          client={client}
          isLoading={isLoading}
          isEditing={isEditing}
          isUpdating={isUpdating}
          updateClient={updateClient}
          onCancelEdit={onCancelEdit}
        />
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <ClientNotesInfo
          client={client}
          isLoading={isLoading}
          isEditing={isEditing}
          isUpdating={isUpdating}
          updateClient={updateClient}
          onCancelEdit={onCancelEdit}
        />
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        <ClientSystemInfo client={client} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
