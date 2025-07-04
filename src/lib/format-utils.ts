// src/lib/format-utils.ts

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata um CNPJ para exibição
 * @param cnpj - CNPJ sem formatação (apenas números) ou já formatado
 * @returns CNPJ formatado como XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return "";

  // Remove todos os caracteres não numéricos
  const cleanCNPJ = removeNonNumeric(cnpj);

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return cnpj; // Retorna o valor original se não for um CNPJ válido
  }

  // Aplica a máscara: XX.XXX.XXX/XXXX-XX
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Formata um CPF para exibição
 * @param cpf - CPF sem formatação (apenas números) ou já formatado
 * @returns CPF formatado como XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return "";

  // Remove todos os caracteres não numéricos
  const cleanCPF = removeNonNumeric(cpf);

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return cpf; // Retorna o valor original se não for um CPF válido
  }

  // Aplica a máscara: XXX.XXX.XXX-XX
  return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

/**
 * Formata documento (CNPJ ou CPF) baseado no tamanho
 * @param document - Documento sem formatação
 * @returns Documento formatado
 */
export function formatDocument(document: string): string {
  if (!document) return "";

  const cleanDocument = removeNonNumeric(document);

  if (cleanDocument.length === 14) {
    return formatCNPJ(cleanDocument);
  } else if (cleanDocument.length === 11) {
    return formatCPF(cleanDocument);
  }

  return document;
}

/**
 * Formata um telefone para exibição
 * @param phone - Telefone sem formatação ou já formatado
 * @returns Telefone formatado como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";

  const cleanPhone = removeNonNumeric(phone);

  // Celular com 11 dígitos: (XX) XXXXX-XXXX
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  // Telefone fixo com 10 dígitos: (XX) XXXX-XXXX
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return phone; // Retorna o valor original se não conseguir formatar
}

/**
 * Formata um CEP para exibição
 * @param cep - CEP sem formatação ou já formatado
 * @returns CEP formatado como XXXXX-XXX
 */
export function formatCEP(cep: string): string {
  if (!cep) return "";

  const cleanCEP = removeNonNumeric(cep);

  if (cleanCEP.length === 8) {
    return cleanCEP.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  return cep;
}

/**
 * Detecta o tipo de documento baseado no tamanho
 * @param document - Documento sem formatação
 * @returns 'CNPJ' | 'CPF' | 'UNKNOWN'
 */
export function detectDocumentType(
  document: string
): "CNPJ" | "CPF" | "UNKNOWN" {
  if (!document) return "UNKNOWN";

  const cleanDocument = removeNonNumeric(document);

  if (cleanDocument.length === 14) return "CNPJ";
  if (cleanDocument.length === 11) return "CPF";

  return "UNKNOWN";
}
