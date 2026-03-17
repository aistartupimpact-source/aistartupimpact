import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testFundingDigests() {
  try {
    console.log('Testing funding digests query...');
    
    const digests = await sql`
      SELECT 
        id, title, date, status, "dealsCount", "totalRaised", deals, "createdAt"
      FROM "FundingDigest"
      ORDER BY date DESC
    `;
    
    console.log('Found', digests.length, 'funding digests:');
    digests.forEach((digest, i) => {
      console.log(`${i + 1}. ${digest.title}`);
      console.log(`   Status: ${digest.status}`);
      console.log(`   Date: ${digest.date}`);
      console.log(`   Deals: ${digest.dealsCount}`);
      console.log(`   Total: ${digest.totalRaised}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFundingDigests();