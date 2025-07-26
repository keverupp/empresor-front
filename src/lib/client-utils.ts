// src/lib/client-utils.ts
import {
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatPhone,
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
} from "@/lib/utils";

/**
 * Formatadores para campos de cliente
 */

// Detecta e formata documento (CPF ou CNPJ)
export const formatDocument = (document: string): string => {
  if (!document) return "";
  const cleanDocument = document.replace(/\D/g, "");

  if (cleanDocument.length === 11) {
    return formatCPF(cleanDocument);
  } else if (cleanDocument.length === 14) {
    return formatCNPJ(cleanDocument);
  }

  return document;
};

/**
 * Validadores e formatadores exportados do utils.ts
 */
export {
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatPhone,
};

/**
 * Utilitários para formulários de cliente
 */

// Converte dados do formulário para API
export const convertFormDataToApiData = (formData: any) => {
  return Object.entries(formData).reduce((acc, [key, value]) => {
    // Remove formatação e converte strings vazias para null
    if (typeof value === "string") {
      const cleanValue = value.trim();
      if (cleanValue === "") {
        acc[key] = null;
      } else if (
        key === "phone_number" ||
        key === "document_number" ||
        key === "address_zip_code"
      ) {
        acc[key] = cleanValue.replace(/\D/g, "");
      } else {
        acc[key] = cleanValue;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

// Detecta tipo de documento
export const getDocumentType = (
  document: string
): "CPF" | "CNPJ" | "INVALID" => {
  if (!document) return "INVALID";
  const cleanDocument = document.replace(/\D/g, "");

  if (cleanDocument.length === 11 && isValidCPF(cleanDocument)) {
    return "CPF";
  } else if (cleanDocument.length === 14 && isValidCNPJ(cleanDocument)) {
    return "CNPJ";
  }

  return "INVALID";
};
