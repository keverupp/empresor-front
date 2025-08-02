"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  IconCheck,
  IconRefresh,
  IconRotateClockwise,
} from "@tabler/icons-react";

interface EmailVerificationStepProps {
  email: string;
  verificationCode: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onResendCode?: () => void;
  isVerifying: boolean;
  isResending?: boolean;
}

export function EmailVerificationStep({
  email,
  verificationCode,
  onCodeChange,
  onVerify,
  onResendCode,
  isVerifying,
  isResending = false,
}: EmailVerificationStepProps) {
  return (
    <div className="space-y-6">
      {/* Header com email */}
      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
        <div>
          <p className="text-sm ">Código enviado para:</p>
          <p className="font-medium break-all">{email}</p>
        </div>
      </div>

      {/* Input OTP */}
      <div className="space-y-3">
        <label className="text-sm font-medium block text-center">
          Digite o código de 6 dígitos
        </label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={onCodeChange}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          O código expira em 15 minutos
        </p>
      </div>

      {/* Botão de verificação */}
      <Button
        onClick={onVerify}
        disabled={verificationCode.length !== 6 || isVerifying}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <IconCheck className="w-4 h-4 mr-2" />
            Ativar Empresa
          </>
        )}
      </Button>

      {/* Botão de reenvio */}
      {onResendCode && (
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Não recebeu o código?</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResendCode}
            disabled={isResending || isVerifying}
          >
            {isResending ? (
              <>
                <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <IconRotateClockwise className="w-4 h-4 mr-2" />
                Reenviar código
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
        <p className="font-medium mb-1">Atenção:</p>
        <ul className="space-y-1">
          <li>• Verifique sua caixa de spam</li>
          <li>• O código expira em 15 minutos</li>
          <li>• Digite apenas números</li>
        </ul>
      </div>
    </div>
  );
}
