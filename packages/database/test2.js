const { PrismaClient } = require('@prisma/client');

const url = "postgresql://neondb_owner:npg_VPma5rRiXJ7I@ep-restless-shadow-a1jxwm0a.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasourceUrl: url,
});

async function main() {
  console.log("Testing native connection without channel_binding...");
  const user = await prisma.user.findFirst();
  console.log("Success! Found:", user?.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
