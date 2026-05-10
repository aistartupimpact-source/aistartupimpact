import { prisma } from '@aistartupimpact/database';
import GovernmentSchemesClient from './GovernmentSchemesClient';

interface Scheme {
  id: string;
  name: string;
  shortName: string;
  fundingAmount: string;
  eligibility: string[];
  applicationDeadline: string;
  status: string;
  applyLink: string;
  description: string;
  benefits: string[];
  category: string;
  state?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default async function GovernmentSchemes() {
  try {
    // Fetch schemes from database
    const schemes = await prisma.governmentScheme.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return <GovernmentSchemesClient schemes={schemes as Scheme[]} />;
  } catch (error) {
    console.error('Error fetching government schemes:', error);
    // Return empty state instead of crashing
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Government schemes data is currently being updated. Please check back soon.
        </p>
      </div>
    );
  }
}
