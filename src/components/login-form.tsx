// src/components/login-form.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, register, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async () => {
    setIsRedirecting(true);
    await login();
  };

  const handleRegister = async () => {
    setIsRedirecting(true);
    await register();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao Empresor</CardTitle>
          <p className="text-muted-foreground">
            Utilize a autenticação segura da Auth0 para acessar o painel completo da plataforma.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full"
            disabled={isLoading || isRedirecting}
            onClick={handleLogin}
          >
            {isLoading || isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Entrar com Auth0
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading || isRedirecting}
            onClick={handleRegister}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Criar conta com Auth0
          </Button>

          <p className="text-muted-foreground text-sm text-center">
            Ao continuar, você será redirecionado para o fluxo seguro de login da Auth0. Após a autenticação, retornaremos automaticamente ao painel.
          </p>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance [&>a]:underline [&>a]:underline-offset-4">
        Ao continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
        e <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  );
}
