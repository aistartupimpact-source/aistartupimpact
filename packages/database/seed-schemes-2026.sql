-- Seed: India AI Government Schemes & State Policies (27 Aug 2026)
-- Clears existing schemes and inserts all 15 (5 Central + 10 State)

DELETE FROM "GovernmentScheme";

-- =============================================
-- CENTRAL GOVERNMENT SCHEMES (5)
-- =============================================

INSERT INTO "GovernmentScheme" (
  id, name, "shortName", "fundingAmount", eligibility, "applicationDeadline",
  status, "applyLink", description, benefits, category, state,
  "displayOrder", "isActive", "createdAt", "updatedAt"
) VALUES

-- 1. IndiaAI Mission
(
  'scheme_central_indiaai_mission',
  'IndiaAI Mission',
  'IndiaAI Mission',
  '₹10,372 Cr',
  ARRAY[
    'AI startups registered in India (DPIIT-recognized preferred)',
    'Research institutions and academic faculties with AI/ML focus',
    'MSMEs with annual revenue ≥ ₹50L or funding ≥ ₹1 Cr',
    'Researchers: h-index ≥ 5, or 150+ citations, or publications in AI/ML journals (IF > 2.5)',
    'Government entities with authorized officer nomination',
    'GPU access subsidized at ₹65/hour (up to 40% subsidy)'
  ],
  'Rolling basis',
  'Open',
  'https://indiaai.gov.in/',
  'National program to democratize AI computing, innovation, and safe AI deployment across seven pillars',
  ARRAY[
    'Compute: 38,000+ GPUs via 15 empaneled providers at subsidized rates',
    'Innovation Center: Indigenous foundation models — 20 proposals selected',
    'AIKosh Datasets: 3,000+ datasets, 243 AI models across 20 sectors',
    'Application Dev: 30+ AI applications approved for healthcare, agriculture, governance',
    'FutureSkills: 686 fellowships across UG/PG/PhD in 178 institutions; 27 Data & AI Labs',
    'Startup Financing: Deep-tech AI startup funding from idea to commercialization',
    'Safe & Trusted AI: 13 projects on bias mitigation, privacy-preserving ML, auditing'
  ],
  'Central',
  NULL,
  1, true, NOW(), NOW()
),

-- 2. Startup India Seed Fund Scheme (SISFS)
(
  'scheme_central_sisfs',
  'Startup India Seed Fund Scheme (SISFS)',
  'SISFS',
  'Up to ₹50 Lakh',
  ARRAY[
    'DPIIT-recognized startup, incorporated not more than 2 years ago',
    'Business idea with market fit, viable commercialization, and scope of scaling',
    'Using technology in core product/service, business model, or distribution',
    'Should not have received more than ₹10 Lakh monetary support from other govt schemes',
    'Indian promoters hold ≥ 51% shareholding',
    'Can apply to 3 incubators simultaneously; no mandatory physical incubation'
  ],
  '31 May 2026 (final)',
  'Open',
  'https://www.startupindia.gov.in/content/sih/en/startup-scheme/seed-fund-scheme.html',
  'Seed funding for proof of concept, prototype development, product trials, and market entry',
  ARRAY[
    'Grants up to ₹20L for PoC/prototype',
    'Convertible debentures/debt up to ₹50L for market entry and scaling',
    'Sector-agnostic funding',
    'Disbursed via 300+ incubators; selection within 45 days'
  ],
  'Central',
  NULL,
  2, true, NOW(), NOW()
),

-- 3. NIDHI-PRAYAS 2.0
(
  'scheme_central_nidhi_prayas',
  'NIDHI-PRAYAS 2.0',
  'NIDHI-PRAYAS 2.0',
  'Up to ₹40 Lakh',
  ARRAY[
    'Individual innovators or startups incorporated in India ≤ 5 years',
    'Annual turnover not exceeding ₹1 Cr since incorporation',
    '51%+ equity held by Indian citizens',
    'Cumulative prior govt grant funding must not exceed ₹40 Lakh',
    'Founder must be 18+ with Indian citizenship proof',
    'Clear IP ownership; ideas with commercialization potential'
  ],
  'Rolling basis',
  'Open',
  'https://nidhi-prayas.org/innovators/',
  'Prototype development grant for young innovators and early-stage startups to convert ideas into working physical prototypes',
  ARRAY[
    'Grant up to ₹40 Lakh (standard limit ₹20 Lakh)',
    'Apply through any PRAYAS Centre (PC) or Advance PRAYAS Centre (APC)',
    'Grant disbursed in milestone-based installments',
    'Age 18+ eligible'
  ],
  'Central',
  NULL,
  3, true, NOW(), NOW()
),

-- 4. SAMRIDH Scheme
(
  'scheme_central_samridh',
  'SAMRIDH Scheme',
  'SAMRIDH',
  'Up to ₹1 Cr',
  ARRAY[
    'Healthcare tech startups (diagnostics, digital health, medical devices, SaMD, elderly/chronic care)',
    'Climate-tech startups (EV, clean energy, climate-smart agriculture, resilient infrastructure)',
    'Technology Readiness Level (TRL) 4+ with early evidence of real-world impact',
    'Indian-registered private limited company with 51%+ Indian shareholders',
    'For MeitY accelerator: product-oriented deep-tech/software startups (not services)',
    'Must have IP or potential for IP generation; willing to share equity'
  ],
  'Cohort-based',
  'Open',
  'https://www.samridhimpact.com/apply-for-funding-new/',
  'Accelerator program for IT/deep-tech and healthcare startups to scale and achieve market access',
  ARRAY[
    'MeitY SAMRIDH: accelerator matching investment up to ₹40L per startup via partner accelerators',
    'SAMRIDH Impact Accelerator: up to ₹1 Cr as grant, debt, or equity for healthtech/climate-tech',
    'Rolling applications for Impact Accelerator',
    'Target ~300 startups'
  ],
  'Central',
  NULL,
  4, true, NOW(), NOW()
),

-- 5. Fund of Funds for Startups (FFS / FoF 2.0)
(
  'scheme_central_ffs_fof',
  'Fund of Funds for Startups (FFS / FoF 2.0)',
  'FFS / FoF 2.0',
  '₹20,000 Cr (combined)',
  ARRAY[
    'DPIIT-recognized startups seeking growth-stage venture capital',
    'Startups indirectly funded — must pitch to SEBI-registered AIFs that have received FFS commitment',
    'FoF 2.0 deepens domestic VC pool for growth-stage and AI/deep-tech ventures',
    'Investment amount varies by AIF; equity-based investment'
  ],
  'Rolling basis',
  'Open',
  'https://www.startupindia.gov.in/content/sih/en/fund-of-funds.html',
  'Fund-of-funds corpus investing in SEBI-registered AIFs which in turn invest in growth-stage startups including AI ventures',
  ARRAY[
    'FFS corpus: ₹10,000 Cr',
    'FoF 2.0 corpus: ₹10,000 Cr',
    'Indirect investment via SEBI-registered AIFs managed by SIDBI',
    'Growth/scaling stage equity-based investment'
  ],
  'Central',
  NULL,
  5, true, NOW(), NOW()
),

-- =============================================
-- STATE-WISE AI POLICIES & MISSIONS (10)
-- =============================================

-- 6. Karnataka AI Policy
(
  'scheme_state_karnataka',
  'Karnataka AI Policy (IT Policy 2025–2030)',
  'Karnataka AI Policy',
  '₹500 Cr fund',
  ARRAY[
    'AI startups based in or relocating to Karnataka',
    'Entities setting up AI Centers of Excellence and Innovation Zones',
    'Bangalore Robotics and AI Innovation Zone — startups in robotics, ML, data science',
    'Collaboration with IISc, ISRO, and KEONICS for infrastructure access',
    'DPIIT-recognized startups with AI/ML as core technology'
  ],
  'Rolling basis',
  'Open',
  'https://itbt.karnataka.gov.in/',
  'Positioning Karnataka as a global "AI-native" leader with dedicated AI Mission, deep-tech innovation, and job creation by 2030',
  ARRAY[
    '₹500 Cr dedicated AI fund',
    '550+ GCCs in state',
    'AI-native leadership positioning by 2030',
    'Approved Nov 2025'
  ],
  'State',
  'Karnataka',
  6, true, NOW(), NOW()
),

-- 7. Tamil Nadu AI Mission (TNAIM)
(
  'scheme_state_tamilnadu',
  'Tamil Nadu AI Mission (TNAIM)',
  'TN AI Mission',
  '₹1,000 Cr investment',
  ARRAY[
    'AI startups based in Tamil Nadu or willing to establish operations',
    'AI research institutions and academic partners',
    'Implemented via TNeGA, iTNT, ICT Academy, and ELCOT',
    'Focus areas: education, employment, industry, research, medicine, governance',
    'TAM-DEF framework for safe & ethical AI evaluation'
  ],
  'Rolling basis',
  'Open',
  'https://tnega.tn.gov.in/',
  'Comprehensive AI policy to attract investment, create 20,000 jobs, and deploy AI across education, healthcare, governance, and industry',
  ARRAY[
    'Investment target: ₹1,000 Cr',
    'Initial sanction: ₹13.93 Cr',
    'Jobs target: 20,000',
    'TAM-DEF safe & ethical AI framework'
  ],
  'State',
  'Tamil Nadu',
  7, true, NOW(), NOW()
),

-- 8. Telangana AI Mission (T-AIM)
(
  'scheme_state_telangana',
  'Telangana AI Mission (T-AIM) & Revv Up Accelerator',
  'T-AIM & Revv Up',
  'Equity-free accelerator',
  ARRAY[
    'Early-stage and growth-stage AI startups based in Telangana or intending to set up facility',
    'Sector-agnostic AI startups with strong AI use case',
    'Focus sectors: agriculture, education, environment, law enforcement, smart cities, healthcare',
    'TGDeX data exchange platform for startups, developers, researchers',
    'Government procurement preference for AI startups/MSMEs'
  ],
  'Cohort-based',
  'Open',
  'https://ai.telangana.gov.in/',
  'Making Hyderabad a top-25 global AI innovation hub through accelerator programs, data exchange, and government-as-a-buyer model',
  ARRAY[
    '80+ startups supported across 3 cohorts',
    '12-month equity-free accelerator powered by NASSCOM',
    'Mentorship, government PoC opportunities, investor pitches',
    'International market access (North America, Central Europe, APAC)'
  ],
  'State',
  'Telangana',
  8, true, NOW(), NOW()
),

-- 9. Maharashtra AI Policy 2026
(
  'scheme_state_maharashtra',
  'Maharashtra AI Policy 2026 & Maha Agri-AI Policy',
  'Maharashtra AI Policy',
  '₹10,000 Cr investment target',
  ARRAY[
    'AI startups in Maharashtra across healthcare, fintech, agritech, manufacturing, smart cities, education',
    '6 AI Centres of Excellence (sector-specific) and 5 AI Innovation Cities',
    'Agri-AI: researchers and startups — up to ₹40L for discovery/ideation; up to ₹2 Cr for pilot/validation',
    'Access to farmer networks, test beds, state-level data ecosystems',
    'India''s first state-level separate Ethical AI framework'
  ],
  'Rolling basis',
  'Open',
  'https://maharashtra.gov.in/',
  'India''s first state Ethical AI framework and first Agri-AI Policy — targeting ₹10,000 Cr investment, 1.5 lakh jobs, and 6 AI CoEs',
  ARRAY[
    'Investment target: ₹10,000 Cr',
    'Jobs target: 1.5 Lakh',
    'Venture Fund: ₹500 Cr',
    'Agri-AI Grant: Up to ₹2 Cr',
    'First state Ethical AI framework in India'
  ],
  'State',
  'Maharashtra',
  9, true, NOW(), NOW()
),

-- 10. UP AI City
(
  'scheme_state_up',
  'UP AI City & AI Ecosystem',
  'UP AI City',
  'AI City 100+ acres',
  ARRAY[
    'AI startups setting up in Lucknow AI City',
    'Innovation Centre, CoE, Skill Development Institute access',
    'State-of-the-art labs for AI, ML, robotics, data science',
    'MoU with IndiaAI Mission for joint ecosystem development',
    'IT tower, startup workspaces, data centre, commercial blocks'
  ],
  'Rolling basis',
  'Open',
  'https://up.gov.in/',
  'AI City project in Lucknow and landmark MoU with IndiaAI Mission to boost the state''s AI ecosystem',
  ARRAY[
    'AI City: 100+ acres in Lucknow',
    'Phase 1: 15-20 acre core',
    '1 CoE with Tata Group',
    'MoU with IndiaAI Mission'
  ],
  'State',
  'Uttar Pradesh',
  10, true, NOW(), NOW()
),

-- 11. Odisha AI Mission
(
  'scheme_state_odisha',
  'Odisha AI Mission',
  'Odisha AI Mission',
  'State AI policy',
  ARRAY[
    'AI startups and researchers in Odisha',
    'Focus areas: governance, education, healthcare, agriculture & farmer empowerment, climate change & disaster management',
    'Infrastructure development, AI skill development, ethical use guidelines',
    'Data governance, cybersecurity, ease of research'
  ],
  'Rolling basis',
  'Open',
  'https://odisha.gov.in/',
  'State AI policy notified in 2025 focusing on governance, education, healthcare, agriculture, climate change, and disaster management',
  ARRAY[
    'Notified in 2025',
    'Focus on 5 core sectors',
    'AI skill development programs',
    'Ethical use and data governance guidelines'
  ],
  'State',
  'Odisha',
  11, true, NOW(), NOW()
),

-- 12. Rajasthan AI/ML Policy 2026
(
  'scheme_state_rajasthan',
  'Rajasthan AI/ML Policy 2026',
  'Rajasthan AI/ML Policy',
  'State AI policy',
  ARRAY[
    'AI/ML startups and enterprises in Rajasthan',
    'Transparent, fair, accountable AI systems per state principles',
    'Faster, citizen-centric public service delivery',
    'Research and innovation-driven economic growth'
  ],
  'Rolling basis',
  'Open',
  'https://rajasthan.gov.in/',
  'Strengthening governance, accelerating economic growth, fostering research and innovation, and generating high-value employment',
  ARRAY[
    'Launched in 2026',
    'Dedicated AI Portal launched',
    'Citizen-centric AI governance',
    'Innovation-driven economic growth focus'
  ],
  'State',
  'Rajasthan',
  12, true, NOW(), NOW()
),

-- 13. Kerala AI Mission (K-AI)
(
  'scheme_state_kerala',
  'Kerala AI Mission (K-AI)',
  'Kerala AI Mission',
  'Public good AI focus',
  ARRAY[
    'AI startups, researchers, and technology innovators in Kerala',
    'Focus: disease outbreak prediction, community safeguarding, farmer support, education, smart governance',
    'Two AI Centres of Excellence established under IndiaAI Mission',
    'Kerala Startup Mission (KSUM) as implementing body'
  ],
  'Rolling basis',
  'Open',
  'https://startupmission.kerala.gov.in/',
  'Co-creating ethical, transparent, people-centric AI solutions across health, agriculture, education, and governance',
  ARRAY[
    '2 AI CoEs under IndiaAI Mission',
    'Public good AI focus',
    'Kerala Startup Mission (KSUM) implementation',
    'Ethical and transparent AI development'
  ],
  'State',
  'Kerala',
  13, true, NOW(), NOW()
),

-- 14. AP AI City Amaravati
(
  'scheme_state_ap',
  'AP AI City Amaravati & AI Startup Fund',
  'AP AI City',
  '₹100 Cr startup fund',
  ARRAY[
    'AI startups in agriculture, education, digital infrastructure',
    'Google collaboration for AI skill-building',
    'Data City in Visakhapatnam — AI University (NVIDIA MoU)',
    'Mega AI projects, supercomputing centres, global AI summits'
  ],
  'Rolling basis',
  'Open',
  'https://ap.gov.in/',
  'India''s first dedicated AI-driven city in Amaravati, with NVIDIA partnership for AI University and ₹100 Cr startup allocation',
  ARRAY[
    'Startup Fund: ₹100 Cr',
    'AI City in Amaravati',
    'NVIDIA partnership for AI University',
    'Vision: Top 3 AI superpower by 2035'
  ],
  'State',
  'Andhra Pradesh',
  14, true, NOW(), NOW()
),

-- 15. Goa & Haryana AI Missions
(
  'scheme_state_goa_haryana',
  'Goa AI Mission 2027 & Haryana AI Mission',
  'Goa & Haryana AI',
  '₹470 Cr (Haryana, World Bank)',
  ARRAY[
    'Goa: AI startups and researchers via Goa AI Advisory Council & Sec 8 company',
    'Goa: Focus on capacity building, ethical & responsible AI, innovation-to-impact',
    'Haryana: AI hubs in Gurugram and Panchkula for youth training and startup support',
    'Haryana: World Bank-assisted ₹470 Cr for AI Mission implementation'
  ],
  'Rolling basis',
  'Open',
  'https://goa.gov.in/',
  'Citizen-first digital transformation in Goa with AI CoE & Lab; Haryana establishing AI hubs in Gurugram and Panchkula with World Bank support',
  ARRAY[
    'Haryana Funding: ₹470 Cr (World Bank)',
    'Haryana target: 50,000 youth trained',
    'Goa: 1 CoE + 1 Lab',
    'Goa AI Advisory Council for governance'
  ],
  'State',
  'Goa',
  15, true, NOW(), NOW()
);

-- Note: Gujarat is listed as "Developing" status
INSERT INTO "GovernmentScheme" (
  id, name, "shortName", "fundingAmount", eligibility, "applicationDeadline",
  status, "applyLink", description, benefits, category, state,
  "displayOrder", "isActive", "createdAt", "updatedAt"
) VALUES (
  'scheme_state_gujarat',
  'Gujarat AI Center of Excellence',
  'Gujarat AI CoE',
  '₹50–200 Cr CAPEX',
  ARRAY[
    'AI startups and MSMEs in Gujarat',
    'Manufacturing and automation sector focus',
    'AI Center of Excellence for industry-academia collaboration'
  ],
  'Rolling basis',
  'Coming Soon',
  'https://gujarat.gov.in/',
  'AI hub with ₹50–200 Cr CAPEX funding for AI-driven industries, MSME incentives, and manufacturing/automation focus',
  ARRAY[
    'CAPEX range: ₹50–200 Cr',
    'Manufacturing & automation focus',
    'Industry-academia collaboration',
    'MSME incentives'
  ],
  'State',
  'Gujarat',
  16, true, NOW(), NOW()
);
