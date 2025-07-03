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
    <div className="space-y-4">
      {/* Card único com nome e email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empresa Encontrada</CardTitle>
          <CardDescription>
            Confirme os dados abaixo para prosseguir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nome da empresa
            </p>
            <p className="text-base">
              {cnpjData.nome_fantasia || cnpjData.razao_social}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconMail className="w-4 h-4" />
              Email para verificação
            </p>
            {cnpjData.email ? (
              <p className="font-mono text-sm bg-muted p-2 rounded">
                {cnpjData.email}
              </p>
            ) : (
              <Alert variant="destructive" className="mt-2">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
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
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Empresa com situação: {cnpjData.situacao}. Apenas empresas ativas
            podem ser cadastradas.
          </AlertDescription>
        </Alert>
      )}

      {/* Botão de confirmação */}
      <Button
        onClick={onConfirm}
        disabled={!canProceed || isCreating}
        className="w-full"
      >
        {isCreating ? (
          <>
            <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
            Criando empresa...
          </>
        ) : (
          <>
            <IconCheck className="w-4 h-4 mr-2" />
            Confirmar e Criar Empresa
          </>
        )}
      </Button>
    </div>
  );
}
