"use client";

import {
  IconCommand,
  IconPlus,
  IconSearch,
  IconFileText,
  IconUsers,
  IconCalendar,
  IconSettings,
  IconCalculator,
  type Icon,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

// Definição dos comandos/atalhos disponíveis
const quickCommands = [
  {
    group: "Criar",
    items: [
      {
        title: "Novo Orçamento",
        description: "Criar um novo orçamento",
        icon: IconFileText,
        action: "/quotes/new",
        keywords: ["orcamento", "quote", "novo", "criar"],
      },
      {
        title: "Novo Cliente",
        description: "Adicionar novo cliente",
        icon: IconUsers,
        action: "/clients/new",
        keywords: ["cliente", "client", "novo", "adicionar"],
      },
      {
        title: "Novo Produto",
        description: "Cadastrar novo produto",
        icon: IconPlus,
        action: "/products/new",
        keywords: ["produto", "product", "novo", "cadastrar"],
      },
      {
        title: "Agendar Reunião",
        description: "Criar novo evento no calendário",
        icon: IconCalendar,
        action: "/calendar/new",
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
        title: "Relatórios",
        description: "Ver relatórios e analytics",
        icon: IconCalculator,
        action: "/reports",
        keywords: ["relatorios", "reports", "analytics"],
      },
      {
        title: "Configurações",
        description: "Configurações da conta",
        icon: IconSettings,
        action: "/settings",
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
  const router = useRouter();

  // Atalhos de teclado globais
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Abre o command input com Cmd+K ou Ctrl+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        return;
      }

      // Se o dialog não estiver aberto, verifica atalhos específicos
      if (!open) {
        const isModifierPressed = e.metaKey || e.ctrlKey;

        if (isModifierPressed) {
          const shortcutMap: Record<string, string> = {
            n: "/quotes/new",
            u: "/clients/new",
            p: "/products/new",
            r: "/calendar/new",
            d: "/dashboard",
            a: "/reports",
            ",": "/settings",
          };

          const action = shortcutMap[e.key.toLowerCase()];
          if (action) {
            e.preventDefault();
            router.push(action);
          }
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, router]);

  const handleCommandSelect = (action: string) => {
    setOpen(false);
    router.push(action);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(true)}
              tooltip="Command Input (⌘K)"
              className="bg-input text-input-foreground hover:bg-input/90 hover:text-input-foreground active:bg-input/90 active:text-input-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCommand />
              <span>Pesquisar</span>
              <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Digite um comando ou busque..." />
          <CommandList>
            <CommandEmpty>Nenhum comando encontrado.</CommandEmpty>

            {quickCommands.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.title}
                    value={item.keywords.join(" ")}
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

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
