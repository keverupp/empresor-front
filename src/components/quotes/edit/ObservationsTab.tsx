// _components/ObservationsTab.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Eye,
  Lock,
  FileText,
  Copy,
  RotateCcw,
  Info,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { QuoteFormData } from "@/lib/quote-schemas";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ObservationsTab({
  form,
}: {
  form: UseFormReturn<QuoteFormData>;
}) {
  const [setActiveTemplate] = useState<string | null>(null);

  // Watch form values para contagem de caracteres
  const notes = form.watch("notes") || "";
  const internalNotes = form.watch("internal_notes") || "";
  const termsAndConditions = form.watch("terms_and_conditions_content") || "";

  // Templates pré-definidos
  const templates = {
    notes: [
      "Proposta válida conforme especificações apresentadas.",
      "Valores incluem instalação e configuração básica.",
      "Suporte técnico incluso por 12 meses.",
      "Prazo de entrega: 15 dias úteis após aprovação.",
    ],
    terms: [
      `TERMOS E CONDIÇÕES:

1. VALIDADE DA PROPOSTA
Esta proposta é válida por 30 dias a partir da data de emissão.

2. FORMA DE PAGAMENTO
50% de entrada e 50% na entrega, mediante apresentação de nota fiscal.

3. PRAZO DE ENTREGA
O prazo de entrega será informado após confirmação do pedido.

4. GARANTIA
Garantia de 12 meses contra defeitos de fabricação.

5. CANCELAMENTO
Cancelamentos só serão aceitos até 24h após a aprovação da proposta.`,

      `CONDIÇÕES COMERCIAIS:

• Preços válidos por 15 dias
• Pagamento: À vista com 5% de desconto ou parcelado
• Entrega: FOB nossa empresa
• Garantia: 6 meses
• Validade: 30 dias`,

      `OBSERVAÇÕES IMPORTANTES:

- Valores sujeitos a alteração sem aviso prévio
- Não inclui custos de deslocamento
- Material de consumo por conta do cliente
- Agendamento prévio obrigatório`,
    ],
  };

  // Função para aplicar template
  const applyTemplate = (field: keyof typeof templates, index: number) => {
    if (field === "notes") {
      form.setValue("notes", templates.notes[index]);
    } else if (field === "terms") {
      form.setValue("terms_and_conditions_content", templates.terms[index]);
    }
    setActiveTemplate(null);
  };

  // Função para limpar campo
  const clearField = (fieldName: string) => {
    form.setValue(fieldName as any, "");
  };

  // Verificar se há conteúdo nos campos
  const hasNotes = notes.trim().length > 0;
  const hasInternalNotes = internalNotes.trim().length > 0;
  const hasTerms = termsAndConditions.trim().length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com status */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Observações e Termos</h3>
              <p className="text-sm text-muted-foreground">
                Informações adicionais e condições comerciais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={hasNotes ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              {hasNotes ? "Com observações" : "Sem observações"}
            </Badge>
            <Badge
              variant={hasTerms ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              {hasTerms ? "Termos definidos" : "Sem termos"}
            </Badge>
          </div>
        </div>

        {/* Contadores de progresso */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Cliente</div>
            <div className="font-semibold text-sm">
              {notes.length > 0 ? `${notes.length} chars` : "Vazio"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Interno</div>
            <div className="font-semibold text-sm">
              {internalNotes.length > 0
                ? `${internalNotes.length} chars`
                : "Vazio"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Termos</div>
            <div className="font-semibold text-sm">
              {termsAndConditions.length > 0
                ? `${termsAndConditions.length} chars`
                : "Vazio"}
            </div>
          </div>
        </div>
      </div>

      {/* Observações do Cliente e Internas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Observações para o Cliente */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Observações para o Cliente</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                Visível no orçamento
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Informações adicionais
                </Label>
                <div className="flex items-center gap-1">
                  {hasNotes && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearField("notes")}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {notes.length}/500
                  </span>
                </div>
              </div>

              <Textarea
                id="notes"
                rows={4}
                maxLength={500}
                placeholder="Ex: Proposta válida conforme especificações apresentadas..."
                {...form.register("notes")}
                className={cn(
                  "resize-none",
                  notes.length > 450 && "border-amber-200 dark:border-amber-800"
                )}
              />

              {notes.length > 450 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Próximo ao limite de caracteres
                </p>
              )}
            </div>

            {/* Templates rápidos */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Templates rápidos:
              </Label>
              <div className="flex flex-wrap gap-1">
                {templates.notes.map((template, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyTemplate("notes", index)}
                    className="h-6 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Template {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Observações Internas */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Observações Internas</h4>
              </div>
              <Badge variant="secondary" className="text-xs">
                Uso interno
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="internal_notes" className="text-sm font-medium">
                  Anotações da equipe
                </Label>
                <div className="flex items-center gap-1">
                  {hasInternalNotes && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearField("internal_notes")}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {internalNotes.length}/1000
                  </span>
                </div>
              </div>

              <Textarea
                id="internal_notes"
                rows={4}
                maxLength={1000}
                placeholder="Ex: Cliente demonstrou interesse em produtos adicionais, negociação de prazo possível..."
                {...form.register("internal_notes")}
                className={cn(
                  "resize-none",
                  internalNotes.length > 900 &&
                    "border-amber-200 dark:border-amber-800"
                )}
              />

              {internalNotes.length > 900 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Próximo ao limite de caracteres
                </p>
              )}
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                <strong>Lembrete:</strong> Estas observações são apenas para uso
                interno e não aparecerão no orçamento enviado ao cliente.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>

      {/* Termos e Condições */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Termos e Condições</h4>
            </div>
            <div className="flex items-center gap-2">
              {hasTerms && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <Badge
                variant={hasTerms ? "default" : "secondary"}
                className="text-xs"
              >
                {hasTerms ? "Definidos" : "Não definidos"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="terms_and_conditions_content"
                className="text-sm font-medium"
              >
                Condições comerciais e legais
              </Label>
              <div className="flex items-center gap-1">
                {hasTerms && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField("terms_and_conditions_content")}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {termsAndConditions.length}/2000
                </span>
              </div>
            </div>

            <Textarea
              id="terms_and_conditions_content"
              rows={6}
              maxLength={2000}
              placeholder="Ex: 1. VALIDADE DA PROPOSTA: Esta proposta é válida por 30 dias..."
              {...form.register("terms_and_conditions_content")}
              className={cn(
                "resize-none font-mono text-sm",
                termsAndConditions.length > 1800 &&
                  "border-amber-200 dark:border-amber-800"
              )}
            />

            {termsAndConditions.length > 1800 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Próximo ao limite de caracteres
              </p>
            )}
          </div>

          {/* Templates para Termos */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Templates de termos e condições:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {templates.terms.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate("terms", index)}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Copy className="h-3 w-3" />
                      <span className="font-medium text-xs">
                        Template {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {index === 0 && "Termos completos com garantia"}
                      {index === 1 && "Condições comerciais básicas"}
                      {index === 2 && "Observações importantes"}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Dicas e orientações */}
      <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
        <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription className="text-emerald-800 dark:text-emerald-200">
          <strong>Dicas para melhorar seu orçamento:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              • <strong>Observações claras:</strong> Destaque informações
              importantes como prazos e inclusos
            </li>
            <li>
              • <strong>Termos detalhados:</strong> Defina condições de
              pagamento, garantias e cancelamento
            </li>
            <li>
              • <strong>Linguagem profissional:</strong> Use termos técnicos
              apropriados mas compreensíveis
            </li>
            <li>
              • <strong>Informações internas:</strong> Anote detalhes da
              negociação para futuras referências
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Status final */}
      {(hasNotes || hasInternalNotes || hasTerms) && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Documentação Configurada
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  hasNotes ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              ></div>
              <span
                className={
                  hasNotes
                    ? "text-green-700 dark:text-green-300"
                    : "text-muted-foreground"
                }
              >
                Observações do cliente
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  hasInternalNotes
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              ></div>
              <span
                className={
                  hasInternalNotes
                    ? "text-green-700 dark:text-green-300"
                    : "text-muted-foreground"
                }
              >
                Anotações internas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  hasTerms ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              ></div>
              <span
                className={
                  hasTerms
                    ? "text-green-700 dark:text-green-300"
                    : "text-muted-foreground"
                }
              >
                Termos e condições
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
