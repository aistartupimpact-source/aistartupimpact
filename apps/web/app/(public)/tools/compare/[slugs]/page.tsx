import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Star, Check, X as XIcon, ChevronRight } from 'lucide-react';
import { getAiToolBySlugDirect, getToolProsConsDirect } from '@/lib/db';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slugs: string } }): Promise<Metadata> {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) return { title: 'Compare Tools' };
  const [tool1, tool2] = await Promise.all([
    getAiToolBySlugDirect(parts[0]),
    getAiToolBySlugDirect(parts[1]),
  ]);
  if (!tool1 || !tool2) return { title: 'Compare Tools' };
  const title = `${(tool1 as any).name} vs ${(tool2 as any).name}: Which Is Better in ${new Date().getFullYear()}?`;
  const description = `Compare ${(tool1 as any).name} and ${(tool2 as any).name} — features, pricing, pros & cons, ratings side by side.`;
  return { title, description, alternates: { canonical: `https://aistartupimpact.com/tools/compare/${params.slugs}` }, openGraph: { title, description } };
}

export default async function ComparePage({ params }: { params: { slugs: string } }) {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) notFound();

  const [tool1, tool2] = await Promise.all([
    getAiToolBySlugDirect(parts[0]),
    getAiToolBySlugDirect(parts[1]),
  ]);

  if (!tool1 || !tool2) notFound();
  const t1 = tool1 as any;
  const t2 = tool2 as any;

  const [pros1, pros2] = await Promise.all([
    getToolProsConsDirect(t1.id),
    getToolProsConsDirect(t2.id),
  ]);

  const pricingLabel: Record<string, string> = {
    FREE: 'Free', FREEMIUM: 'Freemium', PAID: 'Paid', OPEN_SOURCE: 'Open Source', ENTERPRISE: 'Enterprise',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-jakarta text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/tools" className="hover:text-brand">Tools</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 dark:text-gray-300">Compare</span>
      </nav>

      <h1 className="font-sora font-extrabold text-2xl md:text-3xl text-navy dark:text-white mb-2">
        {t1.name} vs {t2.name}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm mb-8">
        Side-by-side comparison to help you choose the right tool.
      </p>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-3">
          {/* Header */}
          <div className="p-4 border-b border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs font-semibold text-gray-500 uppercase font-jakarta">Feature</span>
          </div>
          <div className="p-4 border-b border-r border-gray-100 dark:border-gray-800 text-center">
            <div className="flex flex-col items-center gap-2">
              {t1.logoUrl && <img src={t1.logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain border border-gray-100 dark:border-gray-700 p-1" />}
              <Link href={`/tools/${t1.slug}`} className="font-sora font-bold text-sm text-navy dark:text-white hover:text-brand">{t1.name}</Link>
            </div>
          </div>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 text-center">
            <div className="flex flex-col items-center gap-2">
              {t2.logoUrl && <img src={t2.logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain border border-gray-100 dark:border-gray-700 p-1" />}
              <Link href={`/tools/${t2.slug}`} className="font-sora font-bold text-sm text-navy dark:text-white hover:text-brand">{t2.name}</Link>
            </div>
          </div>

          {/* Rows */}
          <CompareRow label="Category" v1={t1.categoryName || '—'} v2={t2.categoryName || '—'} />
          <CompareRow label="Pricing" v1={pricingLabel[t1.pricingModel] || t1.pricingModel} v2={pricingLabel[t2.pricingModel] || t2.pricingModel} />
          <CompareRow label="Rating" v1={t1.avgRating ? `${parseFloat(t1.avgRating).toFixed(1)} / 5` : '—'} v2={t2.avgRating ? `${parseFloat(t2.avgRating).toFixed(1)} / 5` : '—'} />
          <CompareRow label="Free Trial" v1={t1.freeTrialDays ? `${t1.freeTrialDays} days` : 'No'} v2={t2.freeTrialDays ? `${t2.freeTrialDays} days` : 'No'} />
          <CompareRow label="API Access" v1={t1.hasApi ? 'Yes' : 'No'} v2={t2.hasApi ? 'Yes' : 'No'} isBoolean />
          <CompareRow label="Mobile App" v1={t1.hasMobileApp ? 'Yes' : 'No'} v2={t2.hasMobileApp ? 'Yes' : 'No'} isBoolean />
          <CompareRow label="HQ" v1={t1.headquartersCountry || '—'} v2={t2.headquartersCountry || '—'} />
          <CompareRow label="Launch Year" v1={t1.launchYear || '—'} v2={t2.launchYear || '—'} />
        </div>
      </div>

      {/* Pros & Cons comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="card p-5">
          <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">{t1.name} — Strengths</h3>
          <div className="space-y-2">
            {(pros1.pros as any[]).length > 0 ? (pros1.pros as any[]).map((p: any) => (
              <div key={p.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">{p.text}</span>
              </div>
            )) : <p className="text-sm text-gray-400 font-jakarta">No pros listed yet</p>}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">{t2.name} — Strengths</h3>
          <div className="space-y-2">
            {(pros2.pros as any[]).length > 0 ? (pros2.pros as any[]).map((p: any) => (
              <div key={p.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-jakarta">{p.text}</span>
              </div>
            )) : <p className="text-sm text-gray-400 font-jakarta">No pros listed yet</p>}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center gap-4 mt-8">
        <Link href={`/tools/${t1.slug}`} className="px-6 py-2.5 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">View {t1.name}</Link>
        <Link href={`/tools/${t2.slug}`} className="px-6 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">View {t2.name}</Link>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t1.name} vs ${t2.name}`,
        description: `Comparison of ${t1.name} and ${t2.name}`,
      }) }} />
    </div>
  );
}

function CompareRow({ label, v1, v2, isBoolean }: { label: string; v1: any; v2: any; isBoolean?: boolean }) {
  return (
    <>
      <div className="px-4 py-3 border-b border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 font-jakarta">{label}</span>
      </div>
      <div className="px-4 py-3 border-b border-r border-gray-100 dark:border-gray-800 text-center">
        {isBoolean ? (
          v1 === 'Yes' ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <XIcon className="w-4 h-4 text-gray-300 mx-auto" />
        ) : (
          <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{v1}</span>
        )}
      </div>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center">
        {isBoolean ? (
          v2 === 'Yes' ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <XIcon className="w-4 h-4 text-gray-300 mx-auto" />
        ) : (
          <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{v2}</span>
        )}
      </div>
    </>
  );
}
