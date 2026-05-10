// Final comprehensive seed script for India AI data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Seeding India AI Data ===\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.aIResearcher.deleteMany();
  await prisma.indianAITool.deleteMany();
  await prisma.featuredFounder.deleteMany();
  await prisma.policyUpdate.deleteMany();
  await prisma.governmentScheme.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Seed Government Schemes
  console.log('Seeding Government Schemes...');
  await prisma.governmentScheme.createMany({
    data: [
      {
        id: 'scheme-1',
        name: 'IndiaAI Mission',
        shortName: 'IndiaAI',
        fundingAmount: '₹10,372 Cr',
        eligibility: ['AI startups registered in India', 'Research institutions', 'Computing infrastructure providers', 'AI dataset creators'],
        applicationDeadline: 'Rolling basis',
        status: 'Open',
        applyLink: 'https://indiaai.gov.in',
        description: 'National program to democratize AI computing, innovation, and safe AI deployment',
        benefits: ['Access to AI compute infrastructure', 'Dataset creation grants', 'Application development support', 'Safe & Trusted AI framework'],
        category: 'Central',
        state: null,
        displayOrder: 0,
        isActive: true,
      },
      {
        id: 'scheme-2',
        name: 'Startup India Seed Fund Scheme',
        shortName: 'SISFS',
        fundingAmount: 'Up to ₹50L',
        eligibility: ['DPIIT recognized startups', 'Incorporated < 2 years ago', 'Working on innovative products/services', 'Not received > ₹10L funding'],
        applicationDeadline: 'Rolling basis',
        status: 'Open',
        applyLink: 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/seed-fund-scheme.html',
        description: 'Seed funding to startups for proof of concept, prototype development, product trials, and market entry',
        benefits: ['Seed funding up to ₹20L', 'Validation/prototype: ₹50L', 'Mentorship support', 'No equity dilution'],
        category: 'Central',
        state: null,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'scheme-3',
        name: 'Karnataka AI Policy',
        shortName: 'Karnataka AI',
        fundingAmount: '₹500 Cr fund',
        eligibility: ['AI startups in Karnataka', 'Setting up AI CoEs', 'AI research projects', 'Skilling initiatives'],
        applicationDeadline: 'Rolling basis',
        status: 'Open',
        applyLink: 'https://itbt.karnataka.gov.in',
        description: 'State policy to position Karnataka as India\'s AI hub with dedicated funding and infrastructure',
        benefits: ['Access to AI compute', 'Office space subsidies', 'Talent pool access', 'Regulatory sandbox'],
        category: 'State',
        state: 'Karnataka',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 'scheme-4',
        name: 'Tamil Nadu AI Policy',
        shortName: 'TN AI',
        fundingAmount: '₹1,000 Cr investment',
        eligibility: ['AI startups in Tamil Nadu', 'AI research institutions', 'Manufacturing AI solutions', 'AI for social good'],
        applicationDeadline: 'Rolling basis',
        status: 'Open',
        applyLink: 'https://tnega.tn.gov.in',
        description: 'Comprehensive AI policy to attract ₹1,000 Cr investment and create 20,000 jobs',
        benefits: ['Capital subsidy up to 50%', 'Land at concessional rates', 'Power tariff subsidies', 'Fast-track approvals'],
        category: 'State',
        state: 'Tamil Nadu',
        displayOrder: 3,
        isActive: true,
      },
      {
        id: 'scheme-5',
        name: 'SAMRIDH Scheme',
        shortName: 'SAMRIDH',
        fundingAmount: 'Up to ₹1 Cr',
        eligibility: ['Healthcare tech startups', 'Post-seed stage (raised ₹50L+)', 'Scalable business model', 'Impact on healthcare delivery'],
        applicationDeadline: 'Cohort-based',
        status: 'Open',
        applyLink: 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/samridh.html',
        description: 'Accelerator program for healthcare startups to scale and achieve market access',
        benefits: ['Soft loan up to ₹1 Cr', 'Mentorship from industry experts', 'Market access support', 'Pilot opportunities with hospitals'],
        category: 'Central',
        state: null,
        displayOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✅ Seeded 5 Government Schemes\n');

  // Seed Policy Updates
  console.log('Seeding Policy Updates...');
  await prisma.policyUpdate.createMany({
    data: [
      {
        id: 'policy-1',
        title: 'MeitY Releases Draft AI Ethics Framework for Public Consultation',
        source: 'MeitY',
        date: new Date('2026-05-03'),
        excerpt: 'Ministry of Electronics and IT has released a comprehensive AI ethics framework covering fairness, transparency, accountability, and privacy. Public comments invited until June 15, 2026.',
        link: 'https://meity.gov.in',
        category: 'Policy',
        impact: 'High',
        displayOrder: 0,
        isActive: true,
      },
      {
        id: 'policy-2',
        title: 'NITI Aayog Announces ₹500 Cr AI Research Fund for IITs',
        source: 'NITI Aayog',
        date: new Date('2026-05-01'),
        excerpt: 'National Institution for Transforming India allocates ₹500 crore for AI research across 23 IITs. Focus areas include healthcare AI, agricultural AI, and climate modeling.',
        link: 'https://niti.gov.in',
        category: 'Funding',
        impact: 'High',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'policy-3',
        title: 'Digital Personal Data Protection Act: AI-Specific Guidelines Released',
        source: 'Data Protection Board',
        date: new Date('2026-04-28'),
        excerpt: 'Data Protection Board of India issues guidelines for AI systems processing personal data. Mandates algorithmic transparency and user consent for automated decision-making.',
        link: 'https://dpb.gov.in',
        category: 'Regulation',
        impact: 'High',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 'policy-4',
        title: 'AI Safety Standards Committee Publishes Testing Framework',
        source: 'Bureau of Indian Standards',
        date: new Date('2026-04-25'),
        excerpt: 'Bureau of Indian Standards releases AI safety testing framework covering robustness, security, and bias evaluation. Voluntary compliance for now, mandatory from 2027.',
        link: 'https://bis.gov.in',
        category: 'Standards',
        impact: 'Medium',
        displayOrder: 3,
        isActive: true,
      },
      {
        id: 'policy-5',
        title: 'Supreme Court Ruling: AI-Generated Evidence Admissibility Guidelines',
        source: 'Supreme Court of India',
        date: new Date('2026-04-20'),
        excerpt: 'Landmark judgment establishes criteria for admitting AI-generated evidence in courts. Requires explainability, audit trails, and expert testimony on model reliability.',
        link: '#',
        category: 'Legal',
        impact: 'High',
        displayOrder: 4,
        isActive: true,
      },
      {
        id: 'policy-6',
        title: 'MeitY Launches AI Compute Access Program for Startups',
        source: 'MeitY',
        date: new Date('2026-04-18'),
        excerpt: 'New program provides subsidized access to GPU clusters for AI startups. Applications open for companies with < ₹10 Cr revenue. Up to 1000 GPU hours per quarter.',
        link: 'https://meity.gov.in',
        category: 'Policy',
        impact: 'High',
        displayOrder: 5,
        isActive: true,
      },
    ],
  });
  console.log('✅ Seeded 6 Policy Updates\n');

  // Seed AI Researchers
  console.log('Seeding AI Researchers...');
  await prisma.aIResearcher.createMany({
    data: [
      {
        id: 'researcher-1',
        name: 'Dr. Rajesh Kumar',
        university: 'IIT Delhi',
        position: 'Professor of Computer Science',
        photoUrl: null,
        bio: 'Leading researcher in Natural Language Processing and Computer Vision with 15+ years of experience. Pioneer in developing transformer models for Indian languages.',
        researchAreas: ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'Multilingual AI'],
        notablePapers: ['Transformer Models for Indian Languages (2024)', 'Vision Systems for Agricultural AI (2023)', 'Low-Resource Language Processing (2022)'],
        linkedinUrl: 'https://linkedin.com/in/rajeshkumar',
        googleScholarUrl: 'https://scholar.google.com/rajeshkumar',
        citations: 5000,
        hIndex: 45,
        displayOrder: 0,
        isActive: true,
      },
      {
        id: 'researcher-2',
        name: 'Dr. Priya Sharma',
        university: 'IIT Bombay',
        position: 'Associate Professor',
        photoUrl: null,
        bio: 'Expert in Machine Learning and AI Ethics, focusing on responsible AI development and fairness in algorithmic systems. Advisor to multiple AI startups.',
        researchAreas: ['Machine Learning', 'AI Ethics', 'Fairness in AI', 'Explainable AI'],
        notablePapers: ['Bias Detection in ML Models (2025)', 'Ethical AI Framework for India (2024)', 'Fairness Metrics for Classification (2023)'],
        linkedinUrl: 'https://linkedin.com/in/priyasharma',
        googleScholarUrl: 'https://scholar.google.com/priyasharma',
        citations: 3500,
        hIndex: 38,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'researcher-3',
        name: 'Dr. Amit Patel',
        university: 'IISc Bangalore',
        position: 'Professor',
        photoUrl: null,
        bio: 'Pioneering work in Reinforcement Learning and Robotics applications. Leading the AI for Manufacturing initiative at IISc.',
        researchAreas: ['Reinforcement Learning', 'Robotics', 'Autonomous Systems', 'Industrial AI'],
        notablePapers: ['RL for Industrial Automation (2025)', 'Multi-Agent Systems in Manufacturing (2024)', 'Safe Reinforcement Learning (2023)'],
        linkedinUrl: 'https://linkedin.com/in/amitpatel',
        googleScholarUrl: 'https://scholar.google.com/amitpatel',
        citations: 4200,
        hIndex: 42,
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 'researcher-4',
        name: 'Dr. Meera Reddy',
        university: 'IIT Madras',
        position: 'Assistant Professor',
        photoUrl: null,
        bio: 'Specializing in Healthcare AI and Medical Imaging. Developed AI systems for early disease detection deployed in 50+ hospitals across India.',
        researchAreas: ['Healthcare AI', 'Medical Imaging', 'Deep Learning', 'Computer Vision'],
        notablePapers: ['AI for Diabetic Retinopathy Detection (2025)', 'Chest X-Ray Analysis using CNNs (2024)', 'Federated Learning in Healthcare (2023)'],
        linkedinUrl: 'https://linkedin.com/in/meerareddy',
        googleScholarUrl: 'https://scholar.google.com/meerareddy',
        citations: 2800,
        hIndex: 32,
        displayOrder: 3,
        isActive: true,
      },
      {
        id: 'researcher-5',
        name: 'Dr. Arjun Verma',
        university: 'IIT Kharagpur',
        position: 'Professor',
        photoUrl: null,
        bio: 'Expert in Speech Recognition and Audio Processing for Indian languages. Co-founder of two successful AI startups.',
        researchAreas: ['Speech Recognition', 'Audio Processing', 'Signal Processing', 'Acoustic Modeling'],
        notablePapers: ['Speech Recognition for Indian Languages (2024)', 'Low-Latency ASR Systems (2023)', 'Noise-Robust Speech Processing (2022)'],
        linkedinUrl: 'https://linkedin.com/in/arjunverma',
        googleScholarUrl: 'https://scholar.google.com/arjunverma',
        citations: 3200,
        hIndex: 36,
        displayOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✅ Seeded 5 AI Researchers\n');

  // Seed Indian AI Tools
  console.log('Seeding Indian AI Tools...');
  await prisma.indianAITool.createMany({
    data: [
      {
        id: 'tool-1',
        name: 'Sarvam AI',
        slug: 'sarvam-ai',
        tagline: 'India\'s first full-stack AI platform',
        description: 'Building foundation models and AI infrastructure specifically designed for Indian languages and use cases. Offers multilingual LLMs, speech-to-text, and text-to-speech capabilities.',
        logoUrl: null,
        websiteUrl: 'https://sarvam.ai',
        category: 'LLM/Foundation Models',
        foundedYear: 2023,
        fundingStatus: 'Series A',
        totalFunding: '$41M',
        headquarters: 'Bangalore, Karnataka',
        teamSize: '50-100',
        features: ['Multilingual LLM (10+ Indian languages)', 'Speech-to-text API', 'Text-to-speech synthesis', 'Real-time translation', 'Custom model fine-tuning'],
        useCases: ['Customer support automation', 'Content creation in regional languages', 'Voice assistants for Indian markets', 'Government service digitization'],
        isFeatured: true,
        displayOrder: 0,
        isActive: true,
      },
      {
        id: 'tool-2',
        name: 'Krutrim AI',
        slug: 'krutrim-ai',
        tagline: 'India\'s own AI',
        description: 'Building AI models trained on Indian data for Indian languages and cultural contexts. First Indian AI unicorn focused on indigenous AI development.',
        logoUrl: null,
        websiteUrl: 'https://krutrim.ai',
        category: 'LLM/Foundation Models',
        foundedYear: 2023,
        fundingStatus: 'Seed',
        totalFunding: '$50M',
        headquarters: 'Bangalore, Karnataka',
        teamSize: '100-200',
        features: ['Indic language support (20+ languages)', 'Cultural context understanding', 'Local data training', 'API access', 'Enterprise solutions'],
        useCases: ['Education technology', 'Healthcare diagnostics', 'Government services', 'Financial services'],
        isFeatured: true,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'tool-3',
        name: 'Yellow.ai',
        slug: 'yellow-ai',
        tagline: 'Enterprise conversational AI platform',
        description: 'AI-powered customer service automation platform serving 1000+ enterprises globally. Specializes in omnichannel customer engagement.',
        logoUrl: null,
        websiteUrl: 'https://yellow.ai',
        category: 'Conversational AI',
        foundedYear: 2016,
        fundingStatus: 'Series C',
        totalFunding: '$102M',
        headquarters: 'Bangalore, Karnataka',
        teamSize: '500+',
        features: ['Omnichannel support (chat, voice, email)', 'Voice bots with NLU', 'Chat automation', 'Analytics dashboard', 'CRM integrations', '100+ language support'],
        useCases: ['Customer support automation', 'Sales automation', 'HR automation', 'IT helpdesk'],
        isFeatured: false,
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 'tool-4',
        name: 'Haptik',
        slug: 'haptik',
        tagline: 'Conversational AI for enterprises',
        description: 'Leading conversational AI platform acquired by Reliance Jio. Powers customer engagement for major Indian brands.',
        logoUrl: null,
        websiteUrl: 'https://haptik.ai',
        category: 'Conversational AI',
        foundedYear: 2013,
        fundingStatus: 'Acquired',
        totalFunding: '$100M+',
        headquarters: 'Mumbai, Maharashtra',
        teamSize: '300+',
        features: ['Intelligent virtual assistants', 'WhatsApp Business API', 'Voice AI', 'Analytics & insights', 'Multi-language support'],
        useCases: ['E-commerce customer support', 'Banking & finance', 'Travel & hospitality', 'Retail automation'],
        isFeatured: false,
        displayOrder: 3,
        isActive: true,
      },
      {
        id: 'tool-5',
        name: 'Niramai',
        slug: 'niramai',
        tagline: 'AI for breast cancer screening',
        description: 'Revolutionary AI-powered breast cancer screening solution using thermal imaging. Non-invasive, radiation-free, and affordable.',
        logoUrl: null,
        websiteUrl: 'https://niramai.com',
        category: 'Healthcare AI',
        foundedYear: 2016,
        fundingStatus: 'Series A',
        totalFunding: '$10M',
        headquarters: 'Bangalore, Karnataka',
        teamSize: '50-100',
        features: ['Thermal imaging analysis', 'AI-powered diagnosis', 'Cloud-based reporting', 'Mobile screening units', 'Privacy-preserving'],
        useCases: ['Early breast cancer detection', 'Rural healthcare screening', 'Corporate health programs', 'Hospital integration'],
        isFeatured: true,
        displayOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✅ Seeded 5 Indian AI Tools\n');

  // Seed Featured Founders
  console.log('Seeding Featured Founders...');
  await prisma.featuredFounder.createMany({
    data: [
      {
        id: 'founder-1',
        name: 'Vivek Raghavan',
        startupName: 'Sarvam AI',
        startupSlug: 'sarvam-ai',
        photoUrl: null,
        bio: 'Former VP of Engineering at Flipkart, now building India\'s first full-stack AI platform. IIT Madras alumnus with 15+ years in tech.',
        achievement: 'Raised $41M Series A to build foundation models for Indian languages. Previously led AI initiatives at Flipkart serving 300M+ users.',
        fundingRaised: '$41M',
        category: 'Rising Star',
        linkedinUrl: 'https://linkedin.com/in/vivekraghavan',
        twitterUrl: 'https://twitter.com/vivekraghavan',
        storyUrl: null,
        displayOrder: 0,
        isActive: true,
      },
      {
        id: 'founder-2',
        name: 'Bhavish Aggarwal',
        startupName: 'Krutrim AI',
        startupSlug: 'krutrim-ai',
        photoUrl: null,
        bio: 'Founder of Ola Cabs, now building India\'s own AI. IIT Bombay alumnus and one of India\'s most successful entrepreneurs.',
        achievement: 'Launched India\'s first indigenous AI model with $50M funding. Built Ola into a $6B+ company before pivoting to AI.',
        fundingRaised: '$50M',
        category: 'Hall of Fame',
        linkedinUrl: 'https://linkedin.com/in/bhavishaggarwal',
        twitterUrl: 'https://twitter.com/bhash',
        storyUrl: null,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'founder-3',
        name: 'Raghu Ravinutala',
        startupName: 'Yellow.ai',
        startupSlug: 'yellow-ai',
        photoUrl: null,
        bio: 'Serial entrepreneur and AI visionary. Previously co-founded multiple successful startups. Stanford alumnus.',
        achievement: 'Scaled Yellow.ai to $102M in funding and 500+ employees. Serving 1000+ enterprise customers globally including Domino\'s, Sephora, and Hyundai.',
        fundingRaised: '$102M',
        category: 'Featured',
        linkedinUrl: 'https://linkedin.com/in/raghuravinutala',
        twitterUrl: 'https://twitter.com/raghur',
        storyUrl: null,
        displayOrder: 2,
        isActive: true,
      },
      {
        id: 'founder-4',
        name: 'Aakrit Vaish',
        startupName: 'Haptik',
        startupSlug: 'haptik',
        photoUrl: null,
        bio: 'Co-founder of Haptik, acquired by Reliance Jio. IIT Roorkee alumnus. Forbes 30 Under 30 Asia.',
        achievement: 'Built Haptik from scratch to acquisition by Reliance Jio for $100M+. Now leading conversational AI for Jio\'s 400M+ users.',
        fundingRaised: '$100M+',
        category: 'Hall of Fame',
        linkedinUrl: 'https://linkedin.com/in/aakritvaish',
        twitterUrl: 'https://twitter.com/aakritvaish',
        storyUrl: null,
        displayOrder: 3,
        isActive: true,
      },
      {
        id: 'founder-5',
        name: 'Geetha Manjunath',
        startupName: 'Niramai',
        startupSlug: 'niramai',
        photoUrl: null,
        bio: 'PhD from IISc Bangalore. Former scientist at Xerox Research. Pioneer in AI for healthcare in India.',
        achievement: 'Developed AI-powered breast cancer screening solution deployed in 100+ centers. Raised $10M to make cancer screening accessible and affordable.',
        fundingRaised: '$10M',
        category: 'Rising Star',
        linkedinUrl: 'https://linkedin.com/in/geethamanjunath',
        twitterUrl: 'https://twitter.com/geethamanjunath',
        storyUrl: null,
        displayOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✅ Seeded 5 Featured Founders\n');

  // Verify counts
  console.log('=== Verification ===\n');
  const counts = await Promise.all([
    prisma.governmentScheme.count(),
    prisma.policyUpdate.count(),
    prisma.aIResearcher.count(),
    prisma.indianAITool.count(),
    prisma.featuredFounder.count(),
  ]);

  console.log(`✅ GovernmentScheme: ${counts[0]} records`);
  console.log(`✅ PolicyUpdate: ${counts[1]} records`);
  console.log(`✅ AIResearcher: ${counts[2]} records`);
  console.log(`✅ IndianAITool: ${counts[3]} records`);
  console.log(`✅ FeaturedFounder: ${counts[4]} records`);
  
  console.log('\n🎉 All India AI data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
