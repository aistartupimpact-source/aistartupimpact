import { sql } from '@/lib/db';
import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, PlusCircle, Eye, Users, ExternalLink } from 'lucide-react';
export default async function EmployerJobsPage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  let jobs: any[] = [];
  try {
    jobs = await sql`
      SELECT id, slug, title, category, "workType", "listingTier",
             "isActive", "isFeatured", "applicationsCount", "viewsCount",
             "salaryMin", "salaryMax", "salaryCurrency", "showSalary",
             "publishedAt"::text, "createdAt"::text, "expiresAt"::text
      FROM "JobBoardListing"
      WHERE "employerId" = ${session.id} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
    `;
  } catch {}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">My Jobs</h1>
          <p className="text-xs text-gray-500 font-jakarta mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link href="/employer/jobs/new" className="btn-brand text-sm flex items-center gap-2 px-4 py-2.5">
          <PlusCircle className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-2">No jobs yet</h2>
          <p className="text-sm text-gray-500 font-jakarta mb-5">Post your first AI job and reach thousands of qualified candidates.</p>
          <Link href="/employer/jobs/new" className="btn-brand text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/employer/jobs/${job.id}/edit`} className="font-sora font-bold text-sm text-navy dark:text-white hover:text-brand">
                    {job.title}
                  </Link>
                  {job.isFeatured && (
                    <span className="text-xs font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">Featured</span>
                  )}
                  <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${job.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-jakarta">
                  <span>{job.category?.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span>{job.workType}</span>
                  {job.showSalary && job.salaryMin && (
                    <>
                      <span>•</span>
                      <span>{job.salaryCurrency} {job.salaryMin?.toLocaleString()}–{job.salaryMax?.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400 font-jakarta">
                  <Eye className="w-3.5 h-3.5" /> {job.viewsCount}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-jakarta">
                  <Users className="w-3.5 h-3.5" /> {job.applicationsCount}
                </div>
                <Link href={`/jobs/${job.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="View public listing">
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
