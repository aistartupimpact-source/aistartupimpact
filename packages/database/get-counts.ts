import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const articlesCount = await prisma.article.count();
  const startupsCount = await prisma.startup.count();
  const toolsCount = await prisma.aiTool.count();
  console.log(`Articles: ${articlesCount}, Startups: ${startupsCount}, Tools: ${toolsCount}`);
}
run();
