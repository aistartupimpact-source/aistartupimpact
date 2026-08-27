import { prisma } from '@aistartupimpact/database';
import AITalentResearchHubsClient from './AITalentResearchHubsClient';

export default async function AITalentResearchHubsDB() {
  try {
    const [institutions, headerStats, futureSkillsStats, programmes] = await Promise.all([
      prisma.aIResearchInstitution.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.aITalentStats.findMany({
        where: { isActive: true, section: 'header' },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.aITalentStats.findMany({
        where: { isActive: true, section: 'futureskills' },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.aITalentProgramme.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    const lastUpdated = institutions.length > 0
      ? new Date(Math.max(...institutions.map(i => i.updatedAt.getTime()))).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : undefined;

    return (
      <AITalentResearchHubsClient
        institutions={institutions as any[]}
        headerStats={headerStats}
        futureSkillsStats={futureSkillsStats}
        programmes={programmes}
        lastUpdated={lastUpdated}
      />
    );
  } catch (error) {
    console.error('Error fetching research hubs:', error);
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Research hubs data is currently being updated. Please check back soon.
        </p>
      </div>
    );
  }
}
