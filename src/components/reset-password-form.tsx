"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword } = useAuth();
  const router = useRouter();

  const normalizedNewPassword = newPassword.trim();
  const normalizedConfirmNewPassword = confirmNewPassword.trim();
  const passwordsMatch =
    normalizedNewPassword === normalizedConfirmNewPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordsMatch || !normalizedNewPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, normalizedNewPassword);
      router.push("/login");
    } catch {
      // O erro já é tratado com toast no AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold">
          Redefinir senha
        </CardTitle>
        <CardDescription>
          Crie uma nova senha para acessar sua conta com segurança.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="pl-10 pr-10"
              />
              <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(event) =>
                  setConfirmNewPassword(event.target.value)
                }
                required
                className="pl-10 pr-10"
              />
              <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!passwordsMatch && confirmNewPassword && (
              <p className="text-sm text-destructive">
                As senhas não coincidem.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </form>

        <Button variant="link" className="mt-6 w-full" asChild>
          <Link href="/login">Voltar para o login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
