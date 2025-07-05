"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconCheck,
  IconRefresh,
  IconMail,
  IconAlertCircle,
} from "@tabler/icons-react";
import type { CNPJData } from "@/hooks/useCNPJ";

interface CompanyConfirmationStepProps {
  cnpjData: CNPJData;
  onConfirm: () => void;
  isCreating: boolean;
}

export function CompanyConfirmationStep({
  cnpjData,
  onConfirm,
  isCreating,
}: CompanyConfirmationStepProps) {
  const canProceed = cnpjData.email && cnpjData.situacao === "Ativa";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Card único com nome e email */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Empresa Encontrada
          </CardTitle>
          <CardDescription className="text-sm">
            Confirme os dados abaixo para prosseguir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          {/* Nome da empresa */}
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
              Nome da empresa
            </p>
            <p className="text-sm sm:text-base font-medium break-words">
              {cnpjData.nome_fantasia || cnpjData.razao_social}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <IconMail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Email para verificação</span>
            </p>
            {cnpjData.email ? (
              <div className="bg-muted p-2 sm:p-3 rounded-md border">
                <p className="font-mono text-xs sm:text-sm break-all">
                  {cnpjData.email}
                </p>
              </div>
            ) : (
              <Alert variant="destructive" className="mt-2">
                <IconAlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <AlertDescription className="text-xs sm:text-sm">
                  Email não encontrado na Receita Federal. É necessário ter um
                  email cadastrado.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Situação da empresa */}
      {cnpjData.situacao !== "Ativa" && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            Empresa com situação:{" "}
            <span className="font-medium">{cnpjData.situacao}</span>. Apenas
            empresas ativas podem ser cadastradas.
          </AlertDescription>
        </Alert>
      )}

      {/* Botão de confirmação */}
      <div className="pt-2 sm:pt-4">
        <Button
          onClick={onConfirm}
          disabled={!canProceed || isCreating}
          className="w-full h-10 sm:h-11"
          size="default"
        >
          {isCreating ? (
            <>
              <IconRefresh className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin flex-shrink-0" />
              <span className="text-sm sm:text-base">Criando empresa...</span>
            </>
          ) : (
            <>
              <IconCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="text-sm sm:text-base">
                Confirmar e Criar Empresa
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
