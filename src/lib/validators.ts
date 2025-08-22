// src/lib/validators.ts

/**
 * Remove todos os caracteres não numéricos de uma string
 */
function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida CPF
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF for válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;

  const cleanCPF = removeNonNumeric(cpf);

  // Deve ter exatamente 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Não pode ser sequência repetida (ex: 11111111111)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cleanCPF.charAt(10)) === secondDigit;
}

/**
 * Valida CNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns true se o CNPJ for válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;

  const cleanCNPJ = removeNonNumeric(cnpj);

  // Deve ter exatamente 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Não pode ser sequência repetida (ex: 11111111111111)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validação dos dígitos verificadores
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

/**
 * Valida CEP
 * @param cep - CEP com ou sem formatação
 * @returns true se o CEP for válido, false caso contrário
 */
export function isValidCEP(cep: string): boolean {
  if (!cep) return false;

  const cleanCEP = removeNonNumeric(cep);

  // Deve ter exatamente 8 dígitos
  if (cleanCEP.length !== 8) return false;

  // Não pode ser sequência repetida (ex: 00000000)
  if (/^(\d)\1{7}$/.test(cleanCEP)) return false;

  // Deve ser composto apenas por números
  return /^\d{8}$/.test(cleanCEP);
}

/**
 * Valida telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns true se o telefone for válido, false caso contrário
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;

  const cleanPhone = removeNonNumeric(phone);

  // Telefone fixo: 10 dígitos (XX + 8 dígitos)
  // Celular: 11 dígitos (XX + 9 dígitos)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Não pode ser sequência repetida
  if (/^(\d)\1+$/.test(cleanPhone)) return false;

  // Para celular (11 dígitos), o terceiro dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== "9") return false;

  // DDD deve estar entre 11 e 99
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  return true;
}

/**
 * Valida email
 * @param email - Email para validação
 * @returns true se o email for válido, false caso contrário
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CPF ou CNPJ
 * @param document - Documento com ou sem formatação
 * @returns true se o documento for válido, false caso contrário
 */
export function validateCpfOrCnpj(document: string): boolean {
  if (!document) return true; // Campo opcional

  const cleanDocument = removeNonNumeric(document);

  if (cleanDocument.length === 11) {
    return isValidCPF(cleanDocument);
  } else if (cleanDocument.length === 14) {
    return isValidCNPJ(cleanDocument);
  }

  return false;
}

/**
 * Determina o tipo do documento
 * @param document - Documento com ou sem formatação
 * @returns 'CPF', 'CNPJ' ou 'INVALID'
 */
export function getDocumentType(document: string): "CPF" | "CNPJ" | "INVALID" {
  if (!document) return "INVALID";

  const cleanDocument = removeNonNumeric(document);

  if (cleanDocument.length === 11 && isValidCPF(cleanDocument)) {
    return "CPF";
  } else if (cleanDocument.length === 14 && isValidCNPJ(cleanDocument)) {
    return "CNPJ";
  }

  return "INVALID";
}

/**
 * Valida se uma string contém apenas números
 * @param value - Valor para validação
 * @returns true se contém apenas números, false caso contrário
 */
export function isNumericOnly(value: string): boolean {
  if (!value) return false;
  return /^\d+$/.test(value);
}

/**
 * Valida se uma string tem um comprimento específico
 * @param value - Valor para validação
 * @param length - Comprimento esperado
 * @returns true se tem o comprimento correto, false caso contrário
 */
export function hasLength(value: string, length: number): boolean {
  if (!value) return false;
  return value.length === length;
}

/**
 * Valida se uma string está dentro de um range de comprimento
 * @param value - Valor para validação
 * @param min - Comprimento mínimo
 * @param max - Comprimento máximo
 * @returns true se está dentro do range, false caso contrário
 */
export function isLengthBetween(
  value: string,
  min: number,
  max: number
): boolean {
  if (!value) return false;
  return value.length >= min && value.length <= max;
}

/**
 * Valida se uma string não está vazia
 * @param value - Valor para validação
 * @returns true se não está vazia, false caso contrário
 */
export function isNotEmpty(value: string): boolean {
  return value != null && value.trim().length > 0;
}

/**
 * Valida se um valor é uma URL válida
 * @param url - URL para validação
 * @returns true se é uma URL válida, false caso contrário
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida se um valor é um número válido
 * @param value - Valor para validação
 * @returns true se é um número válido, false caso contrário
 */
export function isValidNumber(value: string | number): boolean {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "string")
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  return false;
}

/**
 * Valida se um valor está dentro de um range numérico
 * @param value - Valor para validação
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns true se está dentro do range, false caso contrário
 */
export function isNumberBetween(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}
