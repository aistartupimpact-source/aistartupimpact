// Startup Categories — 32 Sectors
// Used for auto-detection from startup descriptions
// The canonical source of truth is the StartupBusinessCategory table in the DB

export const STARTUP_CATEGORIES = [
  { value: 'AI Infrastructure & MLOps', label: 'AI Infrastructure & MLOps', description: 'Model training, inference optimization, vector databases, data labeling, GPU orchestration, LLMOps' },
  { value: 'Enterprise Software & SaaS', label: 'Enterprise Software & SaaS', description: 'Horizontal B2B software, CRM, ERP, workflow automation, collaboration tools' },
  { value: 'Developer Tools & DevOps', label: 'Developer Tools & DevOps', description: 'IDEs, CI/CD, code generation, testing, monitoring, API management, databases' },
  { value: 'FinTech', label: 'FinTech', description: 'Payments, neobanking, lending, WealthTech, RegTech, crypto/Web3' },
  { value: 'HealthTech & BioTech', label: 'HealthTech & BioTech', description: 'Digital health, telemedicine, clinical tools, health monitoring, drug discovery, genomics' },
  { value: 'EdTech', label: 'EdTech', description: 'Online learning, tutoring, assessment, upskilling, corporate training' },
  { value: 'Cybersecurity', label: 'Cybersecurity', description: 'Threat detection, identity management, endpoint security, cloud security, compliance automation' },
  { value: 'MarTech & AdTech', label: 'MarTech & AdTech', description: 'Marketing automation, ad platforms, attribution, SEO tools, social media management' },
  { value: 'E-Commerce & Retail Tech', label: 'E-Commerce & Retail Tech', description: 'Online marketplaces, D2C platforms, inventory management, POS, personalization' },
  { value: 'AgriTech', label: 'AgriTech', description: 'Precision farming, crop monitoring, farm management, agricultural drones, agri-marketplace' },
  { value: 'CleanTech & Energy', label: 'CleanTech & Energy', description: 'Renewable energy, carbon capture, battery/storage, EV infrastructure, smart grid' },
  { value: 'Construction & InfraTech', label: 'Construction & InfraTech', description: 'Construction management, BIM, project estimation, safety monitoring, smart buildings' },
  { value: 'PropTech (Real Estate Tech)', label: 'PropTech (Real Estate Tech)', description: 'Property management, listing platforms, virtual tours, mortgage tech' },
  { value: 'LegalTech', label: 'LegalTech', description: 'Contract management, legal research, compliance, e-discovery, legal document automation' },
  { value: 'HRTech', label: 'HRTech', description: 'Recruitment, ATS, payroll, performance management, employee engagement, workforce analytics' },
  { value: 'Logistics & Supply Chain', label: 'Logistics & Supply Chain', description: 'Freight management, last-mile delivery, warehouse automation, fleet management' },
  { value: 'FoodTech', label: 'FoodTech', description: 'Cloud kitchens, food delivery, food processing, alternative proteins, restaurant tech' },
  { value: 'TravelTech & Hospitality', label: 'TravelTech & Hospitality', description: 'Booking platforms, travel management, hotel tech, revenue management' },
  { value: 'Mobility & Transportation', label: 'Mobility & Transportation', description: 'Autonomous vehicles, ride-hailing, fleet management, micro-mobility, EV platforms' },
  { value: 'Media & Entertainment', label: 'Media & Entertainment', description: 'Streaming, content creation, gaming, music tech, creator economy, digital publishing' },
  { value: 'Robotics & Industrial Automation', label: 'Robotics & Industrial Automation', description: 'Industrial robots, warehouse robotics, cobots, drone systems, RPA' },
  { value: 'DeepTech & Hardware', label: 'DeepTech & Hardware', description: 'Semiconductors, quantum computing, IoT hardware, sensors, wearables, 3D printing' },
  { value: 'Telecom & Connectivity', label: 'Telecom & Connectivity', description: 'Network infrastructure, 5G, satellite internet, CPaaS, unified communications' },
  { value: 'SpaceTech', label: 'SpaceTech', description: 'Satellite imaging, launch services, space manufacturing, satellite communications' },
  { value: 'Defense & GovTech', label: 'Defense & GovTech', description: 'Defense technology, government digitization, civic tech, public safety, military AI' },
  { value: 'Manufacturing & Industry 4.0', label: 'Manufacturing & Industry 4.0', description: 'Smart manufacturing, industrial IoT, quality control, predictive maintenance, digital twins' },
  { value: 'Data & Analytics', label: 'Data & Analytics', description: 'Business intelligence, data engineering, data governance, analytics platforms, data privacy' },
  { value: 'Blockchain & Web3', label: 'Blockchain & Web3', description: 'DeFi, NFT infrastructure, DAOs, smart contract platforms, tokenization, crypto exchanges' },
  { value: 'Consumer Apps & Social', label: 'Consumer Apps & Social', description: 'Social networks, messaging, dating, community platforms, lifestyle apps' },
  { value: 'Climate & Sustainability', label: 'Climate & Sustainability', description: 'Carbon accounting, ESG platforms, circular economy, sustainable packaging, green finance' },
  { value: 'Pharma & Life Sciences', label: 'Pharma & Life Sciences', description: 'Drug development, clinical trials, pharmaceutical manufacturing, precision medicine' },
  { value: 'Insurance & InsurTech', label: 'Insurance & InsurTech', description: 'Digital insurance distribution, claims automation, underwriting AI, risk assessment' },
] as const;

export const USE_CASES = [
  'Natural Language Processing',
  'Computer Vision',
  'Predictive Analytics',
  'Automation',
  'Chatbots & Conversational AI',
  'Recommendation Systems',
  'Fraud Detection',
  'Document Processing',
  'Speech Recognition',
  'Image Generation',
  'Code Generation',
  'Data Analysis',
  'Customer Support',
  'Sales Automation',
  'Marketing Automation',
  'Healthcare Diagnostics',
  'Financial Analysis',
  'Supply Chain Optimization',
  'Cybersecurity',
  'Content Creation',
] as const;

// Helper function to get category from text (improved algorithm)
export function detectCategory(text: string): string | null {
  const normalized = text.toLowerCase();

  const patterns = [
    { category: 'AI Infrastructure & MLOps', keywords: ['llm', 'language model', 'mlops', 'inference', 'vector database', 'gpu', 'model training', 'data labeling', 'fine-tuning'] },
    { category: 'Enterprise Software & SaaS', keywords: ['enterprise', 'b2b', 'workflow', 'productivity', 'collaboration', 'saas', 'crm', 'erp'] },
    { category: 'Developer Tools & DevOps', keywords: ['devtools', 'developer', 'coding', 'ide', 'ci/cd', 'testing', 'api', 'monitoring', 'github'] },
    { category: 'FinTech', keywords: ['fintech', 'finance', 'banking', 'payment', 'lending', 'credit', 'investment', 'trading', 'neobank'] },
    { category: 'HealthTech & BioTech', keywords: ['health', 'medical', 'diagnostic', 'healthcare', 'patient', 'clinical', 'hospital', 'biotech', 'genomics'] },
    { category: 'EdTech', keywords: ['education', 'edtech', 'learning', 'student', 'teaching', 'course', 'training', 'tutor'] },
    { category: 'Cybersecurity', keywords: ['security', 'cybersecurity', 'threat', 'identity', 'encryption', 'firewall', 'vulnerability', 'soc'] },
    { category: 'MarTech & AdTech', keywords: ['marketing', 'adtech', 'seo', 'advertising', 'attribution', 'social media', 'influencer', 'programmatic'] },
    { category: 'E-Commerce & Retail Tech', keywords: ['ecommerce', 'e-commerce', 'retail', 'marketplace', 'd2c', 'inventory', 'pos', 'shopify'] },
    { category: 'AgriTech', keywords: ['agri', 'farming', 'crop', 'agriculture', 'livestock', 'soil', 'precision farming'] },
    { category: 'CleanTech & Energy', keywords: ['clean', 'energy', 'solar', 'renewable', 'ev', 'battery', 'carbon', 'sustainability', 'climate'] },
    { category: 'Robotics & Industrial Automation', keywords: ['robot', 'robotics', 'automation', 'autonomous', 'drone', 'warehouse', 'cobot', 'rpa'] },
    { category: 'DeepTech & Hardware', keywords: ['semiconductor', 'quantum', 'iot', 'hardware', 'sensor', 'wearable', '3d printing', 'edge computing'] },
    { category: 'Logistics & Supply Chain', keywords: ['logistics', 'supply chain', 'freight', 'delivery', 'warehouse', 'fleet', 'shipping'] },
    { category: 'FoodTech', keywords: ['food', 'restaurant', 'cloud kitchen', 'food delivery', 'recipe', 'nutrition'] },
    { category: 'Data & Analytics', keywords: ['data analytics', 'business intelligence', 'data science', 'visualization', 'insights', 'etl', 'data lake'] },
    { category: 'Blockchain & Web3', keywords: ['blockchain', 'web3', 'defi', 'nft', 'crypto', 'token', 'smart contract', 'dao'] },
    { category: 'Consumer Apps & Social', keywords: ['consumer', 'social', 'messaging', 'dating', 'community', 'lifestyle'] },
    { category: 'SpaceTech', keywords: ['space', 'satellite', 'launch', 'orbital', 'earth observation'] },
    { category: 'Defense & GovTech', keywords: ['defense', 'government', 'civic', 'public safety', 'military'] },
    { category: 'Mobility & Transportation', keywords: ['mobility', 'ride', 'ev', 'autonomous vehicle', 'micro-mobility', 'traffic'] },
    { category: 'Media & Entertainment', keywords: ['media', 'streaming', 'gaming', 'music', 'creator', 'publishing', 'podcast'] },
  ];

  const scores: { [key: string]: number } = {};

  for (const pattern of patterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        score += keyword.split(' ').length;
      }
    }
    if (score > 0) {
      scores[pattern.category] = score;
    }
  }

  if (Object.keys(scores).length === 0) return null;

  const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sortedCategories[0][0];
}

// Get category label
export function getCategoryLabel(value: string): string {
  const category = STARTUP_CATEGORIES.find(c => c.value === value);
  return category?.label || value;
}

// Get category description
export function getCategoryDescription(value: string): string {
  const category = STARTUP_CATEGORIES.find(c => c.value === value);
  return category?.description || '';
}
