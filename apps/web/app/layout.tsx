import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import ThemeProvider from '@/components/ThemeProvider';
import AnalyticsTracker from '@/components/Analytics';
import { generateWebSiteSchema, generateOrganizationSchema } from '@/lib/seo';
import Script from 'next/script';
import './globals.css';

// Only load the two fonts actually used in UI — JetBrains is code-only, loaded on demand
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
  weight: ['400', '600', '700', '800'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aistartupimpact.com"),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "AI Startup Impact – AI Startup India News & Funding",
    template: '%s | AI Startup Impact',
  },
  description:
    "AI Startup Impact is the premier platform for Indian AI news. Discover top artificial intelligence startups, funding, tools, and founder stories.",
  keywords: [
    'ai startups india 2026', 'Krutrim AI', 'India AI news', 'best AI tools India',
    'Sarvam AI', 'India AI ecosystem', 'Bhavish Aggarwal AI', 'AI funding India 2026',
    'top AI companies India', 'Sarvam AI funding', 'AI startup news India', 'IndiaAI Mission',
    'India AI unicorn', 'AI jobs India', 'best AI assistant India', 'India AI funding tracker',
    'Neysa AI India', 'sovereign AI India', 'AI newsletter India', 'Indian AI founder stories',
    'ai startup impact', 'AI startups India', 'India AI startup news',
    'AI startup funding India 2026', 'Indian AI ecosystem', 'AI founder stories India',
    'India artificial intelligence news', 'AI startup news', 'IndiaAI startup ecosystem'
  ],
  openGraph: {
    title: "AI Startup Impact – AI Startup India News & Funding",
    description: "AI Startup Impact is the premier platform for Indian AI news. Discover top artificial intelligence startups, funding, tools, and founder stories.",
    url: "https://aistartupimpact.com",
    siteName: "AI Startup Impact",
    type: "website",
    locale: 'en_IN',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: "AI Startup Impact – AI Startup India News & Funding" }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aikitstartup',
    creator: '@aikitstartup',
    title: "AI Startup Impact – AI Startup India News & Funding",
    description: "AI Startup Impact is the premier platform for Indian AI news. Discover top artificial intelligence startups, funding, tools, and founder stories.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: 'your-token',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = generateWebSiteSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent FOUC — set dark class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('asi-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Google Analytics */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-PVL3NC8DQ6" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PVL3NC8DQ6');
            `,
          }}
        />
        {/* Google tag (gtag.js) event */}
        <Script
          id="google-conversion"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion_event_page_view', {
                // <event_parameters>
              });
            `,
          }}
        />
      </head>
      <body className="font-jakarta antialiased bg-white dark:bg-gray-950 text-charcoal dark:text-gray-100">
        {/* Site-level structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <ThemeProvider>
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
