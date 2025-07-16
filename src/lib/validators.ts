import { isValidCPF, isValidCNPJ } from "@brazilian-utils/brazilian-utils";

export function validateCpfOrCnpj(value: string) {
  if (!value) return true;
  const num = value.replace(/\D/g, "");
  return isValidCPF(num) || isValidCNPJ(num);
}
