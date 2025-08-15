"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  User,
  Building2,
  FileText,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
  Users,
} from "lucide-react";
import type { Client, Quote } from "@/types/apiInterfaces";
import { useState } from "react";

type Props = {
  client: Client;
  quote: Quote;
  companyId?: string; // Opcional, usa quote.company_id como fallback
};

export function QuoteViewClient({ client, quote, companyId }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Usar companyId do prop ou fallback para quote.company_id
  const effectiveCompanyId = companyId || quote.company_id;

  // Verificar completude dos dados básicos
  const hasBasicInfo = !!(client.name && client.email);
  const hasContactInfo = !!client.phone_number;
  const hasDocument = !!client.document_number;

  // Função para copiar texto
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  // Detectar tipo de documento
  const getDocumentType = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, "");
    if (cleanDoc.length === 11) return "CPF";
    if (cleanDoc.length === 14) return "CNPJ";
    return "Documento";
  };

  // Formatar documento
  const formatDocument = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, "");
    if (cleanDoc.length === 11) {
      return `${cleanDoc.slice(0, 3)}.${cleanDoc.slice(3, 6)}.${cleanDoc.slice(
        6,
        9
      )}-${cleanDoc.slice(9)}`;
    }
    if (cleanDoc.length === 14) {
      return `${cleanDoc.slice(0, 2)}.${cleanDoc.slice(2, 5)}.${cleanDoc.slice(
        5,
        8
      )}/${cleanDoc.slice(8, 12)}-${cleanDoc.slice(12)}`;
    }
    return doc;
  };

  const documentType = client.document_number
    ? getDocumentType(client.document_number)
    : "";
  const formattedDocument = client.document_number
    ? formatDocument(client.document_number)
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

      <Card className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Dados Pessoais</h4>
              {hasBasicInfo && hasDocument && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(client.name, "name")}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "name" ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="font-medium">{client.name}</div>
                </div>
              </div>

              {/* Documento */}
              {client.document_number && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      {documentType}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formattedDocument, "document")
                      }
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "document" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{formattedDocument}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Contato</h4>
              {hasContactInfo && hasBasicInfo && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* E-mail */}
              {client.email && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      E-mail
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`mailto:${client.email}`, "_blank")
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(client.email!, "email")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "email" ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Telefone */}
              {client.phone_number && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`tel:${client.phone_number}`, "_blank")
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(client.phone_number!, "phone")
                        }
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "phone" ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone_number}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campos faltantes */}
            {(!client.email || !client.phone_number) && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Informações de contato incompletas
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      {!client.email && "E-mail não cadastrado. "}
                      {!client.phone_number && "Telefone não cadastrado."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Empresa (se for CNPJ) */}
          {documentType === "CNPJ" && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Informações da Empresa</h4>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Cliente Pessoa Jurídica
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Este orçamento é destinado a uma empresa ou pessoa jurídica.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
