"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Users, Calculator, BarChart3 } from "lucide-react";

const features = [
  {
    step: "Passo 1",
    title: "Gestão Completa de Clientes",
    content:
      "Cadastre e gerencie seus clientes com dados completos de contato, endereço e histórico. Tenha todas as informações organizadas em um só lugar.",
    icon: <Users className="h-6 w-6 text-primary" />,
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop",
  },
  {
    step: "Passo 2",
    title: "Orçamentos Inteligentes",
    content:
      "Crie orçamentos profissionais com cálculos automáticos, controle de produtos/serviços e numeração automática. Personalize com sua marca.",
    icon: <FileText className="h-6 w-6 text-primary" />,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    step: "Passo 3",
    title: "Cálculos Automáticos",
    content:
      "Adicione produtos, defina quantidades e descontos. O sistema calcula automaticamente subtotais, impostos e valor final para você.",
    icon: <Calculator className="h-6 w-6 text-primary" />,
    image:
      "https://images.unsplash.com/photo-1554224154-26032fced8bd?q=80&w=2070&auto=format&fit=crop",
  },
  {
    step: "Passo 4",
    title: "Relatórios e Analytics",
    content:
      "Acompanhe performance com estatísticas de conversão, valores por período, orçamentos próximos ao vencimento e controle financeiro completo.",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function FeatureSteps() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (4000 / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress]);

  return (
    <div className="px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-2xl overflow-hidden rounded-3xl bg-muted/30 p-8 text-center shadow-sm shadow-black/10">
          <div className="relative z-10 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Complete Seu Processo Comercial em 4 Passos
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Do cadastro de clientes ao controle financeiro, tenha uma visão
              completa do seu negócio com ferramentas integradas para maximizar
              suas vendas.
            </p>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                "linear-gradient(152.92deg, rgba(59, 130, 246, 0.2) 4.54%, rgba(59, 130, 246, 0.26) 34.2%, rgba(59, 130, 246, 0.1) 77.55%)",
            }}
          ></div>
        </div>
        <div className="mx-auto mb-10 h-1 w-24 rounded-full bg-muted" />

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-6 md:order-1 md:space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl bg-muted/30 p-4 shadow-sm transition-all duration-300 md:gap-6",
                  index === currentFeature
                    ? "bg-muted/40 shadow-md"
                    : "hover:bg-muted/20 hover:shadow-md"
                )}
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: index === currentFeature ? 1 : 0.65,
                  x: 0,
                  scale: index === currentFeature ? 1.02 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-card text-primary shadow-[0_-2px_6px_rgba(255,255,255,0.35),0_8px_18px_-12px_rgba(15,23,42,0.5)] md:h-14 md:w-14",
                    index === currentFeature
                      ? "scale-110 shadow-[0_-4px_12px_rgba(255,255,255,0.45),0_12px_28px_-10px_rgba(59,130,246,0.5)]"
                      : ""
                  )}
                >
                  {feature.icon}
                </motion.div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-foreground md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative order-1 h-[220px] overflow-hidden rounded-[28px] bg-muted/30 p-3 shadow-inner shadow-black/5 transition-shadow duration-500 hover:shadow-black/10 md:order-2 md:h-[320px] lg:h-[420px]">
            <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-card shadow-[0_-8px_22px_-18px_rgba(255,255,255,0.45),0_32px_70px_-45px_rgba(15,23,42,0.6)]">
              <AnimatePresence mode="wait">
                {features.map(
                  (feature, index) =>
                    index === currentFeature && (
                      <motion.div
                        key={index}
                        className="absolute inset-0 overflow-hidden rounded-[22px]"
                        initial={{ y: 100, opacity: 0, rotateX: -20 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ y: -100, opacity: 0, rotateX: 20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="h-full w-full transform object-cover transition-transform duration-500 hover:scale-105"
                          width={1000}
                          height={500}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent" />

                        <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
                          {feature.step}
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
