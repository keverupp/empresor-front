export const appConfig = {
  // Informações Básicas da Aplicação
  name: "Empresor",
  displayName: "Empresor - Sistema de Gestão Empresarial",
  description:
    "Plataforma SaaS completa para gestão empresarial, oferecendo ferramentas integradas para administração de documentos, projetos, finances, recursos humanos e análise de dados para empresas de todos os portes.",
  version: "1.0.0",

  // URLs e Domínios
  urls: {
    production: "https://empresor.com.br",
    staging: "https://staging.empresor.com.br",
    development: "http://localhost:3000",
    api: {
      base: "https://api.empresor.com.br",
      version: "v1",
      endpoints: {
        auth: "/auth",
        users: "/users",
        projects: "/projects",
        documents: "/documents",
        finances: "/finances",
        analytics: "/analytics",
        notifications: "/notifications",
      },
    },
  },

  // Caminhos de Assets
  assets: {
    logo: {
      main: "/logo.svg",
      icon: "/favicon.ico",
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
      "Transforme a gestão da sua empresa com nossa plataforma SaaS completa. Controle projetos, documentos, finanças e recursos humanos em um só lugar.",
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
    "ERP brasileiro",
    "gestão de projetos",
    "controle financeiro empresarial",

    // SaaS específico
    "SaaS gestão empresarial",
    "software as a service",
    "plataforma empresarial online",
    "sistema web empresarial",
    "cloud empresarial",

    // Funcionalidades
    "gestão de documentos",
    "controle de projetos",
    "administração de recursos humanos",
    "análise de dados empresariais",
    "dashboard empresarial",
    "relatórios gerenciais",

    // Target de mercado
    "pequenas empresas",
    "médias empresas",
    "startups",
    "PME",
    "gestão corporativa",
    "automação empresarial",

    // Benefícios
    "produtividade empresarial",
    "eficiência operacional",
    "transformação digital",
    "digitalização empresarial",
    "inovação empresarial",

    // Localização
    "sistema empresarial brasileiro",
    "ERP nacional",
    "software empresarial Brasil",
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
    },
    limits: {
      fileUpload: "10MB",
      maxUsers: 1000,
      maxProjects: 500,
      maxDocuments: 10000,
    },
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
      baseURL: "http://localhost:8000/api/v1",
    },
    debug: true,
    mockData: true,
  },
} as const;

// Tipos TypeScript para melhor experiência de desenvolvimento
export type AppConfig = typeof appConfig;
export type ApiEndpoint = keyof typeof appConfig.urls.api.endpoints;
