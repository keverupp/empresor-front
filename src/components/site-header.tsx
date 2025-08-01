// src/components/site-header.tsx
"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface SiteHeaderProps {
  actions?: React.ReactNode;
}

export function SiteHeader({ actions }: SiteHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Lado esquerdo - trigger e nome do usuário */}
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-sm sm:text-base font-medium">
            {user?.name && `Bem-vindo(a), ${user.name.split(" ")[0]}`}
          </h1>
        </div>

        {/* Lado direito - ações */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
