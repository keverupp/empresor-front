import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { appConfig } from "@/config/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Metadata estática baseada na configuração
export const metadata: Metadata = {
  title: {
    default: appConfig.displayName,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  keywords: appConfig.keywords,
  authors: [
    {
      name: appConfig.name,
      url: appConfig.urls.production,
    },
  ],
  creator: appConfig.name,
  publisher: appConfig.name,
  metadataBase: new URL(appConfig.urls.production),

  // OpenGraph
  openGraph: {
    type: appConfig.openGraph.type,
    locale: appConfig.openGraph.locale,
    url: appConfig.openGraph.url,
    siteName: appConfig.openGraph.siteName,
    title: appConfig.openGraph.title,
    description: appConfig.openGraph.description,
    images: [
      {
        url: appConfig.openGraph.images.default,
        width: appConfig.openGraph.images.width,
        height: appConfig.openGraph.images.height,
        alt: appConfig.openGraph.images.alt,
      },
    ],
  },

  // Twitter
  twitter: {
    card: appConfig.twitter.card,
    site: appConfig.twitter.site,
    creator: appConfig.twitter.creator,
    title: appConfig.openGraph.title,
    description: appConfig.description,
    images: [appConfig.twitter.images],
  },

  // Ícones
  icons: {
    icon: [
      { url: appConfig.assets.icons.favicon },
      {
        url: appConfig.assets.icons.android192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: appConfig.assets.icons.android512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: appConfig.assets.icons.apple }],
    shortcut: appConfig.assets.icons.favicon,
  },

  // Manifesto e outros
  manifest: "/manifest.json",
  category: "business",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verificação
  verification: {
    google: "verification-code", // Adicionar código real quando disponível
  },
};

// Viewport separado (requerido no Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: appConfig.app.theme.primary,
    },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Analytics - Google Analytics */}
        {appConfig.analytics.google.enabled && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${appConfig.analytics.google.id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${appConfig.analytics.google.id}');
                `,
              }}
            />
          </>
        )}

        {/* Hotjar */}
        {appConfig.analytics.hotjar.enabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:${appConfig.analytics.hotjar.id},hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: appConfig.name,
              description: appConfig.description,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: appConfig.urls.production,
              author: {
                "@type": "Organization",
                name: appConfig.name,
                url: appConfig.urls.production,
              },
              offers: {
                "@type": "Offer",
                category: "SaaS",
                availability: "InStock",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Conteúdo principal */}
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>

        {/* Scripts adicionais para desenvolvimento */}
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('🚀 ${appConfig.name} - Ambiente de Desenvolvimento');
                console.log('📊 Debug Mode:', ${appConfig.development.debug});
                console.log('🔗 API URL:', '${appConfig.development.api.baseURL}');
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
