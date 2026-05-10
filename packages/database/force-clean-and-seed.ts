// Force clean ALL India AI data and reseed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function forceCleanAndSeed() {
  try {
    console.log('=== FORCE CLEANING ALL INDIA AI DATA ===\n');
    
    // Use raw SQL to delete everything
    console.log('Deleting AIResearcher...');
    await prisma.$executeRaw`DELETE FROM "AIResearcher"`;
    
    console.log('Deleting IndianAITool...');
    await prisma.$executeRaw`DELETE FROM "IndianAITool"`;
    
    console.log('Deleting FeaturedFounder...');
    await prisma.$executeRaw`DELETE FROM "FeaturedFounder"`;
    
    console.log('Deleting PolicyUpdate...');
    await prisma.$executeRaw`DELETE FROM "PolicyUpdate"`;
    
    console.log('Deleting GovernmentScheme...');
    await prisma.$executeRaw`DELETE FROM "GovernmentScheme"`;
    
    console.log('✅ All India AI tables cleared\n');
    
    // Verify they're empty
    const counts = await Promise.all([
      prisma.governmentScheme.count(),
      prisma.policyUpdate.count(),
      prisma.aIResearcher.count(),
      prisma.indianAITool.count(),
      prisma.featuredFounder.count(),
    ]);
    
    console.log('Verification after delete:');
    console.log(`GovernmentScheme: ${counts[0]}`);
    console.log(`PolicyUpdate: ${counts[1]}`);
    console.log(`AIResearcher: ${counts[2]}`);
    console.log(`IndianAITool: ${counts[3]}`);
    console.log(`FeaturedFounder: ${counts[4]}\n`);
    
    if (counts.some(c => c > 0)) {
      throw new Error('Tables not empty after delete!');
    }
    
    console.log('=== SEEDING FRESH DATA ===\n');
    
    // Now seed fresh data
    console.log('Seeding Government Schemes...');
    await prisma.governmentScheme.createMany({
      data: [
        {
          id: 'scheme-1',
          name: 'IndiaAI Mission',
          shortName: 'IndiaAI',
          fundingAmount: '₹10,372 Cr',
          eligibility: ['AI startups registered in India', 'Research institutions'],
          applicationDeadline: 'Rolling basis',
          status: 'Open',
          applyLink: 'https://indiaai.gov.in',
          description: 'National program to democratize AI computing',
          benefits: ['Access to AI compute infrastructure', 'Dataset creation grants'],
          category: 'Central',
          displayOrder: 0,
          isActive: true,
        },
        {
          id: 'scheme-2',
          name: 'Startup India Seed Fund Scheme',
          shortName: 'SISFS',
          fundingAmount: 'Up to ₹50L',
          eligibility: ['DPIIT recognized startups', 'Incorporated < 2 years ago'],
          applicationDeadline: 'Rolling basis',
          status: 'Open',
          applyLink: 'https://www.startupindia.gov.in',
          description: 'Seed funding to startups for proof of concept',
          benefits: ['Seed funding up to ₹20L', 'Mentorship support'],
          category: 'Central',
          displayOrder: 1,
          isActive: true,
        },
        {
          id: 'scheme-3',
          name: 'Karnataka AI Policy',
          shortName: 'Karnataka AI',
          fundingAmount: '₹500 Cr fund',
          eligibility: ['AI startups in Karnataka', 'Setting up AI CoEs'],
          applicationDeadline: 'Rolling basis',
          status: 'Open',
          applyLink: 'https://itbt.karnataka.gov.in',
          description: 'State policy to position Karnataka as India\'s AI hub',
          benefits: ['Access to AI compute', 'Office space subsidies'],
          category: 'State',
          state: 'Karnataka',
          displayOrder: 2,
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded 3 Government Schemes');
    
    console.log('Seeding Policy Updates...');
    await prisma.policyUpdate.createMany({
      data: [
        {
          id: 'policy-1',
          title: 'MeitY Releases Draft AI Ethics Framework',
          source: 'MeitY',
          date: new Date('2026-05-03'),
          excerpt: 'Comprehensive AI ethics framework covering fairness and transparency',
          link: 'https://meity.gov.in',
          category: 'Policy',
          impact: 'High',
          displayOrder: 0,
          isActive: true,
        },
        {
          id: 'policy-2',
          title: 'NITI Aayog Announces ₹500 Cr AI Research Fund',
          source: 'NITI Aayog',
          date: new Date('2026-05-01'),
          excerpt: 'AI research fund for IITs focusing on healthcare and agriculture',
          link: 'https://niti.gov.in',
          category: 'Funding',
          impact: 'High',
          displayOrder: 1,
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded 2 Policy Updates');
    
    console.log('Seeding AI Researchers...');
    await prisma.aIResearcher.createMany({
      data: [
        {
          id: 'researcher-1',
          name: 'Dr. Rajesh Kumar',
          university: 'IIT Delhi',
          position: 'Professor',
          bio: 'Leading researcher in NLP and Computer Vision',
          researchAreas: ['NLP', 'Computer Vision', 'Deep Learning'],
          notablePapers: ['Transformer Models for Indian Languages'],
          citations: 5000,
          hIndex: 45,
          displayOrder: 0,
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded 1 AI Researcher');
    
    console.log('Seeding Indian AI Tools...');
    await prisma.indianAITool.createMany({
      data: [
        {
          id: 'tool-1',
          name: 'Sarvam AI',
          slug: 'sarvam-ai',
          tagline: 'India\'s first full-stack AI platform',
          description: 'Building foundation models for Indian languages',
          websiteUrl: 'https://sarvam.ai',
          category: 'LLM/Foundation Models',
          foundedYear: 2023,
          fundingStatus: 'Series A',
          totalFunding: '$41M',
          headquarters: 'Bangalore',
          teamSize: '50-100',
          features: ['Multilingual LLM', 'Speech-to-text'],
          useCases: ['Customer support', 'Content creation'],
          isFeatured: true,
          displayOrder: 0,
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded 1 Indian AI Tool');
    
    console.log('Seeding Featured Founders...');
    await prisma.featuredFounder.createMany({
      data: [
        {
          id: 'founder-1',
          name: 'Vivek Raghavan',
          startupName: 'Sarvam AI',
          startupSlug: 'sarvam-ai',
          bio: 'Former VP at Flipkart, building India\'s first full-stack AI platform',
          achievement: 'Raised $41M Series A for Indian language AI',
          fundingRaised: '$41M',
          category: 'Rising Star',
          displayOrder: 0,
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded 1 Featured Founder');
    
    // Final verification
    const finalCounts = await Promise.all([
      prisma.governmentScheme.count(),
      prisma.policyUpdate.count(),
      prisma.aIResearcher.count(),
      prisma.indianAITool.count(),
      prisma.featuredFounder.count(),
    ]);
    
    console.log('\n=== FINAL VERIFICATION ===');
    console.log(`✅ GovernmentScheme: ${finalCounts[0]} records`);
    console.log(`✅ PolicyUpdate: ${finalCounts[1]} records`);
    console.log(`✅ AIResearcher: ${finalCounts[2]} records`);
    console.log(`✅ IndianAITool: ${finalCounts[3]} records`);
    console.log(`✅ FeaturedFounder: ${finalCounts[4]} records`);
    
    console.log('\n🎉 Force clean and seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

forceCleanAndSeed();
