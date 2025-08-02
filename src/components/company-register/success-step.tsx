"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheck,
  IconArrowRight,
  IconBuilding,
} from "@tabler/icons-react";

interface SuccessStepProps {
  companyName: string;
  onFinish: () => void;
  onGoToSettings?: () => void;
}

export function SuccessStep({ companyName, onFinish }: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Ícone de sucesso + título */}
      <div className="flex flex-col items-center space-y-2">
        <IconCircleCheck className="w-12 h-12 text-green-600" />
        <h3 className="text-lg font-semibold">Empresa ativada</h3>
        <p className="text-sm text-muted-foreground">
          <strong>{companyName}</strong> foi registrada e ativada com sucesso.
        </p>
        <Badge variant="outline" className="text-green-700 border-green-300">
          <IconBuilding className="w-3 h-3 mr-1" />
          Empresa Ativa
        </Badge>
      </div>

      {/* Próximos passos minimal */}
      <div className="space-y-3 text-left border-l-2 border-muted pl-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Próximos passos
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Revisar e completar dados da empresa</li>
          <li>• Configurar preferências de PDF</li>
          <li>• Adicionar logo da empresa</li>
          <li>• Começar a cadastrar clientes</li>
        </ul>
      </div>

      {/* Botões */}
      <div className="space-y-3">
        <Button onClick={onFinish} className="w-full">
          <IconArrowRight className="w-4 h-4 mr-2" />
          Ir para Dashboard
        </Button>
      </div>

      {/* Mensagem adicional */}
      <p className="text-xs text-muted-foreground">
        Sua empresa já está disponível na sidebar para usar todas as
        funcionalidades do sistema.
      </p>
    </div>
  );
}
