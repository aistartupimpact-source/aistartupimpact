import { requireFounderAuth } from '@/lib/founder-auth';
import { neon } from '@neondatabase/serverless';
import ProfileForm from './ProfileForm';

const sql = neon(process.env.DATABASE_URL!);

interface Founder {
  id: string;
  name: string;
  email: string;
  company: string | null;
  companyDomain: string | null;
  role: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  authProvider: string;
  emailVerified: boolean;
  status: string;
  createdAt: string;
}

export default async function ProfilePage() {
  const session = await requireFounderAuth();

  const founders = await sql`
    SELECT 
      id, name, email, company, "companyDomain", role, phone,
      avatar, bio, linkedin, twitter, website,
      "authProvider", "emailVerified", status,
      "createdAt"::text AS "createdAt"
    FROM "FounderUser"
    WHERE id = ${session.userId}
    LIMIT 1
  `;

  const founder = founders[0] as Founder;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      <ProfileForm founder={founder} />
    </div>
  );
}
