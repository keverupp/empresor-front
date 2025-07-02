"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import Header2 from "@/components/mvpblocks/header-2";

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Pelo menos uma letra maiúscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Pelo menos uma letra minúscula",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Pelo menos um número",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Pelo menos um símbolo (!@#$%^&*)",
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading } = useAuth();
  const router = useRouter();

  // Calcular força da senha
  const passwordStrength = useMemo(() => {
    const passed = passwordRequirements.filter((req) =>
      req.test(formData.password)
    );
    return {
      score: passed.length,
      percentage: (passed.length / passwordRequirements.length) * 100,
      requirements: passwordRequirements.map((req) => ({
        ...req,
        passed: req.test(formData.password),
      })),
    };
  }, [formData.password]);

  const getStrengthColor = (percentage: number) => {
    if (percentage < 40) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (percentage: number) => {
    if (percentage < 40) return "Fraca";
    if (percentage < 80) return "Média";
    return "Forte";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar nome
    if (formData.name.length < 2) {
      return; // O erro será mostrado no toast pelo AuthContext
    }

    // Validar senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      return; // O erro será mostrado no toast pelo AuthContext
    }

    // Validar força da senha
    if (passwordStrength.score < passwordRequirements.length) {
      return; // O erro será mostrado no toast pelo AuthContext
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      router.push("/dashboard");
    } catch {
      // O erro já é tratado com toast no AuthContext
      // Removido 'err' para evitar erro ESLint de variável não utilizada
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header2 />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <CardDescription>
                Crie sua conta para começar a usar o Empresor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                  />
                  {formData.name && formData.name.length < 2 && (
                    <p className="text-sm text-red-500">
                      Nome deve ter pelo menos 2 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setShowPasswordRequirements(true)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Progress da força da senha */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Força da senha
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.percentage < 40
                              ? "text-red-500"
                              : passwordStrength.percentage < 80
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getStrengthText(passwordStrength.percentage)}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={passwordStrength.percentage}
                          className="h-2"
                        />
                        <div
                          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getStrengthColor(
                            passwordStrength.percentage
                          )}`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requisitos da senha */}
                  {showPasswordRequirements && formData.password && (
                    <div className="space-y-1 rounded-md border p-3 bg-muted/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Requisitos da senha:
                      </p>
                      {passwordStrength.requirements.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center space-x-2 text-xs"
                        >
                          {req.passed ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={
                              req.passed ? "text-green-600" : "text-red-600"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-500">
                        As senhas não coincidem
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    passwordStrength.score < passwordRequirements.length
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Faça login
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-4">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="underline underline-offset-4">
              Política de Privacidade
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
