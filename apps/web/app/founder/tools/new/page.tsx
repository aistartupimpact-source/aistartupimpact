import { requireFounderAuth } from '@/lib/founder-auth';
import ToolForm from '@/components/founder/ToolForm';

export default async function NewToolPage() {
  await requireFounderAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Submit Your AI Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your AI tool with the community. Our team will review your submission within 2-3 business days.
        </p>
      </div>

      {/* Form */}
      <ToolForm />
    </div>
  );
}
