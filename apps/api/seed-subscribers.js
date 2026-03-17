const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'founder@example.com', name: 'Startup Founder', source: 'homepage' },
      { email: 'investor@vc.in', name: 'Angel Investor', source: 'newsletter-page' },
      { email: 'engineer@tech.co', source: 'footer' },
      { email: 'reader123@gmail.com', name: 'Tech Reader', source: 'article', isActive: false },
    ],
    skipDuplicates: true
  });
  console.log('Subscribers injected');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
