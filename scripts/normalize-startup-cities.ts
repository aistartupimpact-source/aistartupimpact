import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the root .env file explicitly so PrismaClient can find DATABASE_URL
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const cityMapping: Record<string, string> = {
  // Bengaluru
  'bengaluru': 'Bengaluru',
  'bangalore': 'Bengaluru',
  'bengalore': 'Bengaluru',
  'bengaluru,india': 'Bengaluru',
  ' bengaluru,india': 'Bengaluru',
  'bengaluru, karnataka, india (also has a registered address in middletown, delaware, usa)': 'Bengaluru',
  'bengaluru, karnataka': 'Bengaluru',
  'karnataka,india': 'Bengaluru',
  'karnataka': 'Bengaluru',

  // Delhi
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'delhi,india': 'Delhi',
  ' delhi': 'Delhi',
  'delhi-ncr': 'Delhi',
  'new delhi,india': 'Delhi',

  // Mumbai
  'mumbai': 'Mumbai',
  'bombay': 'Mumbai',
  'mumbai,india': 'Mumbai',
  'mumbai ,india': 'Mumbai',
  'maharashtra , india': 'Mumbai',
  'maharashtra,india': 'Mumbai',

  // Gurugram
  'gurugram': 'Gurugram',
  'gurgaon': 'Gurugram',
  'gurugram,india': 'Gurugram',

  // Noida
  'noida': 'Noida',
  ' noida': 'Noida',
  'greater noida': 'Noida',
  'uttar pradesh,india': 'Noida',
  'uttar pradesh': 'Noida',
  'uttar pradesh, india': 'Noida',

  // Hyderabad
  'hyderabad': 'Hyderabad',

  // Pune
  'pune': 'Pune',

  // Chennai
  'chennai': 'Chennai',
  'tamilnadu,india': 'Chennai',
  'tamilnadu': 'Chennai',

  // Kolkata
  'kolkata': 'Kolkata',

  // Ahmedabad
  'ahmedabad': 'Ahmedabad',
  ' ahmedabad': 'Ahmedabad',
  'gujarat,india': 'Ahmedabad',
  'gujrat,india': 'Ahmedabad',
  'gujrat,india ': 'Ahmedabad',

  // Visakhapatnam
  'visakhapatnam': 'Visakhapatnam',

  // Jaipur
  'jaipur': 'Jaipur',

  // Shillong
  'shillong': 'Shillong',

  // Bhavnagar
  'bhavnagar': 'Bhavnagar',

  // Mandi
  'mandi': 'Mandi',

  // Chandigarh
  'chandigarh,india': 'Chandigarh',
  'chandigarh': 'Chandigarh',

  // San Francisco
  ' san francisco': 'San Francisco',
  'san francisco': 'San Francisco',
  'california': 'San Francisco',
  'united  states(usa)': 'San Francisco',

  // Austin
  'austin, tx': 'Austin',
  'austin': 'Austin',

  // Singapore
  'singapore': 'Singapore',

  // Sydney
  'sydney australia ': 'Sydney',
  'sydney': 'Sydney',

  // Kerala
  'kerala,india': 'Kerala',
  'kerala': 'Kerala'
};

async function main() {
  console.log('🤖 Normalizing Startup Headquarters Cities...');

  const startups = await prisma.startup.findMany({
    select: {
      id: true,
      name: true,
      headquartersCity: true,
    }
  });

  console.log(`Found ${startups.length} startups to analyze.`);

  let updatedCount = 0;

  for (const startup of startups) {
    const rawCity = startup.headquartersCity;
    if (!rawCity) continue;

    const cleanedKey = rawCity.trim().toLowerCase();
    const mappedCity = cityMapping[cleanedKey];

    if (mappedCity && mappedCity !== rawCity) {
      console.log(`📍 Updating [${startup.name}]: "${rawCity}" -> "${mappedCity}"`);
      await prisma.startup.update({
        where: { id: startup.id },
        data: { headquartersCity: mappedCity }
      });
      updatedCount++;
    } else if (!mappedCity) {
      // Fallback formatting: Capitalize words
      const words = rawCity.trim().split(/[\s,]+/);
      const formattedCity = words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      
      if (formattedCity !== rawCity) {
        console.log(`✍️ Normalizing casing [${startup.name}]: "${rawCity}" -> "${formattedCity}"`);
        await prisma.startup.update({
          where: { id: startup.id },
          data: { headquartersCity: formattedCity }
        });
        updatedCount++;
      }
    }
  }

  console.log(`\n🎉 Normalized ${updatedCount} startups successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
