import { requireFounderAuth } from '@/lib/founder-auth';
import StartupForm from '@/components/founder/StartupForm';

export default async function NewStartupPage() {
  await requireFounderAuth();

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
      <StartupForm />
    </div>
  );
}
