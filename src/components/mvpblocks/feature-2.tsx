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
    <div className={"p-8 md:p-12"}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h2 className="font-geist text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Complete Seu Processo Comercial em 4 Passos
            </h2>
            <p className="font-geist mt-3 text-foreground/60">
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
        <hr className="mx-auto mb-10 h-px w-1/2 bg-foreground/30" />

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: index === currentFeature ? 1 : 0.3,
                  x: 0,
                  scale: index === currentFeature ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14",
                    index === currentFeature
                      ? "scale-110 border-primary bg-primary/10 text-primary [box-shadow:0_0_15px_rgba(59,130,246,0.3)]"
                      : "border-muted-foreground bg-muted"
                  )}
                >
                  {feature.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={cn(
              "relative order-1 h-[200px] overflow-hidden rounded-lg border border-primary/20 [box-shadow:0_5px_30px_-15px_rgba(59,130,246,0.3)] md:order-2 md:h-[300px] lg:h-[400px]"
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 overflow-hidden rounded-lg"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="h-full w-full transform object-cover transition-transform hover:scale-105"
                        width={1000}
                        height={500}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />

                      <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
                        <span className="text-xs font-medium text-primary">
                          {feature.step}
                        </span>
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
