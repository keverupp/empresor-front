// src/components/company-activation-modal.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appConfig } from "@/config/app";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconMail,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";

import type { Company } from "@/types/company";

interface CompanyActivationModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompanyActivationModal({
  company,
  isOpen,
  onClose,
  onSuccess,
}: CompanyActivationModalProps) {
  const { tokens } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Reset do modal ao fechar
  const handleClose = () => {
    setVerificationCode("");
    setIsVerifying(false);
    setIsResending(false);
    onClose();
  };

  // Verificar código de ativação
  const handleVerifyCode = async () => {
    if (!company || !tokens?.accessToken || verificationCode.length !== 6) {
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${
          appConfig.development.api.baseURL
        }${appConfig.urls.api.endpoints.companies.verify(company.id)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            validationCode: verificationCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao verificar código");
      }

      toast.success("Empresa ativada!", {
        description: "Sua empresa foi ativada com sucesso.",
      });

      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro na verificação", {
        description: errorMessage,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Reenviar email de validação
  const handleResendEmail = async () => {
    if (!company || !tokens?.accessToken) {
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(
        `${
          appConfig.development.api.baseURL
        }${appConfig.urls.api.endpoints.companies.resendValidation(
          company.id
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao reenviar email");
      }

      toast.success("Email reenviado!", {
        description:
          "Um novo código de verificação foi enviado para seu email.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao reenviar email", {
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="w-5 h-5 text-amber-500" />
            Ativar Empresa
          </DialogTitle>
          <DialogDescription>
            Sua empresa <strong>{company.name}</strong> precisa ser ativada
            antes de poder acessar suas funcionalidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status da empresa */}
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <p className="font-medium text-amber-900">{company.name}</p>
              <p className="text-sm text-amber-700">{company.email}</p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-100 text-amber-800"
            >
              Pendente
            </Badge>
          </div>

          <Separator />

          {/* Instruções */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <IconMail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Verificação por Email</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um código de 6 dígitos para{" "}
                  <strong>{company.email}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Input do código */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Digite o código de verificação
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4 mr-2" />
                  Ativar Empresa
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <IconMail className="w-4 h-4 mr-2" />
                  Reenviar Email
                </>
              )}
            </Button>
          </div>

          {/* Nota adicional */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p>
              <strong>Não recebeu o email?</strong> Verifique sua caixa de spam
              ou clique em `&quot;`Reenviar Email`&quot;` para receber um novo
              código.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
