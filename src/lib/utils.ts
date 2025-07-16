import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils.ts

// Importa do brazilian-utils tudo que existe pronto!
export {
  isValidCPF,
  formatCPF,
  isValidCNPJ,
  formatCNPJ,
  isValidCEP,
  formatCEP,
  isValidPhone,
  isValidEmail,
} from "@brazilian-utils/brazilian-utils";

/**
 * Máscara para telefone brasileiro
 * Aceita celular e fixo, e já aplica corretamente
 */
export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    // Fixo (11) 2345-6789
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  // Celular (11) 91234-5678
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}
