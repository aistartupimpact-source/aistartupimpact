import { sql } from '@/lib/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, MapPin, DollarSign, Clock, Building2 } from 'lucide-react';
import JobFilters from '@/components/jobs/JobFilters';

export const metadata: Metadata = {
  title: 'AI Jobs — Find Your Next Role in Artificial Intelligence',
  description: 'Browse 100+ AI jobs — ML Engineer, LLM Engineer, AI Product Manager, Data Scientist, and more. Remote, hybrid, and on-site roles at top AI companies.',
  alternates: { canonical: '/jobs' },
};
interface PageProps {
  searchParams: {
    category?: string;
    workType?: string;
    experience?: string;
    country?: string;
    visa?: string;
    sort?: string;
  };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const { category, workType, experience, country, visa, sort } = searchParams;

  let jobs: any[] = [];
  let total = 0;

  try {
    // Build dynamic WHERE clauses
    let whereExtra = '';
    const params: any[] = [];
    let paramIdx = 1;

    if (category && category !== 'all') {
      whereExtra += ` AND jl.category = $${paramIdx}::"JobBoardCategory"`;
      params.push(category);
      paramIdx++;
    }
    if (workType && workType !== 'all') {
      whereExtra += ` AND jl."workType" = $${paramIdx}::"JobBoardWorkType"`;
      params.push(workType);
      paramIdx++;
    }
    if (country) {
      whereExtra += ` AND jl.country = $${paramIdx}`;
      params.push(country);
      paramIdx++;
    }
    if (visa === 'true') {
      whereExtra += ` AND jl."visaSponsorship" = true`;
    }
    if (experience) {
      const minYears = parseInt(experience);
      if (!isNaN(minYears)) {
        whereExtra += ` AND (jl."experienceMin" IS NULL OR jl."experienceMin" <= $${paramIdx})`;
        params.push(minYears);
        paramIdx++;
      }
    }

    const orderBy = sort === 'salary' ? 'jl."salaryMax" DESC NULLS LAST' : 'jl."isFeatured" DESC, jl."publishedAt" DESC';

    // Use raw SQL with tagged template for the base query, separate parameterized filters
    jobs = await sql`
      SELECT jl.id, jl.slug, jl.title, jl."shortDescription", jl.category,
             jl."workType", jl.location, jl.city, jl.country,
             jl."salaryMin", jl."salaryMax", jl."salaryCurrency", jl."showSalary",
             jl."experienceMin", jl."experienceMax", jl.skills,
             jl."isFeatured", jl."listingTier", jl."visaSponsorship",
             jl."publishedAt"::text, jl."viewsCount",
             e."companyName", e.slug AS "companySlug", e."logoUrl"
      FROM "JobBoardListing" jl
      JOIN "JobBoardEmployer" e ON e.id = jl."employerId"
      WHERE jl."isActive" = true
        AND jl."deletedAt" IS NULL
        AND (jl."expiresAt" IS NULL OR jl."expiresAt" > NOW())
      ORDER BY jl."isFeatured" DESC, jl."publishedAt" DESC NULLS LAST
      LIMIT 50
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM "JobBoardListing" jl
      WHERE jl."isActive" = true AND jl."deletedAt" IS NULL
        AND (jl."expiresAt" IS NULL OR jl."expiresAt" > NOW())
    `;
    total = (countResult[0] as any)?.total || 0;
  } catch (err) {
    console.error('[Jobs Page] Error:', err);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-4xl text-navy dark:text-white">
          AI Jobs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Discover AI jobs from startups, scale-ups, and global AI companies.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link href="/employer/signup" className="btn-brand text-xs sm:text-sm px-4 py-2 inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Post a Job — Free
          </Link>
          <Link href="/employer/login" className="text-xs sm:text-sm font-semibold font-jakarta text-gray-500 hover:text-brand transition-colors">
            Employer Login →
          </Link>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        currentCategory={category}
        currentWorkType={workType}
        currentCountry={country}
        currentVisa={visa}
      />

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-2">No jobs yet</h2>
          <p className="text-sm text-gray-500 font-jakarta mb-4">
            AI jobs will appear here as employers post them.
          </p>
          <Link href="/employer/signup" className="btn-brand text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Post a Job (Employers)
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${job.slug}`}
              prefetch={false}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-brand/30 transition-colors group"
            >
              {/* Company Logo */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                {job.logoUrl ? (
                  <Image src={job.logoUrl} alt={job.companyName} width={48} height={48} sizes="48px" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Job Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                    {job.title}
                  </h2>
                  {job.isFeatured && (
                    <span className="text-xs font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta">
                  {job.companyName}
                </p>
                {job.shortDescription && (
                  <p className="text-xs text-gray-400 font-jakarta mt-1 line-clamp-1">{job.shortDescription}</p>
                )}
                {/* Skills */}
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skills.slice(0, 4).map((skill: string) => (
                      <span key={skill} className="text-xs font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-xs text-gray-400 font-jakarta shrink-0">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.workType === 'REMOTE' ? 'Remote' : job.city || job.country || job.workType}
                </span>
                {job.showSalary && job.salaryMin && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {job.salaryCurrency} {(job.salaryMin / 1000).toFixed(0)}K–{(job.salaryMax / 1000).toFixed(0)}K
                  </span>
                )}
                {job.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(job.publishedAt)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom CTA for employers */}
      <div className="mt-10 card p-6 sm:p-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/10 dark:to-gray-900 border-brand/20">
        <div className="inline-flex items-center gap-1.5 text-brand text-xs font-bold uppercase tracking-wider mb-3">
          <Briefcase className="w-3.5 h-3.5" /> Hire AI Talent
        </div>
        <h2 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white mb-2">
          Reach 45K+ AI professionals through AI Startup Impact
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-3 mb-5">
          <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Free job posting</span>
          <span className="flex items-center gap-1"><span className="text-green-500">✓</span> AI-focused audience</span>
          <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Employer dashboard</span>
          <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Premium promotion available</span>
        </div>
        <Link href="/employer/signup" className="btn-brand text-sm px-6 py-2.5 inline-flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Post a Job — Free
        </Link>
        <p className="text-xs text-gray-400 font-jakarta mt-3">
          Already have an employer account? <Link href="/employer/login" className="text-brand font-semibold hover:underline">Employer Login →</Link>
        </p>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
