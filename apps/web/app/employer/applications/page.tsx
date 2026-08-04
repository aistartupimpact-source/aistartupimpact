import { sql } from '@/lib/db';
import { getEmployerSession } from '@/lib/employer-auth';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
export default async function EmployerApplicationsPage() {
  const session = await getEmployerSession();
  if (!session) redirect('/employer/login');

  let applications: any[] = [];
  try {
    applications = await sql`
      SELECT a.id, a."fullName", a.email, a.status, a."appliedAt"::text,
             a."linkedinUrl", a."resumeUrl", a.rating,
             l.title AS "jobTitle", l.slug AS "jobSlug"
      FROM "JobBoardApplication" a
      JOIN "JobBoardListing" l ON l.id = a."listingId"
      WHERE l."employerId" = ${session.id}
      ORDER BY a."appliedAt" DESC
      LIMIT 50
    `;
  } catch {}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Applications</h1>
        <p className="text-xs text-gray-500 font-jakarta mt-0.5">{applications.length} application{applications.length !== 1 ? 's' : ''} received</p>
      </div>

      {applications.length === 0 ? (
        <div className="card p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white mb-2">No applications yet</h2>
          <p className="text-sm text-gray-500 font-jakarta">Applications will appear here once candidates apply to your jobs.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta">Job</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta">Applied</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 font-jakarta">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy dark:text-white font-jakarta">{app.fullName}</p>
                    <p className="text-[11px] text-gray-400">{app.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-jakarta">{app.jobTitle}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-jakarta">
                    {new Date(app.appliedAt + 'Z').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3">
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-brand text-xs font-semibold hover:underline">View</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
