import { prisma } from '@aistartupimpact/database';
import PolicyLiveFeedClient from './PolicyLiveFeedClient';

interface PolicyUpdate {
  id: string;
  title: string;
  source: string;
  date: Date;
  excerpt: string;
  link: string;
  category: string;
  impact: string;
  displayOrder: number;
  isActive: boolean;
}

export default async function PolicyLiveFeed() {
  try {
    // Fetch policy updates from database
    const policyUpdates = await prisma.policyUpdate.findMany({
      where: { isActive: true },
      orderBy: [
        { date: 'desc' },
        { displayOrder: 'asc' },
      ],
      take: 20,
    });

    return <PolicyLiveFeedClient policyUpdates={policyUpdates as PolicyUpdate[]} />;
  } catch (error) {
    console.error('Error fetching policy updates:', error);
    // Return empty state instead of crashing
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Policy updates are currently being refreshed. Please check back soon.
        </p>
      </div>
    );
  }
}
