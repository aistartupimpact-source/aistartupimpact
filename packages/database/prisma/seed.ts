import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Load the root .env file explicitly so PrismaClient can find DATABASE_URL
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Setup WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

const articles = [
  {
    title: "OpenAI's GPT-5 Launch: What Indian Developers Need to Know",
    excerpt: 'The latest frontier model brings advanced reasoning, multimodal capabilities, and a new pricing tier aimed at startups.',
    content: 'The latest frontier model brings advanced reasoning, multimodal capabilities, and a new pricing tier aimed at startups. India is uniquely positioned to take advantage of this new technology...',
    category: 'AI News',
    authorName: 'Rahul Kumar',
    status: 'PUBLISHED',
    isFeatured: true,
  },
  {
    title: "Ola Krutrim Raises $200M Series B to Build India's Own Foundation Model",
    excerpt: 'Bhavish Aggarwal-led AI startup secures major funding round to compete with global LLM providers.',
    content: 'Bhavish Aggarwal-led AI startup secures major funding round to compete with global LLM providers. The funding will be used to expand the team and build a massive supercomputing cluster.',
    category: 'Funding',
    authorName: 'Anjali Nair',
    status: 'PUBLISHED',
    isFeatured: true,
  },
  {
    title: 'Cursor vs GitHub Copilot vs Cody: The 2025 Developer Survey Results',
    excerpt: 'We surveyed 5,000 developers to find out which AI coding assistant actually improves productivity.',
    content: 'We surveyed 5,000 developers to find out which AI coding assistant actually improves productivity. The results show a clear shift towards AI-first paradigms...',
    category: 'AI News',
    authorName: 'Vikram Patel',
    status: 'PUBLISHED',
    isFeatured: false,
  },
  {
    title: "India's New AI Policy Framework: What Every Founder Must Know",
    excerpt: 'The government releases comprehensive guidelines covering data privacy, model transparency, and startup incentives.',
    content: 'The government releases comprehensive guidelines covering data privacy, model transparency, and startup incentives. Compliance is required for all startups operating within the country...',
    category: 'Policy',
    authorName: 'Priya Sharma',
    status: 'PUBLISHED',
    isFeatured: false,
  },
  {
    title: "Bangalore Overtakes Singapore as Asia's #2 AI Startup Hub",
    excerpt: 'New report from CB Insights ranks Bangalore behind only Beijing in terms of AI startup density and funding.',
    content: 'New report from CB Insights ranks Bangalore behind only Beijing in terms of AI startup density and funding. The ecosystem is fueled by a strong talent pool and robust investment...',
    category: 'Startups',
    authorName: 'Meera Rao',
    status: 'PUBLISHED',
    isFeatured: false,
  },
];

async function main() {
  console.log('Start seeding...');

  // Clear existing to prevent duplicates
  await prisma.article.deleteMany({});
  console.log('Cleared existing articles.');

  // Delete categories to recreate cleanly
  await prisma.category.deleteMany({});

  // Create or find a default author to link articles to
  const defaultAuthor = await prisma.user.upsert({
    where: { email: 'author@aistartupimpact.com' },
    update: {},
    create: {
      name: 'System Author',
      email: 'author@aistartupimpact.com',
      slug: 'system-author',
      role: 'SUPER_ADMIN',
    },
  });

  for (const article of articles) {
    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Upsert the specific Category for this article
    const category = await prisma.category.upsert({
      where: { slug: article.category.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: article.category,
        slug: article.category.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    const dbArticle = await prisma.article.create({
      data: {
        title: article.title,
        slug: slug,
        excerpt: article.excerpt,
        content: [{ type: 'paragraph', content: article.content }],
        categoryId: category.id,
        authorId: defaultAuthor.id,
        status: article.status as any,
        isFeatured: article.isFeatured,
        publishedAt: new Date(),
      },
    });
    console.log(`Created article with id: ${dbArticle.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
