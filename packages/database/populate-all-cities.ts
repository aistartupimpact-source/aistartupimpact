import { PrismaClient } from '@prisma/client';
import { CITY_DATABASE } from '../utils/src/cities';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log(`🚀 Loading ${CITY_DATABASE.length} cities from CITY_DATABASE...`);

  let addedCount = 0;
  let skippedCount = 0;
  
  const batchSize = 100;
  for (let i = 0; i < CITY_DATABASE.length; i += batchSize) {
    const batch = CITY_DATABASE.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (c) => {
      const slug = generateSlug(c.city);
      
      const existing = await prisma.indiaAICity.findFirst({
        where: {
          OR: [
            { cityName: c.city },
            { slug: slug }
          ]
        }
      });

      if (!existing) {
        await prisma.indiaAICity.create({
          data: {
            cityName: c.city,
            slug: slug,
            state: c.state || null,
            latitude: c.lat || 0,
            longitude: c.lng || 0,
            isActive: true,
            aliases: c.aliases || [],
            totalStartups: 0,
            totalFunding: BigInt(0),
            topSectors: [],
            keyAccelerators: [],
            notableCompanies: [],
            description: null,
            isFeatured: false,
            displayOrder: 99,
          }
        });
        addedCount++;
      } else {
        const existingAliases = existing.aliases || [];
        const incomingAliases = c.aliases || [];
        const hasAllAliases = incomingAliases.every(a => existingAliases.includes(a));
        
        if (!hasAllAliases || existing.aliases.length === 0) {
          const combinedAliases = Array.from(new Set([...existingAliases, ...incomingAliases]));
          await prisma.indiaAICity.update({
            where: { id: existing.id },
            data: {
              aliases: combinedAliases,
              latitude: existing.latitude && Number(existing.latitude) !== 0 ? existing.latitude : (c.lat || 0),
              longitude: existing.longitude && Number(existing.longitude) !== 0 ? existing.longitude : (c.lng || 0),
            }
          });
        }
        skippedCount++;
      }
    }));
    
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}...`);
  }

  console.log(`\n🎉 Cities population complete:`);
  console.log(`   - Added: ${addedCount} cities`);
  console.log(`   - Skipped/Updated: ${skippedCount} cities`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
