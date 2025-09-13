"use client";

import {
  IconCommand,
  IconPlus,
  IconSearch,
  IconFileText,
  IconUsers,
  IconCalendar,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateClientAction } from "@/components/clients/CreateClientAction";
import { CreateQuoteDialog } from "@/components/quotes/CreateQuoteDialog";
import { ProductDialog } from "@/components/products/ProductDialog";
import { useActiveCompany } from "@/contexts/CompanyContext";
import { useQuotes } from "@/hooks/useQuotes";

// Definição dos comandos/atalhos disponíveis
const quickCommands = [
  {
    group: "Criar",
    items: [
      {
        title: "Novo Orçamento",
        description: "Criar um novo orçamento",
        icon: IconFileText,
        action: "new-quote",
        keywords: ["orcamento", "quote", "novo", "criar"],
      },
      {
        title: "Novo Cliente",
        description: "Adicionar novo cliente",
        icon: IconUsers,
        action: "new-client",
        keywords: ["cliente", "client", "novo", "adicionar"],
      },
      {
        title: "Novo Produto",
        description: "Cadastrar novo produto",
        icon: IconPlus,
        action: "new-product",
        keywords: ["produto", "product", "novo", "cadastrar"],
      },
      {
        title: "Agendar Reunião",
        description: "Criar novo evento no calendário",
        icon: IconCalendar,
        action: "/dashboard/calendar/new",
        keywords: ["reuniao", "meeting", "calendario", "agendar"],
      },
    ],
  },
  {
    group: "Navegar",
    items: [
      {
        title: "Dashboard",
        description: "Ir para o dashboard principal",
        icon: IconSearch,
        action: "/dashboard",
        keywords: ["dashboard", "home", "inicio"],
      },
      {
        title: "Configurações",
        description: "Configurações da conta",
        icon: IconSettings,
        action: "/dashboard/settings",
        keywords: ["configuracoes", "settings", "config"],
      },
    ],
  },
];

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const [open, setOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const router = useRouter();
  const { companyId } = useActiveCompany();
  const { createQuote, fetchClients, generateQuoteNumber } = useQuotes({
    companyId: companyId || "",
  });

  // Atalho de teclado para abrir o Command Dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Função para executar comandos
  const handleCommandSelect = (action: string) => {
    setOpen(false);
    switch (action) {
      case "new-client":
        setClientDialogOpen(true);
        break;
      case "new-quote":
        setQuoteDialogOpen(true);
        break;
      case "new-product":
        setProductDialogOpen(true);
        break;
      default:
        router.push(action);
    }
  };

  const handleCreateQuote = async (data: any) => {
    const result = await createQuote(data);
    if (result) {
      setQuoteDialogOpen(false);
      router.push(
        `/dashboard/companies/${companyId}/quotes/${result.id}/edit`
      );
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {/* Botão de comando */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(true)}
              className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <IconCommand className="h-4 w-4" />
              <span>Buscar...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="pointer-events-none select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Command Dialog */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Digite um comando ou busque..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

            {/* Comandos rápidos */}
            {quickCommands.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.title}
                    value={`${item.title} ${item.keywords.join(" ")}`}
                    onSelect={() => handleCommandSelect(item.action)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            <CommandSeparator />

            {/* Comandos dinâmicos baseados na navegação atual */}
            <CommandGroup heading="Páginas">
              {items.map((item) => (
                <CommandItem
                  key={item.title}
                  value={item.title}
                  onSelect={() => handleCommandSelect(item.url)}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Menu principal da sidebar com navegação funcional */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Dialogs acionados pelos atalhos */}
        {companyId && (
          <>
            <CreateClientAction
              companyId={companyId}
              open={clientDialogOpen}
              onOpenChange={setClientDialogOpen}
              trigger={null}
            />
            <CreateQuoteDialog
              isOpen={quoteDialogOpen}
              onClose={() => setQuoteDialogOpen(false)}
              onSuccess={handleCreateQuote}
              companyId={companyId}
              onLoadClients={fetchClients}
              onGenerateQuoteNumber={generateQuoteNumber}
            />
            <ProductDialog
              companyId={companyId}
              open={productDialogOpen}
              onOpenChange={setProductDialogOpen}
            />
          </>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
