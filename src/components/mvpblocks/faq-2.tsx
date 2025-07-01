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
    <section className="bg-background py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary px-3 py-1 text-xs font-medium uppercase tracking-wider"
          >
            FAQ
          </Badge>

          <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Perguntas Frequentes
          </h2>

          <p className="max-w-2xl text-center text-muted-foreground">
            Encontre respostas para as principais dúvidas sobre o{" "}
            {appConfig.name} e como nossa plataforma pode transformar a gestão
            da sua empresa.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.label}
            </button>
          ))}
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
                  "h-fit overflow-hidden rounded-lg border border-border",
                  expandedId === faq.id ? "shadow-3xl bg-card/50" : "bg-card/50"
                )}
                style={{ minHeight: "88px" }}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left"
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
                      <div className="border-t border-border px-6 pb-6 pt-2">
                        <p className="text-muted-foreground">{faq.answer}</p>
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
          className="mt-16 text-center"
        >
          <p className="mb-4 text-muted-foreground">
            Não encontrou o que procurava?
          </p>
          <a
            href={`mailto:${appConfig.contact.support}`}
            className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-3 font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Falar com Suporte
          </a>
        </motion.div>
      </div>
    </section>
  );
}
