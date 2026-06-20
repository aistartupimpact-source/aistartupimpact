import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, IndianRupee, Calendar, Users, Building2, ExternalLink } from 'lucide-react';
import { getFundingRoundBySlugDirect } from '@/lib/db';

export const revalidate = 86400; // Regenerate daily

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const round = await getFundingRoundBySlugDirect(params.slug);
  if (!round) return { title: 'Funding Round Not Found' };
  
  const title = `${round.startupName} Raises $${(round.amountUsd / 1000000).toFixed(1)}M in ${round.roundType}`;
  const description = `${round.startupName} announced ${round.roundType} funding of $${(round.amountUsd / 1000000).toFixed(1)} million${round.leadInvestors?.[0] ? ` led by ${round.leadInvestors[0]}` : ''} on ${new Date(round.announcedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
  
  return {
    title,
    description,
    alternates: { 
      canonical: `https://aistartupimpact.com/funding/${params.slug}` 
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://aistartupimpact.com/funding/${params.slug}`,
      siteName: 'AI Startup Impact',
      publishedTime: round.announcedAt,
      images: [{
        url: 'https://aistartupimpact.com/og-image.png',
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default async function FundingRoundPage({ params }: { params: { slug: string } }) {
  const round = await getFundingRoundBySlugDirect(params.slug);
  if (!round) notFound();
  
  const pageUrl = `https://aistartupimpact.com/funding/${params.slug}`;
  
  // MonetaryGrant schema for individual round
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": `${round.startupName} - ${round.roundType} Funding`,
        "datePublished": round.announcedAt,
        "mainEntity": {
          "@id": `${pageUrl}#grant`
        },
        "breadcrumb": {
          "@id": `${pageUrl}#breadcrumb`
        },
        "inLanguage": "en-IN"
      },
      {
        "@type": "MonetaryGrant",
        "@id": `${pageUrl}#grant`,
        "name": `${round.startupName} ${round.roundType}`,
        "amount": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": round.amountUsd
        },
        "funder": round.leadInvestors?.map((inv: string) => ({
          "@type": "Organization",
          "name": inv
        })),
        "recipient": {
          "@type": "Organization",
          "name": round.startupName,
          "url": `https://aistartupimpact.com/startups/${round.startupSlug}`,
          "location": round.headquartersCity ? {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": round.headquartersCity,
              "addressCountry": "IN"
            }
          } : undefined
        },
        "startDate": round.announcedAt,
        "url": round.sourceUrl
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://aistartupimpact.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Funding Tracker",
            "item": "https://aistartupimpact.com/funding"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${round.startupName} ${round.roundType}`,
            "item": pageUrl
          }
        ]
      }
    ]
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-jakarta text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/funding" className="hover:text-brand">Funding</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300 truncate">{round.startupName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 badge-brand mb-3 text-[10px] sm:text-xs">
          <IndianRupee className="w-3 h-3" /> {round.roundType}
        </div>
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white mb-4">
          {round.startupName} Raises ${(round.amountUsd / 1000000).toFixed(1)}M in {round.roundType}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-jakarta">
          Announced on {new Date(round.announcedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Funding Details Card */}
      <div className="card p-6 sm:p-8 mb-8">
        <h2 className="font-sora font-bold text-xl text-navy dark:text-white mb-6">Funding Details</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <IndianRupee className="w-4 h-4" />
              <span>Amount Raised</span>
            </div>
            <p className="font-sora font-bold text-2xl text-brand">
              ${(round.amountUsd / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ₹{(round.amountInr / 10000000).toFixed(1)} Crore
            </p>
          </div>

          {/* Date */}
          <div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              <span>Announced Date</span>
            </div>
            <p className="font-sora font-bold text-lg text-navy dark:text-white">
              {new Date(round.announcedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Location */}
          {round.headquartersCity && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                <Building2 className="w-4 h-4" />
                <span>Location</span>
              </div>
              <p className="font-sora font-bold text-lg text-navy dark:text-white">
                {round.headquartersCity}, India
              </p>
            </div>
          )}

          {/* Round Type */}
          <div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <Users className="w-4 h-4" />
              <span>Round Type</span>
            </div>
            <p className="font-sora font-bold text-lg text-navy dark:text-white">
              {round.roundType}
            </p>
          </div>
        </div>

        {/* Lead Investors */}
        {round.leadInvestors && round.leadInvestors.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-sora font-bold text-sm text-gray-500 dark:text-gray-400 mb-3">
              Lead Investors
            </h3>
            <div className="flex flex-wrap gap-2">
              {round.leadInvestors.map((investor: string, i: number) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-sm font-semibold"
                >
                  {investor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All Investors */}
        {round.allInvestors && round.allInvestors.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-sora font-bold text-sm text-gray-500 dark:text-gray-400 mb-3">
              All Investors
            </h3>
            <div className="flex flex-wrap gap-2">
              {round.allInvestors.map((investor: string, i: number) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                >
                  {investor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source Link */}
        {round.sourceUrl && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <a 
              href={round.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand hover:underline text-sm font-semibold"
            >
              View Original Announcement
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Startup Link */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-gray-900">
        <h3 className="font-sora font-bold text-lg text-navy dark:text-white mb-3">
          About {round.startupName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Learn more about {round.startupName}, their products, team, and impact on the AI ecosystem.
        </p>
        <Link 
          href={`/startups/${round.startupSlug}`}
          className="btn-brand inline-flex items-center gap-2"
        >
          View Startup Profile
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Back to Tracker */}
      <div className="mt-8 text-center">
        <Link 
          href="/funding"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand text-sm font-semibold"
        >
          ← Back to Funding Tracker
        </Link>
      </div>
    </div>
  );
}
