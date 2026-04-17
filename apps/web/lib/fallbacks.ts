// Static fallback data — used when DB is unreachable
// Kept in a separate file to keep the homepage bundle lean

export const defaultHeroArticle = {
  slug: 'india-ai-revolution-2026',
  title: "The Rise of Indic LLMs: How Indian Startups Are Building AI for a Billion Voices in 2026",
  excerpt:
    "With Sarvam AI's OpenHathi and Ola Krutrim dominating the landscape, the focus has shifted entirely to vernacular AI. Here's a deep dive into how Indian AI companies raised over $3.5 billion to solve the multilingual challenge.",
  category: { name: 'Deep Dive' },
  author: { name: 'Venkatesh Lahori' },
  publishedAt: '2026-03-08T10:00:00Z',
  readTimeMinutes: 14,
};

export const defaultTrendingItems = [
  "Ola Krutrim reaches $1B valuation, becoming India's first AI unicorn",
  "Sarvam AI open-sources its foundational Hindi LLM series",
  'NVIDIA partners with Reliance to build massive AI infrastructure in India',
];

export const defaultLatestStories = [
  { slug: 's1', title: "Krutrim Base and Pro Models: A Technical Breakdown for Indic Developers", category: { name: 'Tech Review' }, author: { name: 'Adviteeya R.' }, publishedAt: '2026-03-07T10:00:00Z', readTimeMinutes: 7 },
  { slug: 's2', title: "Qure.ai Secures $65M Series D to Expand AI Healthcare Diagnostics Globally", category: { name: 'Funding' }, author: { name: 'Sneha Jain' }, publishedAt: '2026-03-06T10:00:00Z', readTimeMinutes: 5 },
  { slug: 's3', title: 'Why Global Tech Leaders Are Setting Up AI Hubs in Bengaluru and Hyderabad', category: { name: 'Ecosystem' }, author: { name: 'Kunal Patel' }, publishedAt: '2026-03-05T08:00:00Z', readTimeMinutes: 9 },
];

export const defaultFounderSpotlights = [
  { slug: 'pratyush-kumar-sarvam', title: 'Building Sarvam AI: Pratyush Kumar on the Mission to Democratize Vernacular Intelligence for India', excerpt: 'From co-founding AI4Bharat to raising a massive $41M Series A for Sarvam AI, Pratyush Kumar is leading the charge in building foundational AI models for India.', author: { name: 'Venkatesh Lahori' }, readTimeMinutes: 12, category: { name: 'Founder Spotlight' } },
  { slug: 'bhavish-aggarwal-krutrim', title: "Bhavish Aggarwal's Krutrim: Building India's Complete AI Stack from Silicon to Software", excerpt: "Ola's founder is betting big on vertical integration — custom chips, cloud infrastructure, and consumer AI apps all under one roof.", author: { name: 'Venkatesh Lahori' }, readTimeMinutes: 10, category: { name: 'Founder Spotlight' } },
  { slug: 'ganesh-gopalan-gnani', title: "Gnani.ai's Ganesh Gopalan on Processing 10 Million Voice AI Calls Every Day", excerpt: 'Built on 14 million hours of Indian speech data, Gnani.ai now powers voice AI for Tata Group, Air India, and dozens of Indian enterprises.', author: { name: 'Venkatesh Lahori' }, readTimeMinutes: 8, category: { name: 'Founder Spotlight' } },
  { slug: 'nikhil-kamath-zerodha-ai', title: 'Nikhil Kamath on Why Zerodha Is Going All-In on AI for the Next 100 Million Investors', excerpt: 'The fintech founder explains how AI is reshaping retail investing in India and why vernacular interfaces are the key to the next growth wave.', author: { name: 'Venkatesh Lahori' }, readTimeMinutes: 9, category: { name: 'Founder Spotlight' } },
  { slug: 'ankit-sobti-postman-ai', title: "Postman's Ankit Sobti on Building AI-Native Developer Tools for a Global Audience from Bengaluru", excerpt: 'With 30 million developers on the platform, Postman CTO Ankit Sobti shares how the company is embedding AI across the entire API lifecycle.', author: { name: 'Venkatesh Lahori' }, readTimeMinutes: 11, category: { name: 'Founder Spotlight' } },
];

export const defaultToolPicks = [
  { slug: 'krutrim', name: 'Krutrim AI', tagline: "India's own foundational AI assistant fluent in 22 official languages", category: { name: 'Assistant' }, avgRating: 4.8, logoUrl: 'https://ui-avatars.com/api/?name=Krutrim+AI&background=4F46E5&color=fff&size=150' },
  { slug: 'karya', name: 'Karya', tagline: 'Ethical data platform paying rural Indians to train regional AI models', category: { name: 'Data Ops' }, avgRating: 4.9, logoUrl: 'https://ui-avatars.com/api/?name=Karya&background=E11D48&color=fff&size=150' },
  { slug: 'dubu', name: 'Dubverse', tagline: 'AI-powered video dubbing tool supporting purely Indian languages natively', category: { name: 'Video Gen' }, avgRating: 4.6, logoUrl: 'https://ui-avatars.com/api/?name=Dubverse&background=059669&color=fff&size=150' },
  { slug: 'sarvam', name: 'Sarvam AI', tagline: 'Foundation models built for Indic languages and voice-first interfaces', category: { name: 'LLM' }, avgRating: 4.7, logoUrl: 'https://ui-avatars.com/api/?name=Sarvam+AI&background=D97706&color=fff&size=150' },
  { slug: 'gnani', name: 'Gnani.ai', tagline: 'Enterprise voice AI processing 10M+ calls daily across Indian enterprises', category: { name: 'Voice AI' }, avgRating: 4.5, logoUrl: 'https://ui-avatars.com/api/?name=Gnani+AI&background=7C3AED&color=fff&size=150' },
  { slug: 'murf', name: 'Murf AI', tagline: 'Studio-quality AI voiceover in Hindi, Tamil, Telugu and 20+ languages', category: { name: 'Audio Gen' }, avgRating: 4.6, logoUrl: 'https://ui-avatars.com/api/?name=Murf+AI&background=3B82F6&color=fff&size=150' },
  { slug: 'bhashini', name: 'Bhashini AI', tagline: 'Open-source language AI models breaking language barriers across India', category: { name: 'Translation' }, avgRating: 4.9, logoUrl: 'https://ui-avatars.com/api/?name=Bhashini&background=0EA5E9&color=fff&size=150' },
  { slug: 'kissanai', name: 'KissanAI', tagline: 'Multilingual generative AI voice advisor designed directly for Indian farmers', category: { name: 'AgriTech' }, avgRating: 4.8, logoUrl: 'https://ui-avatars.com/api/?name=KissanAI&background=22C55E&color=fff&size=150' },
  { slug: 'wadhwani', name: 'Wadhwani AI', tagline: 'AI solutions for public health and agriculture across the global south', category: { name: 'HealthTech' }, avgRating: 4.8, logoUrl: 'https://ui-avatars.com/api/?name=Wadhwani&background=EF4444&color=fff&size=150' },
  { slug: 'rephrase', name: 'Rephrase.ai', tagline: 'Pioneering synthetic video generation platform for personalized marketing', category: { name: 'Video Gen' }, avgRating: 4.6, logoUrl: 'https://ui-avatars.com/api/?name=Rephrase&background=8B5CF6&color=fff&size=150' },
  { slug: 'corover', name: 'CoRover.ai', tagline: 'Conversational AI powering IRCTC and large public sector platforms in India', category: { name: 'Conversational' }, avgRating: 4.5, logoUrl: 'https://ui-avatars.com/api/?name=CoRover&background=EC4899&color=fff&size=150' },
  { slug: 'jugalbandi', name: 'Jugalbandi', tagline: 'Open ecosystem providing AI-driven citizen services via WhatsApp', category: { name: 'Public Tech' }, avgRating: 4.9, logoUrl: 'https://ui-avatars.com/api/?name=Jugalbandi&background=14B8A6&color=fff&size=150' },
];

export const defaultFundingDigests = [
  { slug: 'week-1', title: 'Week 10: Sarvam AI raises $41M, Krutrim closes Series B', date: '2025-03-07', dealsCount: 5, totalRaised: '$98M', deals: [{ startup: 'Sarvam AI', amount: '$41M', stage: 'Series A' }, { startup: 'Krutrim', amount: '$50M', stage: 'Series B' }] },
  { slug: 'week-2', title: 'Week 9: Edge AI startups see $22M in fresh funding', date: '2025-02-28', dealsCount: 3, totalRaised: '$22M', deals: [{ startup: 'EdgeAI Co', amount: '$12M', stage: 'Seed' }] },
  { slug: 'week-3', title: 'Week 8: HealthTech AI leads the pack', date: '2025-02-21', dealsCount: 4, totalRaised: '$35M', deals: [] },
];

export const defaultPremiumStartup = [
  { name: 'Yotta Shakti', tagline: "India's Largest AI Supercomputer", description: 'Access scalable GPU infrastructure natively in India. Delivering 16,384 NVIDIA H100 GPUs exclusively for homegrown AI innovators.', ctaUrl: 'https://yotta.com', logoUrl: null, statValue: '40%', statLabel: 'Lower GPU Cost' },
];

export const defaultSponsor = {
  brand: 'Yotta Data Services',
  tagline: 'Powering Indian AI with NVIDIA H100 GPU Cloud clusters',
  ctaUrl: 'https://yotta.com',
};

export const defaultIndiaAI = [
  { slug: 'i1', title: "Cabinet Approves ₹10,372 Crore 'IndiaAI Mission' to Bolster Domestic Innovation", category: { name: 'Policy' }, publishedAt: '2026-03-05T10:00:00Z' },
  { slug: 'i2', title: "Bhashini: The Digital Public Good Revolutionizing Cross-Language Communication", category: { name: 'Public Tech' }, publishedAt: '2026-03-04T10:00:00Z' },
  { slug: 'i3', title: 'Why Reliance Jio is Banking Heavily on AI for the Next Billion Users', category: { name: 'Telecom' }, publishedAt: '2026-03-02T10:00:00Z' },
  { slug: 'i4', title: 'Startups Using AI to Solve Agriculture Supply Chain Issues in Rural India', category: { name: 'AgriTech' }, publishedAt: '2026-03-01T10:00:00Z' },
];
