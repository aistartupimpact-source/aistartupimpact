// Startup Categories and Use Cases
// Centralized constants for consistency across the application

export const STARTUP_CATEGORIES = [
  { value: 'Indic LLM', label: 'Indic LLM', description: 'Indian language models and NLP' },
  { value: 'AI Infrastructure', label: 'AI Infrastructure', description: 'Cloud, compute, and AI infrastructure' },
  { value: 'Health AI', label: 'Health AI', description: 'Healthcare and medical AI' },
  { value: 'FinTech AI', label: 'FinTech AI', description: 'Financial services and banking AI' },
  { value: 'Sales AI', label: 'Sales AI', description: 'Sales, CRM, and customer engagement' },
  { value: 'Data AI', label: 'Data AI', description: 'Data analytics and business intelligence' },
  { value: 'DevTools AI', label: 'DevTools AI', description: 'Developer tools and coding assistants' },
  { value: 'EdTech AI', label: 'EdTech AI', description: 'Education and learning platforms' },
  { value: 'Enterprise AI', label: 'Enterprise AI', description: 'Enterprise software and automation' },
  { value: 'Consumer AI', label: 'Consumer AI', description: 'Consumer apps and services' },
  { value: 'Robotics', label: 'Robotics', description: 'Robotics and automation' },
  { value: 'Computer Vision', label: 'Computer Vision', description: 'Image and video analysis' },
  { value: 'Voice AI', label: 'Voice AI', description: 'Speech recognition and synthesis' },
  { value: 'Other', label: 'Other', description: 'Other AI applications' },
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
  
  // Priority-based detection (more specific first)
  const patterns = [
    { category: 'Indic LLM', keywords: ['llm', 'language model', 'indic', 'hindi', 'tamil', 'bengali', 'multilingual', 'bharat', 'bharatgpt'] },
    { category: 'AI Infrastructure', keywords: ['infrastructure', 'cloud', 'compute', 'gpu', 'cluster', 'platform', 'mlops', 'deployment'] },
    { category: 'Health AI', keywords: ['health', 'medical', 'diagnostic', 'healthcare', 'patient', 'clinical', 'hospital', 'doctor'] },
    { category: 'FinTech AI', keywords: ['fintech', 'finance', 'banking', 'payment', 'lending', 'credit', 'investment', 'trading'] },
    { category: 'Sales AI', keywords: ['sales', 'crm', 'customer relationship', 'lead generation', 'outreach', 'prospecting'] },
    { category: 'Data AI', keywords: ['data analytics', 'business intelligence', 'data science', 'visualization', 'insights', 'reporting'] },
    { category: 'DevTools AI', keywords: ['devtools', 'developer', 'coding', 'programming', 'code generation', 'github', 'ide'] },
    { category: 'EdTech AI', keywords: ['education', 'edtech', 'learning', 'student', 'teaching', 'course', 'training', 'tutor'] },
    { category: 'Computer Vision', keywords: ['computer vision', 'image recognition', 'object detection', 'facial recognition', 'ocr'] },
    { category: 'Voice AI', keywords: ['voice', 'speech', 'audio', 'transcription', 'text-to-speech', 'voice assistant'] },
    { category: 'Robotics', keywords: ['robot', 'robotics', 'automation', 'autonomous', 'drone', 'warehouse'] },
    { category: 'Enterprise AI', keywords: ['enterprise', 'b2b', 'workflow', 'productivity', 'collaboration', 'saas'] },
    { category: 'Consumer AI', keywords: ['consumer', 'b2c', 'mobile app', 'social', 'entertainment', 'lifestyle'] },
  ];
  
  // Score each category based on keyword matches
  const scores: { [key: string]: number } = {};
  
  for (const pattern of patterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        // Longer keywords get higher weight
        score += keyword.split(' ').length;
      }
    }
    if (score > 0) {
      scores[pattern.category] = score;
    }
  }
  
  // Return category with highest score
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
