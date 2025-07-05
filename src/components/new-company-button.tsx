// src/components/new-company-button.tsx
"use client";

import React from "react";
import { IconPlus } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CompanyRegisterDialog } from "@/components/company-register-dialog";
import { useCompanyContext } from "@/contexts/CompanyContext";

interface NewCompanyButtonProps {
  /**
   * Classe CSS adicional para o grupo da sidebar
   */
  className?: string;
  /**
   * Se deve mostrar um separador visual acima do botão
   */
  showSeparator?: boolean;
  /**
   * Texto personalizado para o botão (padrão: "Nova Empresa")
   */
  buttonText?: string;
  /**
   * Callback executado quando uma nova empresa é criada com sucesso
   */
  onCompanyCreated?: (company: any) => void;
}

export function NewCompanyButton({
  className = "",
  showSeparator = false,
  buttonText = "Nova Empresa",
  onCompanyCreated,
}: NewCompanyButtonProps) {
  const { refreshCompanies } = useCompanyContext();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Handler para sucesso no registro
  const handleRegisterSuccess = React.useCallback(
    (newCompany: any) => {
      // Fecha o diálogo
      setIsDialogOpen(false);

      // Recarrega a lista de empresas
      refreshCompanies();

      // Executa callback personalizado se fornecido
      onCompanyCreated?.(newCompany);
    },
    [refreshCompanies, onCompanyCreated]
  );

  return (
    <>
      <SidebarGroup className={className}>
        {showSeparator && <div className="border-t border-border mx-2 my-2" />}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              tooltip="Criar uma nova empresa"
            >
              <IconPlus className="w-4 h-4" />
              <span>{buttonText}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Dialog de registro */}
      <CompanyRegisterDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
}

// Hook opcional para usar o botão de forma mais programática
export function useNewCompanyButton() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const openDialog = React.useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    setIsDialogOpen,
  };
}
