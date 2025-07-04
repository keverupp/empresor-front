"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconSearch, IconRefresh, IconAlertCircle } from "@tabler/icons-react";

interface CNPJInputStepProps {
  cnpjInput: string;
  onCnpjChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  error: string | null;
  onNext?: () => void;
}

export function CNPJInputStep({
  cnpjInput,
  onCnpjChange,
  onSearch,
  isLoading,
  error,
  onNext,
}: CNPJInputStepProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && cnpjInput.trim() && !isLoading) {
      onSearch();
    }
  };

  useEffect(() => {
    if (!isLoading && !error && onNext) {
      const timer = setTimeout(() => {
        onNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, onNext]);

  const handleCnpjChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    let formatted = numbers;
    if (numbers.length > 2) {
      formatted = numbers.replace(/(\d{2})(\d)/, "$1.$2");
    }
    if (numbers.length > 5) {
      formatted = formatted.replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    }
    if (numbers.length > 8) {
      formatted = formatted.replace(
        /(\d{2})\.(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3/$4"
      );
    }
    if (numbers.length > 12) {
      formatted = formatted.replace(
        /(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
        "$1.$2.$3/$4-$5"
      );
    }

    onCnpjChange(formatted);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Label htmlFor="cnpj" className="text-sm text-muted-foreground">
          CNPJ da Empresa
        </Label>
        <Input
          id="cnpj"
          value={cnpjInput}
          onChange={(e) => handleCnpjChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="00.000.000/0000-00"
          maxLength={18}
          disabled={isLoading}
          className="text-center font-mono"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="text-sm">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={onSearch}
        disabled={cnpjInput.replace(/\D/g, "").length !== 14 || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
            Consultando...
          </>
        ) : (
          <>
            <IconSearch className="w-4 h-4 mr-2" />
            Consultar CNPJ
          </>
        )}
      </Button>
    </div>
  );
}
