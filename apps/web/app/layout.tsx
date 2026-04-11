import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import ThemeProvider from '@/components/ThemeProvider';
import { generateWebSiteSchema, generateOrganizationSchema } from '@/lib/seo';
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
  title: {
    default: "AI Startup Impact – #1 AI Startup India News, Tools & Funding",
    template: '%s | AI Startup Impact',
  },
  description:
    "AI Startup Impact is the premier platform for AI Startup India news. Discover the top artificial intelligence companies, funding impact, native tools, and founder stories in India.",
  keywords: [
    'ai startups india 2026', 'Krutrim AI', 'India AI news', 'best AI tools India',
    'Sarvam AI', 'India AI ecosystem', 'Bhavish Aggarwal AI', 'AI funding India 2026',
    'top AI companies India', 'Sarvam AI funding', 'AI startup news India', 'IndiaAI Mission',
    'India AI unicorn', 'AI jobs India', 'best AI assistant India', 'India AI funding tracker',
    'Neysa AI India', 'sovereign AI India', 'AI newsletter India', 'Indian AI founder stories',
    'ai startup impact'
  ],
  openGraph: {
    title: "AI Startup Impact – #1 AI Startup India News, Tools & Funding",
    description: "AI Startup Impact is the premier platform for AI Startup India news. Discover the top artificial intelligence companies, funding impact, native tools, and founder stories in India.",
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
    title: "AI Startup Impact – #1 AI Startup India News, Tools & Funding",
    description: "AI Startup Impact is the premier platform for AI Startup India news. Discover the top artificial intelligence companies, funding impact, native tools, and founder stories in India.",
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
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
