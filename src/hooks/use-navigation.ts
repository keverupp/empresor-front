"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Função para navegar para seções ou páginas
  const navigateTo = (href: string) => {
    // Se o href é uma âncora (começa com #)
    if (href.startsWith("#")) {
      // Se estamos na página inicial (/)
      if (pathname === "/") {
        // Scroll suave para a seção
        scrollToSection(href);
      } else {
        // Se estamos em outra página, redireciona para home com âncora
        router.push(`/${href}`);
      }
    } else {
      // Para links normais (não âncoras), navega normalmente
      router.push(href);
    }
  };

  // Função para scroll suave até uma seção
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      // Offset para compensar header fixo (64px = h-16)
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Verificar se há âncora na URL ao carregar a página
  useEffect(() => {
    // Se estamos na página inicial e há um hash na URL
    if (pathname === "/" && window.location.hash) {
      // Aguarda um pouco para garantir que a página carregou
      setTimeout(() => {
        scrollToSection(window.location.hash);
      }, 500);
    }
  }, [pathname]);

  // Função para verificar se um link está ativo
  const isLinkActive = (href: string) => {
    if (href.startsWith("#")) {
      // Para âncoras, considerar ativo se estamos na home
      return pathname === "/";
    }
    // Para páginas normais
    return pathname === href;
  };

  // Função para obter a URL completa para um link
  const getFullUrl = (href: string) => {
    if (href.startsWith("#")) {
      return `/${href}`;
    }
    return href;
  };

  return {
    navigateTo,
    scrollToSection,
    isLinkActive,
    getFullUrl,
    pathname,
    isHomePage: pathname === "/",
  };
}

// Hook específico para componentes que precisam de scroll automático
export function useScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    // Função para fazer scroll baseado no hash da URL
    const scrollToHashElement = () => {
      const hash = window.location.hash;
      if (hash && pathname === "/") {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Scroll inicial
    scrollToHashElement();

    // Listener para mudanças no hash
    window.addEventListener("hashchange", scrollToHashElement);

    return () => {
      window.removeEventListener("hashchange", scrollToHashElement);
    };
  }, [pathname]);
}
