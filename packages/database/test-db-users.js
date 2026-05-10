const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true, createdAt: true }});
  const webUsers = await prisma.webUser.findMany({ select: { email: true, createdAt: true }});
  const founders = await prisma.founderUser.findMany({ select: { email: true, createdAt: true }});
  console.log("USERS (Admin/Authors):", users.length);
  console.log(users);
  console.log("WEB USERS:", webUsers.length);
  console.log(webUsers);
  console.log("FOUNDERS:", founders.length);
  console.log(founders);
}
main().catch(console.error).finally(() => prisma.$disconnect());
