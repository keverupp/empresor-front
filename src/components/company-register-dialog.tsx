// src/components/company-register-dialog.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCNPJ } from "@/hooks/useCNPJ";
import { useApi } from "@/hooks/useApi";
import { appConfig } from "@/config/app";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconBuilding, IconArrowLeft } from "@tabler/icons-react";

// Componentes dos steps
import { CNPJInputStep } from "@/components/company-register/cnpj-input-step";
import { CompanyConfirmationStep } from "@/components/company-register/company-confirmation-step";
import { EmailVerificationStep } from "@/components/company-register/email-verification-step";
import { SuccessStep } from "@/components/company-register/success-step";
import { StepIndicator } from "@/components/company-register/step-indicator";

// Types
import { RegistrationStep, type RegistrationState } from "@/types/registration";

interface CompanyRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (company: any) => void;
}

interface CreateCompanyResponse {
  id: string;
  name: string;
  legal_name: string;
  document_number: string;
  email: string;
  phone_number?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country: string;
  created_at: string;
  updated_at: string;
}

export function CompanyRegisterDialog({
  isOpen,
  onClose,
  onSuccess,
}: CompanyRegisterDialogProps) {
  const { tokens } = useAuth();
  const router = useRouter();
  const { post } = useApi();
  const {
    data: cnpjData,
    isLoading: cnpjLoading,
    error: cnpjError,
    fetchCNPJ,
    clearData,
  } = useCNPJ();

  const [state, setState] = useState<RegistrationState>({
    currentStep: RegistrationStep.CNPJ_INPUT,
    cnpjInput: "",
    verificationCode: "",
    createdCompany: null,
    isCreating: false,
    isVerifying: false,
    isResending: false,
  });

  // Reset do dialog
  const handleClose = () => {
    setState({
      currentStep: RegistrationStep.CNPJ_INPUT,
      cnpjInput: "",
      verificationCode: "",
      createdCompany: null,
      isCreating: false,
      isVerifying: false,
      isResending: false,
    });
    clearData();
    onClose();
  };

  // Update state helper
  const updateState = (updates: Partial<RegistrationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Step 1: Buscar CNPJ
  const handleSearchCNPJ = async () => {
    if (state.cnpjInput.trim()) {
      await fetchCNPJ(state.cnpjInput);
      // Aguardar a resposta e verificar se deu certo
      setTimeout(() => {
        if (cnpjData && !cnpjError) {
          updateState({ currentStep: RegistrationStep.COMPANY_CONFIRMATION });
        }
      }, 100);
    }
  };

  // Step 2: Criar empresa usando useApi
  const handleCreateCompany = async () => {
    if (!cnpjData || !tokens?.accessToken) return;

    updateState({ isCreating: true });

    try {
      const payload = {
        name: cnpjData.nome_fantasia || cnpjData.razao_social,
        legal_name: cnpjData.razao_social,
        document_number: cnpjData.cnpj,
        email: cnpjData.email,
        phone_number: cnpjData.telefone,
        address_street: cnpjData.logradouro,
        address_number: cnpjData.numero,
        address_complement: cnpjData.complemento,
        address_neighborhood: cnpjData.bairro,
        address_city: cnpjData.municipio,
        address_state: cnpjData.uf,
        address_zip_code: cnpjData.cep,
        address_country: "BR",
      };

      const response = await post<CreateCompanyResponse>(
        appConfig.urls.api.endpoints.companies.create,
        payload,
        {
          showErrorToast: true,
          showSuccessToast: false, // Vamos mostrar nosso próprio toast
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        updateState({
          createdCompany: response.data,
          currentStep: RegistrationStep.EMAIL_VERIFICATION,
          isCreating: false,
        });

        toast.success("Empresa criada!", {
          description: "Código de verificação enviado por email.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao criar empresa", {
        description: errorMessage,
      });
      updateState({ isCreating: false });
    }
  };

  // Step 3: Verificar código usando useApi
  const handleVerifyCode = async () => {
    if (
      !state.createdCompany ||
      !tokens?.accessToken ||
      state.verificationCode.length !== 6
    ) {
      return;
    }

    updateState({ isVerifying: true });

    try {
      const response = await post(
        appConfig.urls.api.endpoints.companies.verify(state.createdCompany.id),
        {
          validationCode: state.verificationCode,
        },
        {
          showErrorToast: true,
          showSuccessToast: false,
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      updateState({
        currentStep: RegistrationStep.SUCCESS,
        isVerifying: false,
      });

      toast.success("Empresa ativada!", {
        description: "Sua empresa foi ativada com sucesso.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro na verificação", {
        description: errorMessage,
      });
      updateState({ isVerifying: false });
    }
  };

  // Reenviar código usando useApi
  const handleResendCode = async () => {
    if (!state.createdCompany || !tokens?.accessToken) return;

    updateState({ isResending: true });

    try {
      const response = await post(
        appConfig.urls.api.endpoints.companies.resendValidation(
          state.createdCompany.id
        ),
        {},
        {
          showErrorToast: true,
          showSuccessToast: false,
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Código reenviado!", {
        description: "Um novo código foi enviado para seu email.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao reenviar código", {
        description: errorMessage,
      });
    } finally {
      updateState({ isResending: false });
    }
  };

  // Step 4: Finalizar
  const handleFinish = () => {
    onSuccess(state.createdCompany);
    handleClose();
    // Redirecionar para dashboard da empresa
    if (state.createdCompany?.id) {
      router.push(`/dashboard/companies/${state.createdCompany.id}`);
    }
  };

  // Ir para configurações
  const handleGoToSettings = () => {
    onSuccess(state.createdCompany);
    handleClose();
    // Redirecionar para configurações da empresa
    if (state.createdCompany?.id) {
      router.push(`/dashboard/companies/${state.createdCompany.id}/settings`);
    }
  };

  // Navegação entre steps
  const handleBackStep = () => {
    if (state.currentStep === RegistrationStep.COMPANY_CONFIRMATION) {
      updateState({ currentStep: RegistrationStep.CNPJ_INPUT });
    } else if (state.currentStep === RegistrationStep.EMAIL_VERIFICATION) {
      updateState({ currentStep: RegistrationStep.COMPANY_CONFIRMATION });
    }
  };

  // Configurações do dialog baseado no step
  const getDialogConfig = () => {
    switch (state.currentStep) {
      case RegistrationStep.CNPJ_INPUT:
        return {
          title: "Registrar Empresa",
          description:
            "Digite o CNPJ da sua empresa para buscar os dados na Receita Federal",
        };
      case RegistrationStep.COMPANY_CONFIRMATION:
        return {
          title: "Confirmar Dados",
          description:
            "Verifique os dados da empresa e confirme o email de verificação",
        };
      case RegistrationStep.EMAIL_VERIFICATION:
        return {
          title: "Verificar Email",
          description: "Digite o código de verificação enviado para seu email",
        };
      case RegistrationStep.SUCCESS:
        return {
          title: "Empresa Ativada!",
          description: "Sua empresa foi registrada e ativada com sucesso",
        };
      default:
        return {
          title: "Registrar Empresa",
          description: "Processo de registro da empresa",
        };
    }
  };

  const dialogConfig = getDialogConfig();
  const stepLabels = ["CNPJ", "Confirmar", "Verificar", "Sucesso"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <IconBuilding className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            <span className="truncate">{dialogConfig.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            {dialogConfig.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Indicador de progresso */}
          <div className="w-full">
            <StepIndicator
              currentStep={state.currentStep}
              totalSteps={4}
              stepLabels={stepLabels}
            />
          </div>

          {/* Renderizar step atual */}
          <div>
            {state.currentStep === RegistrationStep.CNPJ_INPUT && (
              <CNPJInputStep
                cnpjInput={state.cnpjInput}
                onCnpjChange={(value) => updateState({ cnpjInput: value })}
                onSearch={handleSearchCNPJ}
                isLoading={cnpjLoading}
                error={cnpjError}
                onNext={() =>
                  cnpjData &&
                  !cnpjError &&
                  updateState({
                    currentStep: RegistrationStep.COMPANY_CONFIRMATION,
                  })
                }
              />
            )}

            {state.currentStep === RegistrationStep.COMPANY_CONFIRMATION &&
              cnpjData && (
                <CompanyConfirmationStep
                  cnpjData={cnpjData}
                  onConfirm={handleCreateCompany}
                  isCreating={state.isCreating}
                />
              )}

            {state.currentStep === RegistrationStep.EMAIL_VERIFICATION &&
              cnpjData && (
                <EmailVerificationStep
                  email={cnpjData.email}
                  verificationCode={state.verificationCode}
                  onCodeChange={(value) =>
                    updateState({ verificationCode: value })
                  }
                  onVerify={handleVerifyCode}
                  onResendCode={handleResendCode}
                  isVerifying={state.isVerifying}
                  isResending={state.isResending}
                />
              )}

            {state.currentStep === RegistrationStep.SUCCESS &&
              state.createdCompany && (
                <SuccessStep
                  companyName={state.createdCompany.name || "Sua empresa"}
                  onFinish={handleFinish}
                  onGoToSettings={handleGoToSettings}
                />
              )}
          </div>
        </div>

        {/* Footer com botões condicionais */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
          {/* Botão Voltar */}
          {(state.currentStep === RegistrationStep.COMPANY_CONFIRMATION ||
            state.currentStep === RegistrationStep.EMAIL_VERIFICATION) && (
            <Button
              variant="outline"
              onClick={handleBackStep}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}

          {/* Botão Cancelar */}
          {state.currentStep !== RegistrationStep.SUCCESS &&
            state.currentStep !== RegistrationStep.EMAIL_VERIFICATION &&
            state.currentStep !== RegistrationStep.COMPANY_CONFIRMATION && (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Cancelar
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
