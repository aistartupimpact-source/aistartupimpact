-- Clean insert for India AI data
-- Delete existing data
DELETE FROM "AIResearcher";
DELETE FROM "IndianAITool";
DELETE FROM "FeaturedFounder";
DELETE FROM "PolicyUpdate";
DELETE FROM "GovernmentScheme";

-- Insert Government Schemes
INSERT INTO "GovernmentScheme" (id, name, "shortName", "fundingAmount", eligibility, "applicationDeadline", status, "applyLink", description, benefits, category, state, "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES 
('1', 'IndiaAI Mission', 'IndiaAI', '₹10,372 Cr', ARRAY['AI startups registered in India', 'Research institutions', 'Computing infrastructure providers', 'AI dataset creators'], 'Rolling basis', 'Open', 'https://indiaai.gov.in', 'National program to democratize AI computing, innovation, and safe AI deployment', ARRAY['Access to AI compute infrastructure', 'Dataset creation grants', 'Application development support', 'Safe & Trusted AI framework'], 'Central', NULL, 0, true, NOW(), NOW()),
('2', 'Startup India Seed Fund Scheme', 'SISFS', 'Up to ₹50L', ARRAY['DPIIT recognized startups', 'Incorporated < 2 years ago', 'Working on innovative products/services', 'Not received > ₹10L funding'], 'Rolling basis', 'Open', 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/seed-fund-scheme.html', 'Seed funding to startups for proof of concept, prototype development, product trials, and market entry', ARRAY['Seed funding up to ₹20L', 'Validation/prototype: ₹50L', 'Mentorship support', 'No equity dilution'], 'Central', NULL, 1, true, NOW(), NOW()),
('3', 'SAMRIDH Scheme', 'SAMRIDH', 'Up to ₹1 Cr', ARRAY['Healthcare tech startups', 'Post-seed stage (raised ₹50L+)', 'Scalable business model', 'Impact on healthcare delivery'], 'Cohort-based', 'Open', 'https://www.startupindia.gov.in/content/sih/en/startup-scheme/samridh.html', 'Accelerator program for healthcare startups to scale and achieve market access', ARRAY['Soft loan up to ₹1 Cr', 'Mentorship from industry experts', 'Market access support', 'Pilot opportunities with hospitals'], 'Central', NULL, 2, true, NOW(), NOW()),
('4', 'Karnataka AI Policy', 'Karnataka AI', '₹500 Cr fund', ARRAY['AI startups in Karnataka', 'Setting up AI CoEs', 'AI research projects', 'Skilling initiatives'], 'Rolling basis', 'Open', 'https://itbt.karnataka.gov.in', 'State policy to position Karnataka as India''s AI hub with dedicated funding and infrastructure', ARRAY['Access to AI compute', 'Office space subsidies', 'Talent pool access', 'Regulatory sandbox'], 'State', 'Karnataka', 3, true, NOW(), NOW()),
('5', 'Tamil Nadu AI Policy', 'TN AI', '₹1,000 Cr investment', ARRAY['AI startups in Tamil Nadu', 'AI research institutions', 'Manufacturing AI solutions', 'AI for social good'], 'Rolling basis', 'Open', 'https://tnega.tn.gov.in', 'Comprehensive AI policy to attract ₹1,000 Cr investment and create 20,000 jobs', ARRAY['Capital subsidy up to 50%', 'Land at concessional rates', 'Power tariff subsidies', 'Fast-track approvals'], 'State', 'Tamil Nadu', 4, true, NOW(), NOW());

-- Insert Policy Updates
INSERT INTO "PolicyUpdate" (id, title, source, date, excerpt, link, category, impact, "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
('1', 'MeitY Releases Draft AI Ethics Framework for Public Consultation', 'MeitY', '2026-05-03', 'Ministry of Electronics and IT has released a comprehensive AI ethics framework covering fairness, transparency, accountability, and privacy. Public comments invited until June 15, 2026.', 'https://meity.gov.in', 'Policy', 'High', 0, true, NOW(), NOW()),
('2', 'NITI Aayog Announces ₹500 Cr AI Research Fund for IITs', 'NITI Aayog', '2026-05-01', 'National Institution for Transforming India allocates ₹500 crore for AI research across 23 IITs. Focus areas include healthcare AI, agricultural AI, and climate modeling.', 'https://niti.gov.in', 'Funding', 'High', 1, true, NOW(), NOW()),
('3', 'Digital Personal Data Protection Act: AI-Specific Guidelines Released', 'Data Protection', '2026-04-28', 'Data Protection Board of India issues guidelines for AI systems processing personal data. Mandates algorithmic transparency and user consent for automated decision-making.', 'https://dpb.gov.in', 'Regulation', 'High', 2, true, NOW(), NOW()),
('4', 'AI Safety Standards Committee Publishes Testing Framework', 'AI Safety', '2026-04-25', 'Bureau of Indian Standards releases AI safety testing framework covering robustness, security, and bias evaluation. Voluntary compliance for now, mandatory from 2027.', 'https://bis.gov.in', 'Standards', 'Medium', 3, true, NOW(), NOW()),
('5', 'Supreme Court Ruling: AI-Generated Evidence Admissibility Guidelines', 'Court', '2026-04-20', 'Landmark judgment establishes criteria for admitting AI-generated evidence in courts. Requires explainability, audit trails, and expert testimony on model reliability.', '#', 'Legal', 'High', 4, true, NOW(), NOW()),
('6', 'MeitY Launches AI Compute Access Program for Startups', 'MeitY', '2026-04-18', 'New program provides subsidized access to GPU clusters for AI startups. Applications open for companies with < ₹10 Cr revenue. Up to 1000 GPU hours per quarter.', 'https://meity.gov.in', 'Policy', 'High', 5, true, NOW(), NOW());

-- Insert AI Researchers
INSERT INTO "AIResearcher" (id, name, university, position, "photoUrl", bio, "researchAreas", "notablePapers", "linkedinUrl", "googleScholarUrl", citations, "hIndex", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
('1', 'Dr. Rajesh Kumar', 'IIT Delhi', 'Professor', NULL, 'Leading researcher in Natural Language Processing and Computer Vision with 15+ years of experience', ARRAY['NLP', 'Computer Vision', 'Deep Learning'], ARRAY['Transformer Models for Indian Languages', 'Vision Systems for Agricultural AI'], 'https://linkedin.com', 'https://scholar.google.com', 5000, 45, 0, true, NOW(), NOW()),
('2', 'Dr. Priya Sharma', 'IIT Bombay', 'Associate Professor', NULL, 'Expert in Machine Learning and AI Ethics, focusing on responsible AI development', ARRAY['Machine Learning', 'AI Ethics', 'Fairness in AI'], ARRAY['Bias Detection in ML Models', 'Ethical AI Framework for India'], 'https://linkedin.com', 'https://scholar.google.com', 3500, 38, 1, true, NOW(), NOW()),
('3', 'Dr. Amit Patel', 'IISc Bangalore', 'Professor', NULL, 'Pioneering work in Reinforcement Learning and Robotics applications', ARRAY['Reinforcement Learning', 'Robotics', 'Autonomous Systems'], ARRAY['RL for Industrial Automation', 'Multi-Agent Systems in Manufacturing'], 'https://linkedin.com', 'https://scholar.google.com', 4200, 42, 2, true, NOW(), NOW());

-- Insert Indian AI Tools
INSERT INTO "IndianAITool" (id, name, slug, tagline, description, "logoUrl", "websiteUrl", category, "foundedYear", "fundingStatus", "totalFunding", headquarters, "teamSize", features, "useCases", "isFeatured", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
('1', 'Sarvam AI', 'sarvam-ai', 'India''s first full-stack AI platform', 'Building foundation models and AI infrastructure for Indian languages and use cases', NULL, 'https://sarvam.ai', 'LLM/Foundation Models', 2023, 'Series A', '$41M', 'Bangalore', '50-100', ARRAY['Multilingual LLM', 'Speech-to-text', 'Text-to-speech', 'Translation'], ARRAY['Customer support', 'Content creation', 'Voice assistants'], true, 0, true, NOW(), NOW()),
('2', 'Krutrim AI', 'krutrim-ai', 'India''s own AI', 'Building AI models trained on Indian data for Indian languages and contexts', NULL, 'https://krutrim.ai', 'LLM/Foundation Models', 2023, 'Seed', '$50M', 'Bangalore', '100-200', ARRAY['Indic language support', 'Cultural context understanding', 'Local data training'], ARRAY['Education', 'Healthcare', 'Government services'], true, 1, true, NOW(), NOW()),
('3', 'Yellow.ai', 'yellow-ai', 'Enterprise conversational AI platform', 'AI-powered customer service automation for enterprises', NULL, 'https://yellow.ai', 'Conversational AI', 2016, 'Series C', '$102M', 'Bangalore', '500+', ARRAY['Omnichannel support', 'Voice bots', 'Chat automation', 'Analytics'], ARRAY['Customer support', 'Sales automation', 'HR automation'], false, 2, true, NOW(), NOW());

-- Insert Featured Founders
INSERT INTO "FeaturedFounder" (id, name, "startupName", "startupSlug", "photoUrl", bio, achievement, "fundingRaised", category, "linkedinUrl", "twitterUrl", "storyUrl", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
('1', 'Vivek Raghavan', 'Sarvam AI', NULL, NULL, 'Former VP at Flipkart, building India''s first full-stack AI platform', 'Raised $41M to build foundation models for Indian languages', '$41M', 'Rising Star', 'https://linkedin.com', 'https://twitter.com', NULL, 0, true, NOW(), NOW()),
('2', 'Bhavish Aggarwal', 'Krutrim AI', NULL, NULL, 'Founder of Ola, now building India''s own AI', 'Launched India''s first indigenous AI model with $50M funding', '$50M', 'Hall of Fame', 'https://linkedin.com', 'https://twitter.com', NULL, 1, true, NOW(), NOW()),
('3', 'Raghu Ravinutala', 'Yellow.ai', NULL, NULL, 'Serial entrepreneur building enterprise AI solutions', 'Scaled Yellow.ai to $102M in funding and 500+ employees', '$102M', 'Featured', 'https://linkedin.com', 'https://twitter.com', NULL, 2, true, NOW(), NOW());
