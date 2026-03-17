import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

const images = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=80', // AI brain / network
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1600&q=80', // Laptop / Code
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80', // Cyber security
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80', // Circuit board
  'https://images.unsplash.com/photo-1531297172867-11f8102a0a38?w=1600&q=80', // Business tech
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80', // Matrix code
  'https://images.unsplash.com/photo-1555949963-aa79dcee57d5?w=1600&q=80', // Server room
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80', // Startup team
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80', // Data analytics
];

const logos = [
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80', // Abstract 1
  'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&q=80', // Abstract 2
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400&q=80', // Abstract 3
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80', // Abstract 4
];

async function updateMedia() {
  console.log('Fetching articles...');
  const articles = await prisma.article.findMany({
    where: { coverImage: null },
  });

  console.log(`Found ${articles.length} articles lacking covers. Appending...`);

  for (let i = 0; i < articles.length; i++) {
    const img = images[i % images.length];
    await prisma.article.update({
      where: { id: articles[i].id },
      data: { coverImage: img },
    });
  }

  const startups = await prisma.startup.findMany({
    where: { logoUrl: null },
  });

  console.log(`Found ${startups.length} startups lacking logos. Appending...`);
  for (let i = 0; i < startups.length; i++) {
    const logo = logos[i % logos.length];
    await prisma.startup.update({
      where: { id: startups[i].id },
      data: { logoUrl: logo },
    });
  }

  const tools = await prisma.aiTool.findMany({
    where: { logoUrl: null },
  });

  console.log(`Found ${tools.length} AI tools lacking logos. Appending...`);
  for (let i = 0; i < tools.length; i++) {
    const logo = logos[(i + 2) % logos.length]; // offset
    await prisma.aiTool.update({
      where: { id: tools[i].id },
      data: {
        logoUrl: logo,
        screenshotUrls: [images[i % images.length]]
      },
    });
  }

  console.log('Update complete!');
}

updateMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
