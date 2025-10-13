"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header2 from "@/components/mvpblocks/header-2";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register, login, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRegister = async () => {
    setIsRedirecting(true);
    await register();
  };

  const handleLogin = async () => {
    setIsRedirecting(true);
    await login();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header2 />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">
              Comece a usar o Empresor
            </CardTitle>
            <CardDescription>
              A criação de contas é processada com segurança através da Auth0. Clique abaixo para continuar no fluxo de cadastro protegido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={isLoading || isRedirecting}
            >
              {isLoading || isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecionando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Criar conta com Auth0
                </>
              )}
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleLogin}
              disabled={isLoading || isRedirecting}
            >
              Já tenho uma conta
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Após o cadastro, você será redirecionado automaticamente de volta ao Empresor para finalizar a configuração inicial.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
