import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Building2, Globe, Linkedin, ExternalLink, Briefcase, Users, CheckCircle2 } from 'lucide-react';
interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const jobs = await sql`
    SELECT jl.title, jl."shortDescription", e."companyName"
    FROM "JobBoardListing" jl
    JOIN "JobBoardEmployer" e ON e.id = jl."employerId"
    WHERE jl.slug = ${params.slug} AND jl."deletedAt" IS NULL
    LIMIT 1
  `;
  if (jobs.length === 0) return { title: 'Job Not Found' };
  const job = jobs[0] as any;
  return {
    title: `${job.title} at ${job.companyName} — AI Jobs`,
    description: job.shortDescription || `${job.title} position at ${job.companyName}. Apply now on AI Startup Impact.`,
    alternates: { canonical: `/jobs/${params.slug}` },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const jobs = await sql`
    SELECT jl.*, e."companyName", e.slug AS "companySlug", e."logoUrl",
           e."websiteUrl", e.description AS "companyDescription",
           e."companySize", e.industry, e."linkedinUrl", e."startupId", e."isVerified"
    FROM "JobBoardListing" jl
    JOIN "JobBoardEmployer" e ON e.id = jl."employerId"
    WHERE jl.slug = ${params.slug} AND jl."deletedAt" IS NULL
    LIMIT 1
  `;

  if (jobs.length === 0) notFound();
  const job = jobs[0] as any;

  // Increment view count (fire-and-forget)
  sql`UPDATE "JobBoardListing" SET "viewsCount" = "viewsCount" + 1 WHERE id = ${job.id}`.catch(() => {});

  // Get other jobs from same employer
  let otherJobs: any[] = [];
  try {
    otherJobs = await sql`
      SELECT id, slug, title, "workType", category
      FROM "JobBoardListing"
      WHERE "employerId" = ${job.employerId} AND id != ${job.id}
        AND "isActive" = true AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC
      LIMIT 5
    `;
  } catch {}

  const applyUrl = job.applicationType === 'EXTERNAL'
    ? (job.applicationUrl || `mailto:${job.applicationEmail}`)
    : `/jobs/${job.slug}/apply`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                {job.logoUrl ? (
                  <img src={job.logoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Link href={`/jobs/company/${job.companySlug}`} className="text-sm text-brand font-semibold font-jakarta hover:underline">
                    {job.companyName}
                  </Link>
                  {job.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1 text-xs font-jakarta bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {job.workType === 'REMOTE' ? 'Remote' : `${job.city || ''} ${job.country || ''}`.trim() || job.workType}
              </span>
              {job.showSalary && job.salaryMin && (
                <span className="inline-flex items-center gap-1 text-xs font-jakarta bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  {job.salaryCurrency} {(job.salaryMin / 1000).toFixed(0)}K – {(job.salaryMax / 1000).toFixed(0)}K / year
                </span>
              )}
              {job.experienceMin != null && (
                <span className="inline-flex items-center gap-1 text-xs font-jakarta bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {job.experienceMin}–{job.experienceMax || '10+'}  years
                </span>
              )}
              {job.visaSponsorship && (
                <span className="text-xs font-jakarta bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                  Visa Sponsorship
                </span>
              )}
              {job.isFeatured && (
                <span className="text-xs font-bold font-jakarta bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Apply button */}
            <div className="mt-5">
              <a
                href={applyUrl}
                target={job.applicationType === 'EXTERNAL' ? '_blank' : undefined}
                rel={job.applicationType === 'EXTERNAL' ? 'noopener noreferrer' : undefined}
                className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                {job.applicationType === 'EXTERNAL' ? (
                  <>Apply on Company Site <ExternalLink className="w-4 h-4" /></>
                ) : (
                  <>Apply Now <Briefcase className="w-4 h-4" /></>
                )}
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="card p-5 sm:p-6">
            <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-4">About the Role</h2>
            <div className="prose prose-sm dark:prose-invert prose-blue max-w-none font-jakarta whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card p-5 sm:p-6">
              <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <span key={skill} className="text-xs font-jakarta bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Company Card */}
          <div className="card p-5">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">About {job.companyName}</h3>
            {job.companyDescription && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta leading-relaxed mb-3">
                {job.companyDescription.slice(0, 200)}{job.companyDescription.length > 200 ? '...' : ''}
              </p>
            )}
            <div className="space-y-2 text-xs text-gray-500 font-jakarta">
              {job.industry && <p><strong>Industry:</strong> {job.industry}</p>}
              {job.companySize && <p><strong>Size:</strong> {job.companySize} employees</p>}
            </div>
            <div className="flex gap-2 mt-3">
              {job.websiteUrl && (
                <a href={job.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">
                  <Globe className="w-4 h-4 text-gray-500" />
                </a>
              )}
              {job.linkedinUrl && (
                <a href={job.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">
                  <Linkedin className="w-4 h-4 text-gray-500" />
                </a>
              )}
            </div>
            {job.startupId && (
              <Link href={`/startups/${job.companySlug}`} className="block mt-3 text-brand text-xs font-semibold hover:underline">
                View Startup Profile →
              </Link>
            )}
          </div>

          {/* Other Jobs */}
          {otherJobs.length > 0 && (
            <div className="card p-5">
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">
                More Jobs at {job.companyName}
              </h3>
              <div className="space-y-2">
                {otherJobs.map((other: any) => (
                  <Link key={other.id} href={`/jobs/${other.slug}`} className="block text-xs font-jakarta text-gray-600 dark:text-gray-400 hover:text-brand">
                    {other.title} · {other.workType}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Job Stats */}
          <div className="card p-5">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">Job Info</h3>
            <div className="space-y-2 text-xs text-gray-500 font-jakarta">
              <p><strong>Category:</strong> {job.category?.replace(/_/g, ' ')}</p>
              {job.department && <p><strong>Department:</strong> {job.department}</p>}
              <p><strong>Posted:</strong> {job.publishedAt ? new Date(job.publishedAt + 'Z').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</p>
              <p><strong>Views:</strong> {job.viewsCount}</p>
              <p><strong>Applications:</strong> {job.applicationsCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
