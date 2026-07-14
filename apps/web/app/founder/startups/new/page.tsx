import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import StartupForm from '@/components/founder/StartupForm';

export default async function NewStartupPage() {
  const session = await requireFounderAuth();

  const user = await prisma.founderUser.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      role: true,
      previousCompany: true,
      bio: true,
      avatar: true,
      linkedin: true,
      twitter: true,
    },
  });

  const initialFounder = user ? {
    name: user.name,
    role: user.role || 'Founder',
    prev: user.previousCompany || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
    linkedin: user.linkedin || '',
    twitter: user.twitter || '',
  } : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Submit Your Startup
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your startup with the AI community. Our team will review your submission within 2-3 business days.
        </p>
      </div>

      {/* Form */}
      <StartupForm initialFounder={initialFounder} />
    </div>
  );
}
