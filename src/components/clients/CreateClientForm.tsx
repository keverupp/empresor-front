"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Mail, Phone, MapPin, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/apiInterfaces";

import { formatDocument, formatPhone, formatCEP } from "@/lib/format-utils";

import { isValidCPF, isValidCNPJ } from "@/lib/validators"; // ajuste o caminho

const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone_number: z.string().optional(),
  document_number: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true; // se vazio, passa
        return isValidCPF(value) || isValidCNPJ(value);
      },
      {
        message: "CPF ou CNPJ inválido",
      }
    ),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zip_code: z.string().optional(),
  notes: z.string().optional(),
});

type CreateClientFormData = z.infer<typeof createClientSchema>;

interface CreateClientFormProps {
  companyId: string;
  onSubmit: (
    data: Omit<Client, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  isSubmitting?: boolean;
}

export default function CreateClientForm({
  companyId,
  onSubmit,
  isSubmitting = false,
}: CreateClientFormProps) {
  const [currentStep, setCurrentStep] = useState<"basic" | "address" | "notes">(
    "basic"
  );

  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      document_number: "",
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip_code: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: CreateClientFormData) => {
    if (currentStep !== "notes") return;

    const payload = {
      ...data,
      company_id: companyId,
      email: data.email || null,
      phone_number: data.phone_number || null,
      document_number: data.document_number || null,
      address_street: data.address_street || null,
      address_city: data.address_city || null,
      address_state: data.address_state || null,
      address_zip_code: data.address_zip_code || null,
      notes: data.notes || null,
    };

    await onSubmit(payload);
  };

  const steps = [
    { id: "basic", label: "Dados Básicos", icon: User },
    { id: "address", label: "Endereço", icon: MapPin },
    { id: "notes", label: "Observações", icon: FileText },
  ];

  const nextStep = () => {
    if (currentStep === "basic") {
      const name = form.getValues("name");
      if (!name || name.trim() === "") {
        form.setError("name", { message: "Nome é obrigatório" });
        return;
      }
      setTimeout(() => setCurrentStep("address"), 50);
    } else if (currentStep === "address") {
      setTimeout(() => setCurrentStep("notes"), 50);
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const prevStep = () => {
    if (currentStep === "notes") setCurrentStep("address");
    else if (currentStep === "address") setCurrentStep("basic");
  };

  const canProceed = () => {
    if (currentStep === "basic") {
      const name = form.watch("name");
      return name && name.trim().length > 0;
    }
    return true;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 sm:space-y-6"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (currentStep !== "notes") {
              e.preventDefault();
              if (canProceed()) nextStep();
            } else {
              e.stopPropagation();
            }
          }
        }}
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center sm:justify-between gap-2 sm:gap-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted =
              steps.findIndex((s) => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                    ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground text-muted-foreground"
                    }
                  `}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {step.label}
                  </Badge>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-4 sm:w-16 h-0.5 ml-2 sm:ml-4 transition-colors
                      ${isCompleted ? "bg-green-500" : "bg-muted"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="min-h-[280px] sm:min-h-[320px]">
          {currentStep === "basic" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-sm">
              <CardHeader className="px-0 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Dados Básicos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo"
                          {...field}
                          disabled={isSubmitting}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@exemplo.com"
                            type="email"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(formatPhone(e.target.value))
                            }
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(formatDocument(e.target.value))
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === "address" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-sm">
              <CardHeader className="px-0 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6 space-y-4">
                <FormField
                  control={form.control}
                  name="address_street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua/Logradouro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua das Flores, 123"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="São Paulo"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SP"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(formatCEP(e.target.value))
                          }
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === "notes" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-sm">
              <CardHeader className="px-0 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Observações
                  <Badge variant="outline" className="ml-2 text-xs">
                    Etapa final
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas sobre o cliente (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione observações relevantes sobre o cliente..."
                          rows={6}
                          {...field}
                          disabled={isSubmitting}
                          className="resize-none"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "basic" || isSubmitting}
            className="w-full sm:w-auto"
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep !== "notes" ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="w-full sm:w-auto"
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Criar Cliente"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
