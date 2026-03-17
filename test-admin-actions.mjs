import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

// Simulate the admin action
async function getFundingDigestsAction() {
  try {
    const digests = await sql`
      SELECT 
        id, title, date, status, "dealsCount", "totalRaised", deals, "createdAt"
      FROM "FundingDigest"
      ORDER BY date DESC
    `;
    return digests;
  } catch (error) {
    console.error('Error fetching funding digests:', error);
    return [];
  }
}

async function testAdminAction() {
  console.log('Testing admin action...');
  
  const data = await getFundingDigestsAction();
  console.log('Admin action returned:', data.length, 'digests');
  
  console.log('Raw data sample:', data[0]);
  console.log('Date type:', typeof data[0]?.date);
  console.log('Date value:', data[0]?.date);
  
  const processed = data.map((d) => ({
    ...d,
    date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : (typeof d.date === 'string' ? d.date.split('T')[0] : d.date),
    deals: typeof d.deals === 'string' ? JSON.parse(d.deals) : d.deals || [],
  }));
  
  console.log('Processed data:');
  processed.forEach((d, i) => {
    console.log(`${i + 1}. ${d.title} (${d.status}) - ${d.date}`);
  });
}

testAdminAction();