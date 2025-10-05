"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Play } from "lucide-react";
import { appConfig } from "@/config/app";

export default function NotebookHero() {
  return (
    <div className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-16">
      {/* Add keyframes for the animation */}
      <style jsx global>{`
        @keyframes moveGradientLeft {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: -200% 0%;
          }
        }
        .animate-gradient-x {
          animation: moveGradientLeft 20s linear infinite;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 top-0 z-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/30 via-blue-500/20 to-transparent opacity-50 blur-[100px]" />
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-600/30 via-blue-600/20 to-transparent opacity-50 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-cyan-500/10 to-transparent opacity-30 blur-[80px]" />
      </div>

      <main className="relative mt-2 flex flex-col items-center justify-center text-center">
        <div className="relative w-full overflow-hidden rounded-[26px] bg-card/95 px-6 pb-12 pt-16 shadow-[0_-10px_30px_-22px_rgba(255,255,255,0.55),0_35px_85px_-45px_rgba(15,23,42,0.6)] transition-shadow duration-500 hover:shadow-[0_-12px_32px_-22px_rgba(255,255,255,0.6),0_45px_95px_-50px_rgba(15,23,42,0.65)] md:px-12 md:pt-20">
            <div
              className="animate-gradient-x absolute inset-0 top-32 z-0 hidden blur-2xl dark:block"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, white, transparent)",
                background:
                  "repeating-linear-gradient(65deg, hsl(var(--primary)), hsl(var(--primary)/0.8) 12px, color-mix(in oklab, hsl(var(--primary)) 30%, transparent) 20px, transparent 200px)",
                backgroundSize: "200% 100%",
              }}
            />
            <div
              className="animate-gradient-x absolute inset-0 top-32 z-0 blur-2xl dark:hidden"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, white, transparent)",
                background:
                  "repeating-linear-gradient(65deg, hsl(var(--primary)/0.9), hsl(var(--primary)/0.7) 12px, color-mix(in oklab, hsl(var(--primary)) 30%, transparent) 20px, transparent 200px)",
                backgroundSize: "200% 100%",
              }}
            />

            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-muted/50 px-5 py-2 text-sm font-semibold text-foreground shadow-[inset_0_1px_3px_rgba(255,255,255,0.35)] dark:shadow-[inset_0_1px_2px_rgba(15,23,42,0.6)]">
              🚀 Sistema de Gestão de Orçamentos Completo
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Transforme a{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Gestão de Orçamentos
              </span>{" "}
              da Sua Empresa
            </h1>

            <p className="mb-8 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Sistema completo para criar, gerenciar e acompanhar orçamentos
              empresariais. Automatize cálculos, personalize PDFs com sua marca
              e tenha controle total sobre seu processo comercial.
            </p>

            {/* Features Grid */}
            <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              <div className="group flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2 text-left text-sm font-medium shadow-sm transition-all duration-300 hover:bg-muted/20 hover:shadow-md">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="font-medium text-foreground">Orçamentos Inteligentes</span>
              </div>
              <div className="group flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2 text-left text-sm font-medium shadow-sm transition-all duration-300 hover:bg-muted/20 hover:shadow-md">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="font-medium text-foreground">PDF Personalizado</span>
              </div>
              <div className="group flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2 text-left text-sm font-medium shadow-sm transition-all duration-300 hover:bg-muted/20 hover:shadow-md">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="font-medium text-foreground">Controle Financeiro</span>
              </div>
              <div className="group flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2 text-left text-sm font-medium shadow-sm transition-all duration-300 hover:bg-muted/20 hover:shadow-md">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="font-medium text-foreground">Relatórios Completos</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="z-10 mb-12 w-full max-w-2xl">
              <div className="flex flex-col items-center gap-3 rounded-md bg-muted/30 p-3 shadow-[inset_0_1px_4px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)] sm:flex-row sm:justify-center">
                <a
                  href="/signup"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      className:
                        "rounded-full bg-gradient-to-b from-primary to-primary/80 px-8 py-3 text-lg font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg",
                    })
                  )}
                >
                  Começar Gratuitamente <ArrowRight className="ml-2 size-5" />
                </a>
                <button
                  type="button"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      variant: "outline",
                      className:
                        "rounded-full bg-background/60 px-8 py-3 text-lg font-semibold shadow-sm transition-all duration-300 hover:bg-muted/20 hover:shadow-md",
                    })
                  )}
                >
                  <Play className="mr-2 size-5" />
                  Ver Demonstração
                </button>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Mais de{" "}
                <span className="font-semibold text-foreground">
                  500+ empresas
                </span>{" "}
                já automatizaram seus orçamentos com o {appConfig.name}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300">
                {/* Placeholder para logos de clientes */}
                <div className="h-8 w-24 rounded bg-muted"></div>
                <div className="h-8 w-20 rounded bg-muted"></div>
                <div className="h-8 w-28 rounded bg-muted"></div>
                <div className="h-8 w-22 rounded bg-muted"></div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative z-10 w-full">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt={`${appConfig.name} - Dashboard de gestão empresarial`}
                width={1000}
                height={600}
                className="z-10 mx-auto -mb-60 w-full max-w-4xl select-none rounded-3xl object-cover shadow-[0_-4px_18px_-10px_rgba(255,255,255,0.45),0_45px_90px_-45px_rgba(15,23,42,0.55)] duration-1000 animate-in fade-in slide-in-from-bottom-12 lg:-mb-40"
              />

              {/* Floating Cards */}
              <div className="absolute -right-6 -top-6 rotate-3 transform rounded-xl bg-card/95 p-4 shadow-[0_-6px_18px_-14px_rgba(255,255,255,0.45),0_18px_40px_-22px_rgba(15,23,42,0.55)] animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">99.9% Uptime</p>
                    <p className="text-sm text-muted-foreground">
                      Sempre disponível
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 top-1/3 -rotate-3 transform rounded-xl bg-card/95 p-4 shadow-[0_-6px_18px_-14px_rgba(255,255,255,0.45),0_18px_40px_-22px_rgba(15,23,42,0.55)] animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-semibold">LGPD Compliant</p>
                    <p className="text-sm text-muted-foreground">
                      Dados seguros
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
}
