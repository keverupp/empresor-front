"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { appConfig } from "@/config/app";

export default function NotebookHero() {
  return (
    <div className="mx-auto max-w-7xl p-8 md:p-12">
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

      <main className="container relative mt-4 max-w-[1100px] px-2 py-4 lg:py-8">
        <div className="relative sm:overflow-hidden">
          <div className="relative flex flex-col items-center justify-center text-center rounded bg-fd-background/70 px-4 pt-12 shadow-xl shadow-primary/10 backdrop-blur-md md:px-12 md:pt-16">
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
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              🚀 Sistema de Gestão de Orçamentos Completo
            </div>

            <h1 className="mb-6 text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Transforme a{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Gestão de Orçamentos
              </span>{" "}
              da Sua Empresa
            </h1>

            <p className="mb-8 max-w-2xl text-sm text-muted-foreground md:text-xl">
              Crie e gerencie orçamentos empresariais com facilidade. Tudo 100%
              online, seguro e disponível na palma da sua mão, onde quer que
              esteja.
            </p>

            {/* CTA Buttons */}
            <div className="z-10 mb-12 inline-flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/register"
                className={cn(
                  buttonVariants({
                    size: "lg",
                    className:
                      "rounded-full bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-8 py-3 text-lg",
                  })
                )}
              >
                Começar Gratuitamente <ArrowRight className="ml-2 size-5" />
              </a>
            </div>

            {/* Dashboard Preview */}
            <div className="relative z-10 w-full">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt={`${appConfig.name} - Dashboard de gestão empresarial`}
                width={1000}
                height={600}
                className="z-10 mx-auto -mb-60 w-full max-w-4xl select-none rounded border border-neutral-200 object-cover shadow-2xl duration-1000 animate-in fade-in slide-in-from-bottom-12 dark:border-neutral-700 lg:-mb-40"
              />

              {/* Floating Cards */}
              <div className="absolute -right-6 -top-6 rotate-3 transform rounded bg-white p-4 shadow-lg animate-in fade-in slide-in-from-right-4 dark:bg-neutral-900">
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

              <div className="absolute -left-6 top-1/3 -rotate-3 transform rounded bg-white p-4 shadow-lg animate-in fade-in slide-in-from-left-4 dark:bg-neutral-900">
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
        </div>
      </main>
    </div>
  );
}
