import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUserSessions() {
  try {
    console.log('🧹 Cleaning corrupted UserSession records...');
    
    // Delete all existing sessions (they're corrupted)
    const deleted = await prisma.userSession.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} corrupted sessions`);
    
    console.log('✅ UserSession table cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning UserSession table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUserSessions();
