// src/types/registration.ts

export enum RegistrationStep {
  CNPJ_INPUT = 1,
  COMPANY_CONFIRMATION = 2,
  EMAIL_VERIFICATION = 3,
  SUCCESS = 4,
}

export interface RegistrationState {
  currentStep: RegistrationStep;
  cnpjInput: string;
  verificationCode: string;
  createdCompany: any | null;
  isCreating: boolean;
  isVerifying: boolean;
  isResending: boolean;
}

export interface CompanyRegistrationData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  email: string;
  telefone: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  situacao: string;
}

export interface RegistrationStepProps {
  onNext?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
}
