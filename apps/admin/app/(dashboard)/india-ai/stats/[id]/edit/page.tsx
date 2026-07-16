import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@aistartupimpact/database';
import StatForm from '../../StatForm';

interface EditStatPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Live Stat | Admin',
};

export default async function EditStatPage({ params }: EditStatPageProps) {
  const stat = await prisma.indiaAIStats.findUnique({
    where: { id: params.id },
  });

  if (!stat) {
    notFound();
  }

  const normalizedStat = {
    metricKey: stat.metricKey,
    metricLabel: stat.metricLabel,
    metricValue: stat.metricValue,
    metricChange: stat.metricChange,
    metricIcon: stat.metricIcon,
    displayOrder: stat.displayOrder,
    isActive: stat.isActive ?? true,
  };

  async function updateStat(formData: FormData) {
    'use server';

    const metricKey = formData.get('metricKey') as string;
    const metricLabel = formData.get('metricLabel') as string;
    const metricValue = formData.get('metricValue') as string;
    if (!metricKey || !metricLabel || !metricValue) {
      throw new Error('Key, Label, and Value are required');
    }

    const metricChange = formData.get('metricChange') as string || null;
    const metricIcon = formData.get('metricIcon') as string || 'rocket';
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'on';

    await prisma.indiaAIStats.update({
      where: { id: params.id },
      data: {
        metricKey,
        metricLabel,
        metricValue,
        metricChange,
        metricIcon,
        displayOrder,
        isActive,
        lastUpdated: new Date(),
        updatedAt: new Date(),
      },
    });

    redirect('/india-ai/stats');
  }

  return (
    <div className="p-6">
      <div className="mb-6 font-jakarta">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sora">
          Edit Statistic: {stat.metricLabel}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-jakarta">
          Update the display label, value, key, icon, display order, or active status.
        </p>
      </div>

      <StatForm action={updateStat} initialData={normalizedStat} />
    </div>
  );
}
