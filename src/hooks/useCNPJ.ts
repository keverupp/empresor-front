// src/hooks/useCNPJ.ts
"use client";

import { useState, useCallback } from "react";

export interface CNPJData {
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
  atividade_principal: {
    id: string;
    descricao: string;
  };
  porte: string;
  natureza_juridica: string;
}

interface UseCNPJReturn {
  data: CNPJData | null;
  isLoading: boolean;
  error: string | null;
  fetchCNPJ: (cnpj: string) => Promise<void>;
  clearData: () => void;
}

// Função para limpar CNPJ (remover pontos, barras, hífens)
function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, "");
}

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const cleanedCNPJ = cleanCNPJ(cnpj);

  // Deve ter exatamente 14 dígitos
  if (cleanedCNPJ.length !== 14) return false;

  // Não pode ser sequência repetida
  if (/^(\d)\1{13}$/.test(cleanedCNPJ)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cleanedCNPJ.length - 2;
  let numeros = cleanedCNPJ.substring(0, tamanho);
  const digitos = cleanedCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cleanedCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

export function useCNPJ(): UseCNPJReturn {
  const [data, setData] = useState<CNPJData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCNPJ = useCallback(async (cnpj: string) => {
    const cleanedCNPJ = cleanCNPJ(cnpj);

    // Validar CNPJ
    if (!isValidCNPJ(cleanedCNPJ)) {
      setError("CNPJ inválido");
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Usando a API pública cnpj.ws
      const response = await fetch(
        `https://publica.cnpj.ws/cnpj/${cleanedCNPJ}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CNPJ não encontrado");
        }
        throw new Error("Erro ao consultar CNPJ");
      }

      const result = await response.json();

      // Verificar se tem estabelecimento (dados principais)
      if (!result.estabelecimento) {
        throw new Error("Dados da empresa não encontrados");
      }

      const estabelecimento = result.estabelecimento;

      // Formatar telefone
      const telefone =
        estabelecimento.ddd1 && estabelecimento.telefone1
          ? `(${estabelecimento.ddd1}) ${estabelecimento.telefone1}`
          : "";

      // Mapear dados da API para nossa interface
      const mappedData: CNPJData = {
        cnpj: estabelecimento.cnpj || cleanedCNPJ,
        razao_social: result.razao_social || "",
        nome_fantasia:
          estabelecimento.nome_fantasia || result.razao_social || "",
        email: estabelecimento.email || "",
        telefone: telefone,
        logradouro: `${estabelecimento.tipo_logradouro || ""} ${
          estabelecimento.logradouro || ""
        }`.trim(),
        numero: estabelecimento.numero || "",
        complemento: estabelecimento.complemento || "",
        bairro: estabelecimento.bairro || "",
        municipio: estabelecimento.cidade?.nome || "",
        uf: estabelecimento.estado?.sigla || "",
        cep: estabelecimento.cep || "",
        situacao: estabelecimento.situacao_cadastral || "",
        atividade_principal: {
          id: estabelecimento.atividade_principal?.id || "",
          descricao: estabelecimento.atividade_principal?.descricao || "",
        },
        porte: result.porte?.descricao || "",
        natureza_juridica: result.natureza_juridica?.descricao || "",
      };

      setData(mappedData);

      // Verificar se empresa está ativa
      if (estabelecimento.situacao_cadastral !== "Ativa") {
        setError(
          `Empresa com situação: ${estabelecimento.situacao_cadastral}. Apenas empresas ativas podem ser cadastradas.`
        );
      }

      // Verificar se tem email
      if (!estabelecimento.email) {
        setError(
          "Email não encontrado na Receita Federal. É necessário ter um email cadastrado para prosseguir."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao consultar CNPJ";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchCNPJ,
    clearData,
  };
}
