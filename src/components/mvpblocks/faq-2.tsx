"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, PlusIcon } from "lucide-react";
import { appConfig } from "@/config/app";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "geral" | "preco" | "tecnico" | "suporte";
}

const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "O que é o Empresor?",
    answer:
      "O Empresor é uma plataforma SaaS completa para gestão empresarial que oferece ferramentas integradas para administração de documentos, projetos, finanças, recursos humanos e análise de dados em um só lugar.",
    category: "geral",
  },
  {
    id: "2",
    question: "Como funciona a cobrança?",
    answer:
      "Oferecemos planos mensais e anuais flexíveis baseados no número de usuários e funcionalidades. Você pode começar com nosso plano gratuito e fazer upgrade conforme sua empresa cresce.",
    category: "preco",
  },
  {
    id: "3",
    question: "É possível integrar com outros sistemas?",
    answer:
      "Sim! O Empresor oferece APIs robustas e integrações nativas com os principais sistemas de contabilidade, bancos, e-commerce e outras ferramentas empresariais que sua empresa já utiliza.",
    category: "tecnico",
  },
  {
    id: "4",
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente. Utilizamos criptografia de ponta, backups automáticos, servidores seguros no Brasil e seguimos todas as normas da LGPD para garantir a máxima segurança dos seus dados empresariais.",
    category: "tecnico",
  },
  {
    id: "5",
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não! O Empresor foi desenvolvido para ser intuitivo e fácil de usar. Oferecemos treinamento gratuito, documentação completa e suporte técnico para garantir que sua equipe aproveite ao máximo a plataforma.",
    category: "geral",
  },
  {
    id: "6",
    question: "Funciona no celular e tablet?",
    answer:
      "Sim! O Empresor é totalmente responsivo e funciona perfeitamente em computadores, tablets e smartphones. Você pode gerenciar sua empresa de qualquer lugar, a qualquer hora.",
    category: "tecnico",
  },
  {
    id: "7",
    question: "Quantos usuários posso adicionar?",
    answer:
      "Depende do seu plano. O plano básico permite até 5 usuários, o profissional até 25 usuários, e o empresarial é ilimitado. Você pode adicionar ou remover usuários a qualquer momento.",
    category: "preco",
  },
  {
    id: "8",
    question: "Como funciona o suporte técnico?",
    answer:
      "Oferecemos suporte via chat, email e telefone durante horário comercial. Clientes dos planos superiores têm acesso a suporte prioritário e atendimento personalizado com consultores especializados.",
    category: "suporte",
  },
  {
    id: "9",
    question: "Posso experimentar antes de assinar?",
    answer:
      "Claro! Oferecemos um período de teste gratuito de 14 dias com acesso completo a todas as funcionalidades. Não é necessário cartão de crédito para começar o teste.",
    category: "geral",
  },
  {
    id: "10",
    question: "E se eu quiser cancelar?",
    answer:
      "Você pode cancelar a qualquer momento sem multas ou taxas. Seus dados ficam disponíveis por 90 dias após o cancelamento, e oferecemos export completo das informações.",
    category: "preco",
  },
  {
    id: "11",
    question: "Como migrar meus dados atuais?",
    answer:
      "Nossa equipe especializada ajuda na migração gratuita dos seus dados. Suportamos importação de planilhas Excel, outros sistemas de gestão e bancos de dados. O processo é rápido e seguro.",
    category: "suporte",
  },
  {
    id: "12",
    question: "O sistema fica offline às vezes?",
    answer:
      "Garantimos 99.9% de disponibilidade com infraestrutura redundante. Em caso de manutenções programadas, avisamos com antecedência e elas são feitas em horários de menor movimento.",
    category: "tecnico",
  },
];

const categories = [
  { id: "all", label: "Todas" },
  { id: "geral", label: "Geral" },
  { id: "preco", label: "Preços" },
  { id: "tecnico", label: "Técnico" },
  { id: "suporte", label: "Suporte" },
];

export default function Faq2() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === "all"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-center rounded-3xl bg-muted/30 p-8 text-center shadow-sm shadow-black/10">
          <Badge
            variant="outline"
            className="mb-4 border-transparent bg-card/80 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-inner shadow-black/5"
          >
            FAQ
          </Badge>

          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Perguntas Frequentes
          </h2>

          <p className="max-w-2xl text-muted-foreground">
            Encontre respostas para as principais dúvidas sobre o{" "}
            {appConfig.name} e como nossa plataforma pode transformar a gestão
            da sua empresa.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-xl bg-card/80 p-3 shadow-inner shadow-black/5">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:shadow-md"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "h-fit overflow-hidden rounded-2xl bg-card/80 shadow-sm transition-all duration-300",
                  expandedId === faq.id
                    ? "shadow-md shadow-primary/15"
                    : "hover:bg-muted/20 hover:shadow-md"
                )}
                style={{ minHeight: "88px" }}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-foreground transition-colors duration-200 hover:bg-muted/20"
                >
                  <h3 className="text-lg font-medium text-foreground">
                    {faq.question}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    {expandedId === faq.id ? (
                      <MinusIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <PlusIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <div className="w-full max-w-xl rounded-3xl bg-muted/30 p-6 text-center shadow-sm shadow-black/10">
            <p className="text-muted-foreground">
              Não encontrou o que procurava?
            </p>
            <div className="mt-4 inline-flex rounded-md bg-card/80 p-2 shadow-[inset_0_1px_4px_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]">
              <a
                href={`mailto:${appConfig.contact.support}`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Falar com Suporte
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
