import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
  formatCEP,
} from "@brazilian-utils/brazilian-utils";
import { formatDocument, formatPhone } from "@/lib/format-utils";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Loader2,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCNPJ } from "@/hooks/useCNPJ";
import { StepIndicator } from "@/components/company-register/step-indicator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const validateDocument = (value: string) => {
  if (!value) return true; // Opcional

  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length === 11) {
    return isValidCPF(cleanValue);
  } else if (cleanValue.length === 14) {
    return isValidCNPJ(cleanValue);
  }

  return false;
};

// Schema de validação com Zod - Ajustado para API
const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  document_number: z
    .string()
    .optional()
    .refine(validateDocument, "CPF ou CNPJ inválido")
    .or(z.literal("")),
  address_street: z.string().optional().or(z.literal("")),
  address_city: z.string().optional().or(z.literal("")),
  address_state: z.string().optional().or(z.literal("")),
  address_zip_code: z
    .string()
    .optional()
    .refine(
      (value) => !value || isValidCEP(value.replace(/\D/g, "")),
      "CEP inválido"
    )
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// Tipo para envio à API (com null)
export type ClientApiData = {
  name: string;
  email?: string | null;
  phone_number?: string | null;
  document_number?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  notes?: string | null;
};

type ClientFormData = z.infer<typeof clientSchema>;

const steps = [
  {
    id: "document",
    title: "CPF/CNPJ",
    description: "Identificação do cliente",
  },
  { id: "basic", title: "Dados Básicos", description: "Informações pessoais" },
  { id: "address", title: "Endereço", description: "Localização do cliente" },
  { id: "notes", title: "Observações", description: "Informações adicionais" },
];

const stepLabels = ["CPF/CNPJ", "Dados", "Endereço", "Observações"];

const estados = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

interface CreateClientFormProps {
  companyId: string;
  onSubmit: (data: ClientApiData) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateClientForm({
  onSubmit,
  isSubmitting,
}: CreateClientFormProps) {
  const [currentStep, setCurrentStep] = useState(1); // StepIndicator começa em 1
  const [stateComboOpen, setStateComboOpen] = useState(false);

  const {
    data: cnpjData,
    isLoading: cnpjLoading,
    error: cnpjError,
    fetchCNPJ,
    clearData,
  } = useCNPJ();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
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

  const watchedState = watch("address_state");
  const watchedDocument = watch("document_number");

  // Auto-preencher dados quando CNPJ é consultado
  useEffect(() => {
    if (cnpjData) {
      // Preencher nome com nome fantasia
      setValue("name", cnpjData.nome_fantasia || cnpjData.razao_social || "");

      // Preencher email se disponível
      if (cnpjData.email) {
        setValue("email", cnpjData.email);
      }

      // Preencher telefone se disponível
      if (cnpjData.telefone) {
        setValue("phone_number", cnpjData.telefone);
      }

      // Preencher endereço
      const enderecoCompleto = `${cnpjData.logradouro}${
        cnpjData.numero ? ", " + cnpjData.numero : ""
      }${cnpjData.complemento ? ", " + cnpjData.complemento : ""}${
        cnpjData.bairro ? ", " + cnpjData.bairro : ""
      }`;
      setValue("address_street", enderecoCompleto.trim());
      setValue("address_city", cnpjData.municipio || "");
      setValue("address_state", cnpjData.uf || "");
      setValue("address_zip_code", cnpjData.cep || "");

      toast.success("Dados preenchidos automaticamente!", {
        description: "Revise as informações antes de continuar.",
      });
    }
  }, [cnpjData, setValue]);

  // Detectar tipo de documento e buscar CNPJ automaticamente
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setValue("document_number", formatted);

    // Se for CNPJ (14 dígitos) e estiver válido, buscar automaticamente
    const cleanValue = e.target.value.replace(/\D/g, "");
    if (cleanValue.length === 14 && isValidCNPJ(cleanValue)) {
      fetchCNPJ(cleanValue);
    } else if (cnpjData) {
      // Limpar dados se documento mudou
      clearData();
    }
  };

  const handleCNPJSearch = () => {
    const cleanValue = watchedDocument?.replace(/\D/g, "") || "";
    if (cleanValue.length === 14 && isValidCNPJ(cleanValue)) {
      fetchCNPJ(cleanValue);
    } else {
      toast.error("CNPJ inválido para consulta");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone_number", formatted);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue("address_zip_code", formatted);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof ClientFormData)[] => {
    switch (step) {
      case 1:
        return ["document_number"];
      case 2:
        return ["name", "email", "phone_number"];
      case 3:
        return [
          "address_zip_code",
          "address_street",
          "address_city",
          "address_state",
        ];
      case 4:
        return ["notes"];
      default:
        return [];
    }
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      // Limpar dados para envio - remover formatação e converter vazios para null
      const cleanData: ClientApiData = {
        name: data.name,
        email: data.email || undefined,
        phone_number: data.phone_number
          ? data.phone_number.replace(/\D/g, "")
          : undefined,
        document_number: data.document_number
          ? data.document_number.replace(/\D/g, "")
          : undefined,
        address_street: data.address_street || undefined,
        address_city: data.address_city || undefined,
        address_state: data.address_state || undefined,
        address_zip_code: data.address_zip_code
          ? data.address_zip_code.replace(/\D/g, "")
          : undefined,
        notes: data.notes || undefined,
      };

      await onSubmit(cleanData);

      // Reset do formulário após sucesso
      reset();
      setCurrentStep(1);
      clearData();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao criar cliente. Tente novamente.");
    }
  };

  // Verificar se é CNPJ
  const isCNPJ = (doc: string) => {
    const clean = doc?.replace(/\D/g, "") || "";
    return clean.length === 14;
  };

  return (
    <div className="w-full max-w-none">
      <Card className="border-0 shadow-none bg-background">
        <CardContent className="p-0 space-y-6">
          {/* Step Indicator */}
          <div className="space-y-4">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={4}
              stepLabels={stepLabels}
              onStepChange={setCurrentStep}
            />

            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Etapa 1: CPF/CNPJ */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="document_number"
                      {...register("document_number")}
                      onChange={handleDocumentChange}
                      placeholder="Digite o CPF ou CNPJ"
                      maxLength={18}
                      className={
                        errors.document_number ? "border-destructive" : ""
                      }
                    />
                    {isCNPJ(watchedDocument) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCNPJSearch}
                        disabled={cnpjLoading}
                      >
                        {cnpjLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {errors.document_number && (
                    <p className="text-sm text-destructive">
                      {errors.document_number.message}
                    </p>
                  )}
                  {cnpjError && (
                    <p className="text-sm text-destructive">{cnpjError}</p>
                  )}
                  {cnpjData && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        ✓ CNPJ encontrado:{" "}
                        <strong>
                          {cnpjData.nome_fantasia || cnpjData.razao_social}
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 2: Dados Básicos */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Digite o nome completo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="Digite o email"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefone</Label>
                  <Input
                    id="phone_number"
                    {...register("phone_number")}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={errors.phone_number ? "border-destructive" : ""}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-destructive">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 3: Endereço */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_zip_code">CEP</Label>
                  <Input
                    id="address_zip_code"
                    {...register("address_zip_code")}
                    onChange={handleCepChange}
                    placeholder="12345-678"
                    maxLength={9}
                    className={
                      errors.address_zip_code ? "border-destructive" : ""
                    }
                  />
                  {errors.address_zip_code && (
                    <p className="text-sm text-destructive">
                      {errors.address_zip_code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_street">Endereço Completo</Label>
                  <Input
                    id="address_street"
                    {...register("address_street")}
                    placeholder="Rua, número, complemento"
                    className={
                      errors.address_street ? "border-destructive" : ""
                    }
                  />
                  {errors.address_street && (
                    <p className="text-sm text-destructive">
                      {errors.address_street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_city">Cidade</Label>
                    <Input
                      id="address_city"
                      {...register("address_city")}
                      placeholder="Nome da cidade"
                      className={
                        errors.address_city ? "border-destructive" : ""
                      }
                    />
                    {errors.address_city && (
                      <p className="text-sm text-destructive">
                        {errors.address_city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state">Estado</Label>
                    <Popover
                      open={stateComboOpen}
                      onOpenChange={setStateComboOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={stateComboOpen}
                          className={cn(
                            "w-full justify-between",
                            errors.address_state && "border-destructive"
                          )}
                        >
                          {watchedState
                            ? estados.find(
                                (estado) => estado.value === watchedState
                              )?.label
                            : "Selecione o estado..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar estado..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhum estado encontrado.
                            </CommandEmpty>
                            <CommandGroup>
                              {estados.map((estado) => (
                                <CommandItem
                                  key={estado.value}
                                  value={estado.label}
                                  onSelect={() => {
                                    setValue("address_state", estado.value);
                                    setStateComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      watchedState === estado.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {estado.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.address_state && (
                      <p className="text-sm text-destructive">
                        {errors.address_state.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 4: Observações */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    rows={4}
                    placeholder="Informações adicionais sobre o cliente..."
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botões de navegação - Responsivo */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="order-2 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="order-1 sm:order-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
                className="order-1 sm:order-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Criando..." : "Criar Cliente"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
