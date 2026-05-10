import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding India AI data...');

  // Seed Government Schemes
  console.log('📋 Creating Government Schemes...');
  
  const schemes = [
    {
      id: '1',
      name: 'IndiaAI Mission',
      shortName: 'IndiaAI',
      fundingAmount: '₹10,372 Cr',
      eligibility: [
        'AI startups registered in India',
        'Research institutions',
        'Computing infrastructure providers',
        'AI dataset creators'
      ],
      applicationDeadline: 'Rolling basis',
      status: 'Open',
      applyLink: 'https://indiaai.gov.in',
      description: 'National program to democratize AI computing, innovation, and safe AI deployment',
      benefits: [
        'Access to AI compute infrastructure',
        'Dataset creation grants',
        'Application development support',
        'Safe & Trusted AI framework'
      ],
      category: 'Central',
      displayOrder: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'Startup India Seed Fund Scheme',
      shortName: 'SISFS',
      fundingAmount: 'Up to ₹50L',
      eligibility: [
        'DPIIT recognized startups',
        'Incorporated < 2 years ago',
        'Working on innovative products/services',
        'Not received > ₹10L funding'
      ],
      applicationDeadline: 'Rolling basis',
      status: 'Open',
      applyLink: 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/seed-fund-scheme.html',
      description: 'Seed funding to startups for proof of concept, prototype development, product trials, and market entry',
      benefits: [
        'Seed funding up to ₹20L',
        'Validation/prototype: ₹50L',
        'Mentorship support',
        'No equity dilution'
      ],
      category: 'Central',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: '3',
      name: 'SAMRIDH Scheme',
      shortName: 'SAMRIDH',
      fundingAmount: 'Up to ₹1 Cr',
      eligibility: [
        'Healthcare tech startups',
        'Post-seed stage (raised ₹50L+)',
        'Scalable business model',
        'Impact on healthcare delivery'
      ],
      applicationDeadline: 'Cohort-based',
      status: 'Open',
      applyLink: 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/samridh.html',
      description: 'Accelerator program for healthcare startups to scale and achieve market access',
      benefits: [
        'Soft loan up to ₹1 Cr',
        'Mentorship from industry experts',
        'Market access support',
        'Pilot opportunities with hospitals'
      ],
      category: 'Central',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: '4',
      name: 'Karnataka AI Policy',
      shortName: 'Karnataka AI',
      fundingAmount: '₹500 Cr fund',
      eligibility: [
        'AI startups in Karnataka',
        'Setting up AI CoEs',
        'AI research projects',
        'Skilling initiatives'
      ],
      applicationDeadline: 'Rolling basis',
      status: 'Open',
      applyLink: 'https://itbt.karnataka.gov.in',
      description: 'State policy to position Karnataka as India\'s AI hub with dedicated funding and infrastructure',
      benefits: [
        'Access to AI compute',
        'Office space subsidies',
        'Talent pool access',
        'Regulatory sandbox'
      ],
      category: 'State',
      state: 'Karnataka',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: '5',
      name: 'Tamil Nadu AI Policy',
      shortName: 'TN AI',
      fundingAmount: '₹1,000 Cr investment',
      eligibility: [
        'AI startups in Tamil Nadu',
        'AI research institutions',
        'Manufacturing AI solutions',
        'AI for social good'
      ],
      applicationDeadline: 'Rolling basis',
      status: 'Open',
      applyLink: 'https://tnega.tn.gov.in',
      description: 'Comprehensive AI policy to attract ₹1,000 Cr investment and create 20,000 jobs',
      benefits: [
        'Capital subsidy up to 50%',
        'Land at concessional rates',
        'Power tariff subsidies',
        'Fast-track approvals'
      ],
      category: 'State',
      state: 'Tamil Nadu',
      displayOrder: 4,
      isActive: true,
    },
  ];

  for (const scheme of schemes) {
    await prisma.governmentScheme.upsert({
      where: { id: scheme.id },
      update: { ...scheme, updatedAt: new Date() },
      create: { ...scheme, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${schemes.length} government schemes`);

  // Seed Policy Updates
  console.log('📰 Creating Policy Updates...');

  const policyUpdates = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
      title: 'Digital Personal Data Protection Act: AI-Specific Guidelines Released',
      source: 'Data Protection',
      date: new Date('2026-04-28'),
      excerpt: 'Data Protection Board of India issues guidelines for AI systems processing personal data. Mandates algorithmic transparency and user consent for automated decision-making.',
      link: 'https://dpb.gov.in',
      category: 'Regulation',
      impact: 'High',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: '4',
      title: 'AI Safety Standards Committee Publishes Testing Framework',
      source: 'AI Safety',
      date: new Date('2026-04-25'),
      excerpt: 'Bureau of Indian Standards releases AI safety testing framework covering robustness, security, and bias evaluation. Voluntary compliance for now, mandatory from 2027.',
      link: 'https://bis.gov.in',
      category: 'Standards',
      impact: 'Medium',
      displayOrder: 3,
      isActive: true,
    },
    {
      id: '5',
      title: 'Supreme Court Ruling: AI-Generated Evidence Admissibility Guidelines',
      source: 'Court',
      date: new Date('2026-04-20'),
      excerpt: 'Landmark judgment establishes criteria for admitting AI-generated evidence in courts. Requires explainability, audit trails, and expert testimony on model reliability.',
      link: '#',
      category: 'Legal',
      impact: 'High',
      displayOrder: 4,
      isActive: true,
    },
    {
      id: '6',
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
  ];

  for (const update of policyUpdates) {
    await prisma.policyUpdate.upsert({
      where: { id: update.id },
      update: { ...update, updatedAt: new Date() },
      create: { ...update, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${policyUpdates.length} policy updates`);

  // Seed AI Researchers
  console.log('🎓 Creating AI Researchers...');

  const researchers = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      university: 'IIT Delhi',
      position: 'Professor',
      photoUrl: null,
      bio: 'Leading researcher in Natural Language Processing and Computer Vision with 15+ years of experience',
      researchAreas: ['NLP', 'Computer Vision', 'Deep Learning'],
      notablePapers: [
        'Transformer Models for Indian Languages',
        'Vision Systems for Agricultural AI'
      ],
      linkedinUrl: 'https://linkedin.com',
      googleScholarUrl: 'https://scholar.google.com',
      citations: 5000,
      hIndex: 45,
      displayOrder: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      university: 'IIT Bombay',
      position: 'Associate Professor',
      photoUrl: null,
      bio: 'Expert in Machine Learning and AI Ethics, focusing on responsible AI development',
      researchAreas: ['Machine Learning', 'AI Ethics', 'Fairness in AI'],
      notablePapers: [
        'Bias Detection in ML Models',
        'Ethical AI Framework for India'
      ],
      linkedinUrl: 'https://linkedin.com',
      googleScholarUrl: 'https://scholar.google.com',
      citations: 3500,
      hIndex: 38,
      displayOrder: 1,
      isActive: true,
    },
    {
      id: '3',
      name: 'Dr. Amit Patel',
      university: 'IISc Bangalore',
      position: 'Professor',
      photoUrl: null,
      bio: 'Pioneering work in Reinforcement Learning and Robotics applications',
      researchAreas: ['Reinforcement Learning', 'Robotics', 'Autonomous Systems'],
      notablePapers: [
        'RL for Industrial Automation',
        'Multi-Agent Systems in Manufacturing'
      ],
      linkedinUrl: 'https://linkedin.com',
      googleScholarUrl: 'https://scholar.google.com',
      citations: 4200,
      hIndex: 42,
      displayOrder: 2,
      isActive: true,
    },
  ];

  for (const researcher of researchers) {
    await prisma.aIResearcher.upsert({
      where: { id: researcher.id },
      update: { ...researcher, updatedAt: new Date() },
      create: { ...researcher, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${researchers.length} AI researchers`);

  // Seed Indian AI Tools
  console.log('🔧 Creating Indian AI Tools...');

  const tools = [
    {
      id: '1',
      name: 'Sarvam AI',
      slug: 'sarvam-ai',
      tagline: 'India\'s first full-stack AI platform',
      description: 'Building foundation models and AI infrastructure for Indian languages and use cases',
      logoUrl: null,
      websiteUrl: 'https://sarvam.ai',
      category: 'LLM/Foundation Models',
      foundedYear: 2023,
      fundingStatus: 'Series A',
      totalFunding: '$41M',
      headquarters: 'Bangalore',
      teamSize: '50-100',
      features: [
        'Multilingual LLM',
        'Speech-to-text',
        'Text-to-speech',
        'Translation'
      ],
      useCases: [
        'Customer support',
        'Content creation',
        'Voice assistants'
      ],
      isFeatured: true,
      displayOrder: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'Krutrim AI',
      slug: 'krutrim-ai',
      tagline: 'India\'s own AI',
      description: 'Building AI models trained on Indian data for Indian languages and contexts',
      logoUrl: null,
      websiteUrl: 'https://krutrim.ai',
      category: 'LLM/Foundation Models',
      foundedYear: 2023,
      fundingStatus: 'Seed',
      totalFunding: '$50M',
      headquarters: 'Bangalore',
      teamSize: '100-200',
      features: [
        'Indic language support',
        'Cultural context understanding',
        'Local data training'
      ],
      useCases: [
        'Education',
        'Healthcare',
        'Government services'
      ],
      isFeatured: true,
      displayOrder: 1,
      isActive: true,
    },
    {
      id: '3',
      name: 'Yellow.ai',
      slug: 'yellow-ai',
      tagline: 'Enterprise conversational AI platform',
      description: 'AI-powered customer service automation for enterprises',
      logoUrl: null,
      websiteUrl: 'https://yellow.ai',
      category: 'Conversational AI',
      foundedYear: 2016,
      fundingStatus: 'Series C',
      totalFunding: '$102M',
      headquarters: 'Bangalore',
      teamSize: '500+',
      features: [
        'Omnichannel support',
        'Voice bots',
        'Chat automation',
        'Analytics'
      ],
      useCases: [
        'Customer support',
        'Sales automation',
        'HR automation'
      ],
      isFeatured: false,
      displayOrder: 2,
      isActive: true,
    },
  ];

  for (const tool of tools) {
    await prisma.indianAITool.upsert({
      where: { id: tool.id },
      update: { ...tool, updatedAt: new Date() },
      create: { ...tool, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${tools.length} Indian AI tools`);

  // Seed Featured Founders
  console.log('⭐ Creating Featured Founders...');

  const founders = [
    {
      id: '1',
      name: 'Vivek Raghavan',
      startupName: 'Sarvam AI',
      startupSlug: null,
      photoUrl: null,
      bio: 'Former VP at Flipkart, building India\'s first full-stack AI platform',
      achievement: 'Raised $41M to build foundation models for Indian languages',
      fundingRaised: '$41M',
      category: 'Rising Star',
      linkedinUrl: 'https://linkedin.com',
      twitterUrl: 'https://twitter.com',
      storyUrl: null,
      displayOrder: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'Bhavish Aggarwal',
      startupName: 'Krutrim AI',
      startupSlug: null,
      photoUrl: null,
      bio: 'Founder of Ola, now building India\'s own AI',
      achievement: 'Launched India\'s first indigenous AI model with $50M funding',
      fundingRaised: '$50M',
      category: 'Hall of Fame',
      linkedinUrl: 'https://linkedin.com',
      twitterUrl: 'https://twitter.com',
      storyUrl: null,
      displayOrder: 1,
      isActive: true,
    },
    {
      id: '3',
      name: 'Raghu Ravinutala',
      startupName: 'Yellow.ai',
      startupSlug: null,
      photoUrl: null,
      bio: 'Serial entrepreneur building enterprise AI solutions',
      achievement: 'Scaled Yellow.ai to $102M in funding and 500+ employees',
      fundingRaised: '$102M',
      category: 'Featured',
      linkedinUrl: 'https://linkedin.com',
      twitterUrl: 'https://twitter.com',
      storyUrl: null,
      displayOrder: 2,
      isActive: true,
    },
  ];

  for (const founder of founders) {
    await prisma.featuredFounder.upsert({
      where: { id: founder.id },
      update: { ...founder, updatedAt: new Date() },
      create: { ...founder, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${founders.length} featured founders`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${schemes.length} Government Schemes`);
  console.log(`   - ${policyUpdates.length} Policy Updates`);
  console.log(`   - ${researchers.length} AI Researchers`);
  console.log(`   - ${tools.length} Indian AI Tools`);
  console.log(`   - ${founders.length} Featured Founders`);
  console.log('\n✅ You can now view the data in the admin panel!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
