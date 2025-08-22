"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
  Users,
} from "lucide-react";

export function QuoteViewClient({ client, quote, companyId }: Props) {
  // Usar companyId do prop ou fallback para quote.company_id
  const effectiveCompanyId = companyId || quote.company_id;

  // Verificar completude dos dados básicos
  const hasBasicInfo = !!(client.name && client.email);
  const hasContactInfo = !!client.phone_number;

  // Detectar tipo de documento
  const getDocumentType = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, "");
    if (cleanDoc.length === 11) return "CPF";
    if (cleanDoc.length === 14) return "CNPJ";
    return "Documento";
  };

  const documentType = client.document_number
    ? getDocumentType(client.document_number)
    : "";

  // Navegar para página do cliente
  const goToClientPage = () => {
    if (!effectiveCompanyId) {
      console.error("Company ID não disponível");
      return;
    }
    window.open(
      `/dashboard/companies/${effectiveCompanyId}/clients/${client.id}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com ações do cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Informações do Cliente</h3>
            <p className="text-sm text-muted-foreground">
              {client.name} • {documentType && `${documentType} • `}
              {hasBasicInfo && hasContactInfo
                ? "Dados completos"
                : "Dados básicos"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={goToClientPage}
            disabled={!effectiveCompanyId}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Ver perfil completo</span>
            <span className="sm:hidden">Ver perfil</span>
          </Button>

          <Badge
            variant={hasBasicInfo && hasContactInfo ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {hasBasicInfo && hasContactInfo ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {hasBasicInfo && hasContactInfo ? "Completo" : "Básico"}
          </Badge>
        </div>
      </div>

      {/* Alerta para dados incompletos */}
      {(!hasBasicInfo || !hasContactInfo) && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Informações limitadas do cliente.</strong>
            {!hasBasicInfo && " Falta e-mail para contato."}
            {!hasContactInfo && " Falta telefone para contato."}{" "}
            <button
              onClick={goToClientPage}
              disabled={!effectiveCompanyId}
              className="underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clique aqui para completar o cadastro.
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
