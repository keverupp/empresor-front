// src/config/app.ts
export const appConfig = {
  // Informações Básicas da Aplicação
  name: "Empresor",
  displayName: "Empresor - Sistema de Gestão Empresarial",
  description:
    "Plataforma SaaS completa para gestão empresarial, oferecendo ferramentas integradas para administração de empresas, clientes, produtos, orçamentos e análise de dados para empresas de todos os portes.",
  version: "1.0.0",

  // URLs e Domínios
  urls: {
    production: "https://empresor.com.br",
    staging: "https://staging.empresor.com.br",
    development: "http://localhost:3000",
    api: {
      base: "https://api.empresor.com.br", // Baseado no servidor de desenvolvimento da API
      version: "api",
      endpoints: {
        // Autenticação
        auth: {
          register: "/auth/register",
          login: "/auth/login",
          logout: "/auth/logout",
          forgotPassword: "/auth/forgot-password",
          resetPassword: "/auth/reset-password",
          refresh: "/auth/refresh",
        },
        // Usuários
        users: {
          me: "/users/me",
          notifications: "/users/me/notifications",
          notificationsSummary: "/users/me/notifications/summary",
          markAsRead: "/users/me/notifications/mark-read",
          markAllAsRead: "/users/me/notifications/mark-all-read",
        },
        // Empresas
        companies: {
          base: "/companies",
          list: "/companies",
          create: "/companies",
          byId: (id: string) => `/companies/${id}`,
          update: (id: string) => `/companies/${id}`,
          delete: (id: string) => `/companies/${id}`,
          logo: (id: string) => `/companies/${id}/logo`,
          verify: (id: string) => `/companies/${id}/verify`,
          resendValidation: (id: string) =>
            `/companies/${id}/resend-validation`,
          shared: "/companies/shared",
          shares: (companyId: string) => `/companies/${companyId}/shares`,
          removeShare: (companyId: string, userId: string) =>
            `/companies/${companyId}/shares/${userId}`,
        },
        // Clientes
        clients: {
          list: (companyId: string) => `/companies/${companyId}/clients`,
          create: (companyId: string) => `/companies/${companyId}/clients`,
          byId: (companyId: string, clientId: string) =>
            `/companies/${companyId}/clients/${clientId}`,
          update: (companyId: string, clientId: string) =>
            `/companies/${companyId}/clients/${clientId}`,
          delete: (companyId: string, clientId: string) =>
            `/companies/${companyId}/clients/${clientId}`,
        },
        // Produtos
        products: {
          list: (companyId: string) => `/companies/${companyId}/products`,
          create: (companyId: string) => `/companies/${companyId}/products`,
          byId: (companyId: string, productId: string) =>
            `/companies/${companyId}/products/${productId}`,
          update: (companyId: string, productId: string) =>
            `/companies/${companyId}/products/${productId}`,
          delete: (companyId: string, productId: string) =>
            `/companies/${companyId}/products/${productId}`,
          active: (companyId: string) =>
            `/companies/${companyId}/products/active`,
        },
        // Orçamentos
        quotes: {
          list: (companyId: string) => `/companies/${companyId}/quotes`,
          create: (companyId: string) => `/companies/${companyId}/quotes`,
          byId: (companyId: string, quoteId: string) =>
            `/companies/${companyId}/quotes/${quoteId}`,
          update: (companyId: string, quoteId: string) =>
            `/companies/${companyId}/quotes/${quoteId}`,
          delete: (companyId: string, quoteId: string) =>
            `/companies/${companyId}/quotes/${quoteId}`,
          updateStatus: (companyId: string, quoteId: string) =>
            `/companies/${companyId}/quotes/${quoteId}/status`,
          stats: (companyId: string) => `/companies/${companyId}/quotes/stats`,
          expiring: (companyId: string) =>
            `/companies/${companyId}/quotes/expiring`,
          generateNumber: (companyId: string) =>
            `/companies/${companyId}/quotes/generate-number`,
        },
        // Dashboard
        dashboard: {
          summary: "/dashboard/summary",
          quotations: "/dashboard/quotations",
          companiesStats: "/dashboard/stats/companies",
          timeline: "/dashboard/stats/timeline",
          topClients: "/dashboard/stats/top-clients",
          conversion: "/dashboard/stats/conversion",
          expiringQuotes: "/dashboard/expiring-quotes",
        },
      },
    },
  },

  // Caminhos de Assets
  assets: {
    logo: {
      main: "/logo.svg",
      icon: "/logo.png",
      light: "/logo-light.svg",
      dark: "/logo-dark.svg",
      watermark: "/logo-watermark.svg",
    },
    images: {
      hero: "/images/hero-bg.jpg",
      about: "/images/about-us.jpg",
      features: "/images/features-bg.jpg",
      placeholder: "/images/placeholder.jpg",
    },
    icons: {
      favicon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
      android192: "/android-chrome-192x192.png",
      android512: "/android-chrome-512x512.png",
    },
  },

  // OpenGraph e Meta Tags
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://empresor.com.br",
    siteName: "Empresor",
    title: "Empresor - Sistema de Gestão Empresarial Completo",
    description:
      "Transforme a gestão da sua empresa com nossa plataforma SaaS completa. Gerencie empresas, clientes, produtos e orçamentos em um só lugar.",
    images: {
      default: "/images/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Empresor - Sistema de Gestão Empresarial",
    },
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    site: "@empresor",
    creator: "@empresor",
    images: "/images/twitter-card.jpg",
  },

  // SEO Keywords
  keywords: [
    // Palavras-chave principais
    "sistema gestão empresarial",
    "software empresarial",
    "gestão de clientes",
    "controle de orçamentos",
    "gestão de produtos",
    "catálogo de produtos",

    // SaaS específico
    "SaaS gestão empresarial",
    "software as a service",
    "plataforma empresarial online",
    "sistema web empresarial",
    "cloud empresarial",

    // Funcionalidades específicas da API
    "gestão de empresas",
    "cadastro de clientes",
    "catálogo de produtos",
    "criação de orçamentos",
    "dashboard empresarial",
    "relatórios de vendas",
    "análise de conversão",
    "notificações empresariais",

    // Target de mercado
    "pequenas empresas",
    "médias empresas",
    "startups",
    "PME",
    "prestadores de serviço",
    "vendas B2B",

    // Benefícios
    "produtividade empresarial",
    "eficiência em vendas",
    "transformação digital",
    "digitalização empresarial",
    "automação de orçamentos",

    // Localização
    "sistema empresarial brasileiro",
    "software empresarial Brasil",
    "gestão empresarial nacional",
  ] as string[],

  // Configurações de Contato
  contact: {
    email: "contato@empresor.com.br",
    support: "suporte@empresor.com.br",
    sales: "vendas@empresor.com.br",
    phone: "+55 (11) 99999-9999",
    whatsapp: "+5511999999999",
    address: {
      street: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      country: "Brasil",
    },
  },

  // Redes Sociais
  social: {
    linkedin: "https://linkedin.com/company/empresor",
    twitter: "https://twitter.com/empresor",
    facebook: "https://facebook.com/empresor",
    instagram: "https://instagram.com/empresor",
    youtube: "https://youtube.com/@empresor",
    github: "https://github.com/empresor",
  },

  // Configurações da Aplicação
  app: {
    theme: {
      primary: "#3B82F6",
      secondary: "#6B7280",
      accent: "#10B981",
      defaultTheme: "system", // 'light' | 'dark' | 'system'
      enableSystemTheme: true,
      storageKey: "empresor-theme",
      themes: ["light", "dark", "system"] as string[],
      disableTransitionOnChange: false,
    },
    features: {
      darkMode: true,
      notifications: true,
      analytics: true,
      multiLanguage: false,
      realTime: true,
      companySharing: true,
      quotePDFGeneration: true,
      logoUpload: true,
    },
    limits: {
      fileUpload: "10MB",
      maxCompanies: 100,
      maxClients: 10000,
      maxProducts: 5000,
      maxQuotes: 50000,
      quotesPerPage: 20,
      clientsPerPage: 50,
      productsPerPage: 50,
    },
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100,
    },
    validation: {
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      },
      name: {
        minLength: 2,
        maxLength: 255,
      },
      company: {
        nameMaxLength: 255,
        documentMaxLength: 50,
        emailMaxLength: 255,
      },
    },
  },

  // Status de Orçamentos baseados na API
  quoteStatuses: {
    draft: { label: "Rascunho", color: "gray" },
    sent: { label: "Enviado", color: "blue" },
    viewed: { label: "Visualizado", color: "yellow" },
    accepted: { label: "Aceito", color: "green" },
    rejected: { label: "Rejeitado", color: "red" },
    expired: { label: "Expirado", color: "orange" },
    invoiced: { label: "Faturado", color: "purple" },
  },

  // Configurações de Analytics
  analytics: {
    google: {
      id: "GA-XXXXXXXXX",
      enabled: true,
    },
    hotjar: {
      id: "XXXXXXX",
      enabled: true,
    },
    segment: {
      writeKey: "XXXXXXXXXXXX",
      enabled: false,
    },
  },

  // Legal e Compliance
  legal: {
    privacyPolicy: "/politica-privacidade",
    termsOfService: "/termos-uso",
    cookiePolicy: "/politica-cookies",
    lgpdCompliant: true,
    gdprCompliant: true,
  },

  // Configurações de Desenvolvimento
  development: {
    api: {
      timeout: 30000,
      retries: 3,
      baseURL: "https://api.empresor.com.br/api", // Baseado no servidor da API fornecida
    },
    debug: true,
    mockData: false, // Como temos API real, desabilitar mock
  },

  // Configurações de Moeda (baseado no padrão brasileiro da API)
  currency: {
    default: "BRL",
    symbol: "R$",
    locale: "pt-BR",
    centsSuffix: "_cents", // Baseado nos campos da API que usam *_cents
  },

  // Configurações de Data/Hora
  dateTime: {
    locale: "pt-BR",
    timezone: "America/Sao_Paulo",
    formats: {
      date: "dd/MM/yyyy",
      dateTime: "dd/MM/yyyy HH:mm",
      time: "HH:mm",
    },
  },
} as const;

// Tipos TypeScript para melhor experiência de desenvolvimento
export type AppConfig = typeof appConfig;
export type ApiEndpoint = keyof typeof appConfig.urls.api.endpoints;
export type QuoteStatus = keyof typeof appConfig.quoteStatuses;

// Helper functions para construir URLs da API
export const buildApiUrl = {
  // Empresas
  companies: {
    list: () => appConfig.urls.api.endpoints.companies.list,
    byId: (id: string) => appConfig.urls.api.endpoints.companies.byId(id),
    logo: (id: string) => appConfig.urls.api.endpoints.companies.logo(id),
    verify: (id: string) => appConfig.urls.api.endpoints.companies.verify(id),
    shared: () => appConfig.urls.api.endpoints.companies.shared,
  },
  // Clientes
  clients: {
    list: (companyId: string) =>
      appConfig.urls.api.endpoints.clients.list(companyId),
    byId: (companyId: string, clientId: string) =>
      appConfig.urls.api.endpoints.clients.byId(companyId, clientId),
  },
  // Produtos
  products: {
    list: (companyId: string) =>
      appConfig.urls.api.endpoints.products.list(companyId),
    byId: (companyId: string, productId: string) =>
      appConfig.urls.api.endpoints.products.byId(companyId, productId),
    active: (companyId: string) =>
      appConfig.urls.api.endpoints.products.active(companyId),
  },
  // Orçamentos
  quotes: {
    list: (companyId: string) =>
      appConfig.urls.api.endpoints.quotes.list(companyId),
    byId: (companyId: string, quoteId: string) =>
      appConfig.urls.api.endpoints.quotes.byId(companyId, quoteId),
    stats: (companyId: string) =>
      appConfig.urls.api.endpoints.quotes.stats(companyId),
    expiring: (companyId: string) =>
      appConfig.urls.api.endpoints.quotes.expiring(companyId),
  },
  // Dashboard
  dashboard: {
    summary: () => appConfig.urls.api.endpoints.dashboard.summary,
    quotations: () => appConfig.urls.api.endpoints.dashboard.quotations,
    timeline: () => appConfig.urls.api.endpoints.dashboard.timeline,
    companiesStats: () =>
      appConfig.urls.api.endpoints.dashboard.companiesStats,
  },
};

// Utilitários para formatação
export const formatters = {
  currency: (amountInCents: number) =>
    new Intl.NumberFormat(appConfig.currency.locale, {
      style: "currency",
      currency: appConfig.currency.default,
    }).format(amountInCents / 100),

  date: (date: string | Date) =>
    new Intl.DateTimeFormat(appConfig.dateTime.locale).format(new Date(date)),

  dateTime: (date: string | Date) =>
    new Intl.DateTimeFormat(appConfig.dateTime.locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date)),
};
