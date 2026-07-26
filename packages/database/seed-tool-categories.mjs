import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

// Full AI Tool Taxonomy: 21 Parents + 312 Subcategories
const TAXONOMY = [
  {
    name: 'Writing & Content',
    slug: 'writing-content',
    icon: '✍️',
    description: 'AI tools for writing, editing, translation, and content creation',
    children: [
      ['Blog & Article Writing', 'blog-article-writing', 'AI-powered blog post and article generation tools'],
      ['Copywriting', 'copywriting', 'Marketing and advertising copy generation'],
      ['Email Writing', 'email-writing', 'Email composition and response drafting tools'],
      ['Creative & Story Writing', 'creative-story-writing', 'Fiction, storytelling, and creative writing AI'],
      ['Academic & Research Writing', 'academic-research-writing', 'Academic papers, theses, and scholarly writing'],
      ['Resume & Cover Letter', 'resume-cover-letter', 'CV and application document generators'],
      ['Grammar & Editing', 'grammar-editing', 'Proofreading, grammar check, and style correction'],
      ['Paraphrasing & Rewriting', 'paraphrasing-rewriting', 'Text rephrasing and content rewriting tools'],
      ['Summarization', 'summarization', 'Document and text summarization AI'],
      ['Transcription & Captions', 'transcription-captions', 'Audio-to-text and subtitle generation'],
      ['Translation & Localization', 'translation-localization', 'Language translation and content localization'],
      ['Technical Writing', 'technical-writing', 'Documentation and technical content creation'],
      ['Social Media Copy', 'social-media-copy', 'Social post captions and thread writing'],
      ['Content Repurposing', 'content-repurposing', 'Transform content across formats and platforms'],
      ['Prompt Engineering', 'prompt-engineering', 'Prompt creation, testing, and optimization tools'],
      ['Script & Screenplay Writing', 'script-screenplay-writing', 'Video scripts, screenplays, and dialogue'],
      ['Speech Writing', 'speech-writing', 'Public speaking and presentation script tools'],
      ['Product Description Writing', 'product-description-writing', 'E-commerce and product listing copy'],
      ['Legal Writing', 'legal-writing', 'Legal documents and contract drafting AI'],
      ['Ghostwriting & Book Writing', 'ghostwriting-book-writing', 'Long-form book and ebook creation'],
      ['Content Strategy & Planning', 'content-strategy-planning', 'Editorial calendars and content planning'],
      ['AI Text Humanizers', 'ai-text-humanizers', 'Make AI text sound more natural and human'],
    ],
  },
  {
    name: 'Image Generation & Editing',
    slug: 'image-generation-editing',
    icon: '🖼️',
    description: 'AI tools for creating, editing, and enhancing images',
    children: [
      ['AI Image Generation', 'ai-image-generation', 'Text-to-image and AI art generation'],
      ['Image Editing & Enhancement', 'image-editing-enhancement', 'Photo editing and quality enhancement'],
      ['Background Removal & Replacement', 'background-removal-replacement', 'Remove or swap image backgrounds'],
      ['Photo & Avatar Creation', 'photo-avatar-creation', 'AI portraits, headshots, and avatar generators'],
      ['Logo & Icon Generation', 'logo-icon-generation', 'AI-powered logo and icon design'],
      ['Stock Photo & Asset Generation', 'stock-photo-asset-generation', 'Generate royalty-free stock imagery'],
      ['Image Upscaling & Restoration', 'image-upscaling-restoration', 'Enhance resolution and restore old photos'],
      ['Art Style Transfer', 'art-style-transfer', 'Apply artistic styles to images'],
      ['Product Photography', 'product-photography', 'AI product shots and commercial imagery'],
      ['OCR & Image Recognition', 'ocr-image-recognition', 'Extract text and objects from images'],
      ['Face Swap & Morphing', 'face-swap-morphing', 'Face replacement and transformation tools'],
      ['Infographic & Chart Design', 'infographic-chart-design', 'Data visualization and infographic creation'],
      ['QR Code & Barcode Generation', 'qr-code-barcode-generation', 'AI-styled QR codes and barcodes'],
      ['Meme & Sticker Generators', 'meme-sticker-generators', 'Create memes and digital stickers'],
      ['Coloring & Sketch Tools', 'coloring-sketch-tools', 'AI coloring and sketch conversion'],
      ['Image Compression & Optimization', 'image-compression-optimization', 'Reduce file size while preserving quality'],
      ['Watermark Tools', 'watermark-tools', 'Add or remove watermarks from images'],
      ['Batch Image Processing', 'batch-image-processing', 'Process multiple images at scale'],
    ],
  },
  {
    name: 'Video',
    slug: 'video',
    icon: '🎬',
    description: 'AI tools for video creation, editing, and enhancement',
    children: [
      ['AI Video Generation', 'ai-video-generation', 'Text-to-video and AI video creation'],
      ['Video Editing', 'video-editing', 'AI-powered video editing and post-production'],
      ['Short-Form & Clips Generation', 'short-form-clips-generation', 'Reels, shorts, and clip extraction tools'],
      ['Screen Recording & Tutorials', 'screen-recording-tutorials', 'Screen capture and tutorial creation'],
      ['Video Enhancement & Upscaling', 'video-enhancement-upscaling', 'Improve video quality and resolution'],
      ['Subtitle & Caption Generation', 'subtitle-caption-generation', 'Auto-generate subtitles for video'],
      ['Explainer & Animated Videos', 'explainer-animated-videos', 'Create animated explainer content'],
      ['AI Talking Avatars & Presenters', 'ai-talking-avatars-presenters', 'Virtual presenters and spokesperson videos'],
      ['Video Summarization', 'video-summarization', 'Condense long videos into summaries'],
      ['Live Streaming Tools', 'live-streaming-tools', 'AI tools for live broadcast production'],
      ['Video Background & Effects', 'video-background-effects', 'Virtual backgrounds and video effects'],
      ['Video Personalization', 'video-personalization', 'Personalized video at scale'],
      ['Video Analytics', 'video-analytics', 'Video performance and engagement analytics'],
      ['Video Translation & Dubbing', 'video-translation-dubbing', 'Translate and dub video content'],
      ['Webcam & Camera Tools', 'webcam-camera-tools', 'Webcam enhancement and virtual camera'],
      ['Video Compression & Conversion', 'video-compression-conversion', 'Compress and convert video formats'],
    ],
  },
  {
    name: 'Audio & Music',
    slug: 'audio-music',
    icon: '🎵',
    description: 'AI tools for music production, audio editing, and voice',
    children: [
      ['Music Generation', 'music-generation', 'AI-composed music and soundtracks'],
      ['Audio Editing & Enhancement', 'audio-editing-enhancement', 'Audio cleanup and production tools'],
      ['Text-to-Speech', 'text-to-speech', 'Convert text into natural spoken audio'],
      ['Voice Cloning', 'voice-cloning', 'Clone and replicate voices with AI'],
      ['Speech-to-Text', 'speech-to-text', 'Convert spoken audio to text'],
      ['Sound Effects & Foley', 'sound-effects-foley', 'Generate sound effects and ambient audio'],
      ['Podcast Tools', 'podcast-tools', 'Podcast creation, editing, and distribution'],
      ['Voice Changers & Modifiers', 'voice-changers-modifiers', 'Transform and modify voice characteristics'],
      ['Audio Separation & Stem Splitting', 'audio-separation-stem-splitting', 'Isolate vocals, drums, and instruments'],
      ['Singing & Vocal Tools', 'singing-vocal-tools', 'AI singing and vocal processing'],
      ['Audiobook Creation', 'audiobook-creation', 'Convert text to audiobook format'],
      ['Audio Transcription', 'audio-transcription', 'Transcribe audio files to text'],
      ['Noise Removal & Restoration', 'noise-removal-restoration', 'Remove background noise from audio'],
      ['Audio Analytics & Monitoring', 'audio-analytics-monitoring', 'Audio quality monitoring and analysis'],
    ],
  },
  {
    name: 'Design & Creative',
    slug: 'design-creative',
    icon: '🎨',
    description: 'AI tools for graphic design, UI/UX, 3D, and creative work',
    children: [
      ['Graphic Design', 'graphic-design', 'AI-powered graphic design and visual creation'],
      ['UI/UX Design', 'ui-ux-design', 'Interface design and user experience tools'],
      ['3D Modeling', '3d-modeling', 'AI-assisted 3D model creation'],
      ['3D Animation', '3d-animation', 'Animate 3D models and scenes'],
      ['Presentation Design', 'presentation-design', 'AI slide and deck creation tools'],
      ['Document Design & Formatting', 'document-design-formatting', 'Format and layout documents'],
      ['Motion Graphics', 'motion-graphics', 'Animated graphics and visual effects'],
      ['Architecture & Interior Design', 'architecture-interior-design', 'Architectural rendering and interior AI'],
      ['Fashion & Clothing Design', 'fashion-clothing-design', 'Fashion design and virtual try-on'],
      ['Print & Packaging Design', 'print-packaging-design', 'Packaging and print material design'],
      ['Mockup & Prototyping', 'mockup-prototyping', 'Product mockups and interactive prototypes'],
      ['Color & Font Tools', 'color-font-tools', 'Color palette and typography tools'],
      ['Texture & Pattern Generation', 'texture-pattern-generation', 'Generate seamless textures and patterns'],
      ['CAD & Engineering Design', 'cad-engineering-design', 'Computer-aided design and engineering'],
      ['Jewelry & Product Design', 'jewelry-product-design', 'Product and jewelry design AI'],
      ['AR/VR Design', 'ar-vr-design', 'Augmented and virtual reality creation tools'],
      ['Game Asset Design', 'game-asset-design', 'Game art, sprites, and asset generation'],
      ['Brand Identity Design', 'brand-identity-design', 'Brand kits, guidelines, and visual identity'],
    ],
  },
  {
    name: 'Code & Development',
    slug: 'code-development',
    icon: '💻',
    description: 'AI tools for coding, development, and software engineering',
    children: [
      ['Code Generation & Completion', 'code-generation-completion', 'AI code writing and autocomplete'],
      ['Code Review & Debugging', 'code-review-debugging', 'Automated code review and bug detection'],
      ['No-Code App Builders', 'no-code-app-builders', 'Build apps without writing code'],
      ['Low-Code Platforms', 'low-code-platforms', 'Accelerated development with minimal coding'],
      ['Website Builders', 'website-builders', 'AI website creation and design'],
      ['AI Models & APIs', 'ai-models-apis', 'Pre-trained models and inference APIs'],
      ['DevOps & Infrastructure', 'devops-infrastructure', 'CI/CD, deployment, and infrastructure tools'],
      ['Testing & QA', 'testing-qa', 'Automated testing and quality assurance'],
      ['Database & Backend Tools', 'database-backend-tools', 'Database management and backend development'],
      ['Mobile App Development', 'mobile-app-development', 'AI-powered mobile app creation'],
      ['Documentation Generation', 'documentation-generation', 'Auto-generate code and API documentation'],
      ['Game Development', 'game-development', 'AI game development and level design tools'],
      ['Browser Extensions & Plugins', 'browser-extensions-plugins', 'Build browser extensions with AI'],
      ['Data Science & ML Tools', 'data-science-ml-tools', 'Machine learning and data science platforms'],
      ['Frontend & Component Builders', 'frontend-component-builders', 'UI component and frontend generators'],
      ['CLI & Terminal Tools', 'cli-terminal-tools', 'Command-line and terminal AI tools'],
      ['Code Translation & Migration', 'code-translation-migration', 'Convert code between languages'],
      ['API Development & Management', 'api-development-management', 'Build, test, and manage APIs'],
      ['Repo & Version Control Tools', 'repo-version-control-tools', 'Git and repository management AI'],
      ['Security & Code Scanning', 'security-code-scanning', 'Security scanning and vulnerability detection'],
    ],
  },
  {
    name: 'Marketing & Advertising',
    slug: 'marketing-advertising',
    icon: '📣',
    description: 'AI tools for marketing campaigns, SEO, ads, and growth',
    children: [
      ['Content Marketing', 'content-marketing', 'Content strategy and distribution tools'],
      ['SEO Tools', 'seo-tools', 'Search engine optimization and keyword tools'],
      ['SEM & Paid Search', 'sem-paid-search', 'Pay-per-click and search advertising'],
      ['Social Media Management', 'social-media-management', 'Schedule, publish, and manage social accounts'],
      ['Social Media Content Creation', 'social-media-content-creation', 'Create posts, stories, and social visuals'],
      ['Advertising & Ad Creative', 'advertising-ad-creative', 'Ad copy, creative, and campaign generation'],
      ['Email Marketing', 'email-marketing', 'Email campaign creation and automation'],
      ['Influencer Marketing', 'influencer-marketing', 'Find and manage influencer partnerships'],
      ['Marketing Analytics & Attribution', 'marketing-analytics-attribution', 'Track campaign performance and ROI'],
      ['Brand Strategy & Positioning', 'brand-strategy-positioning', 'Brand voice and positioning tools'],
      ['Affiliate Marketing', 'affiliate-marketing', 'Affiliate program and link management'],
      ['PR & Media Outreach', 'pr-media-outreach', 'Press releases and media relations AI'],
      ['Marketing Automation', 'marketing-automation', 'Automated marketing workflows and triggers'],
      ['Conversion Rate Optimization', 'conversion-rate-optimization', 'A/B testing and CRO tools'],
      ['Landing Page Builders', 'landing-page-builders', 'AI landing page creation and optimization'],
      ['Competitor & Market Analysis', 'competitor-market-analysis', 'Competitive intelligence and benchmarking'],
      ['SMS & Push Marketing', 'sms-push-marketing', 'SMS campaigns and push notifications'],
      ['Event Marketing', 'event-marketing', 'Event promotion and marketing tools'],
    ],
  },
  {
    name: 'Sales & CRM',
    slug: 'sales-crm',
    icon: '💰',
    description: 'AI tools for sales teams, pipeline management, and revenue',
    children: [
      ['CRM & Pipeline Management', 'crm-pipeline-management', 'Customer relationship and deal tracking'],
      ['Lead Generation & Prospecting', 'lead-generation-prospecting', 'Find and qualify potential customers'],
      ['Sales Outreach & Sequencing', 'sales-outreach-sequencing', 'Automated outreach and follow-up sequences'],
      ['Sales Analytics & Forecasting', 'sales-analytics-forecasting', 'Revenue forecasting and sales data'],
      ['Proposal & Quote Generation', 'proposal-quote-generation', 'Create proposals and quotes with AI'],
      ['Sales Coaching & Enablement', 'sales-coaching-enablement', 'Train and upskill sales teams'],
      ['Conversational Sales', 'conversational-sales', 'AI-driven sales conversations and chat'],
      ['Account Management', 'account-management', 'Customer account health and expansion'],
      ['Revenue Operations', 'revenue-operations', 'RevOps tools and revenue intelligence'],
      ['Sales Intelligence & Enrichment', 'sales-intelligence-enrichment', 'Contact and company data enrichment'],
      ['Contract & Deal Management', 'contract-deal-management', 'Deal room and contract workflow tools'],
      ['CPQ & Pricing Tools', 'cpq-pricing-tools', 'Configure-price-quote and pricing optimization'],
    ],
  },
  {
    name: 'Productivity & Workspace',
    slug: 'productivity-workspace',
    icon: '⚡',
    description: 'AI tools for task management, automation, and personal productivity',
    children: [
      ['Task & Project Management', 'task-project-management', 'Project planning and task tracking'],
      ['Automation & Workflows', 'automation-workflows', 'Workflow automation and process builders'],
      ['Meeting & Scheduling', 'meeting-scheduling', 'Calendar management and meeting tools'],
      ['Meeting Notes & Summaries', 'meeting-notes-summaries', 'Auto meeting notes and action items'],
      ['Note-Taking & Second Brain', 'note-taking-second-brain', 'Knowledge management and note tools'],
      ['Spreadsheets & Data Tools', 'spreadsheets-data-tools', 'AI-powered spreadsheets and data work'],
      ['Calendar & Time Management', 'calendar-time-management', 'Time tracking and calendar optimization'],
      ['Team Collaboration', 'team-collaboration', 'Team communication and workspace tools'],
      ['File & Document Management', 'file-document-management', 'Document organization and storage'],
      ['Mind Mapping & Brainstorming', 'mind-mapping-brainstorming', 'Visual thinking and ideation tools'],
      ['Forms & Surveys', 'forms-surveys', 'Form building and survey creation'],
      ['Personal Productivity', 'personal-productivity', 'Individual productivity and focus tools'],
      ['Bookmark & Read-Later Tools', 'bookmark-read-later-tools', 'Save and organize web content'],
      ['Clipboard & Snippet Managers', 'clipboard-snippet-managers', 'Clipboard history and text snippets'],
      ['Goal & Habit Tracking', 'goal-habit-tracking', 'Goal setting and habit formation'],
      ['Daily Planners & Journaling', 'daily-planners-journaling', 'Daily planning and journal AI tools'],
      ['Workspace & Dashboard Builders', 'workspace-dashboard-builders', 'Custom workspace and dashboard tools'],
      ['RPA & Process Automation', 'rpa-process-automation', 'Robotic process automation tools'],
    ],
  },
  {
    name: 'Customer Experience',
    slug: 'customer-experience',
    icon: '🎧',
    description: 'AI tools for customer support, chatbots, and service',
    children: [
      ['AI Chatbots', 'ai-chatbots', 'Conversational AI chatbot builders'],
      ['Help Desk & Ticketing', 'help-desk-ticketing', 'Support ticket management and resolution'],
      ['Virtual Assistants', 'virtual-assistants', 'AI-powered virtual assistant tools'],
      ['Knowledge Base & FAQ Builders', 'knowledge-base-faq-builders', 'Build self-service help centers'],
      ['Live Chat & Messaging', 'live-chat-messaging', 'Real-time customer messaging tools'],
      ['Feedback & Surveys', 'feedback-surveys', 'Customer feedback collection and analysis'],
      ['Customer Success', 'customer-success', 'Customer health scores and retention tools'],
      ['Community Management', 'community-management', 'Community building and moderation'],
      ['Review Management', 'review-management', 'Monitor and respond to customer reviews'],
      ['Voice of Customer Analytics', 'voice-of-customer-analytics', 'Analyze customer sentiment at scale'],
      ['Onboarding & Guided Tours', 'onboarding-guided-tours', 'Product tours and user onboarding'],
      ['Self-Service Portals', 'self-service-portals', 'Customer self-service platforms'],
      ['Loyalty & Retention', 'loyalty-retention', 'Loyalty programs and churn prevention'],
      ['Omnichannel Support', 'omnichannel-support', 'Unified support across all channels'],
    ],
  },
  {
    name: 'Data & Analytics',
    slug: 'data-analytics',
    icon: '📊',
    description: 'AI tools for data analysis, business intelligence, and research',
    children: [
      ['Business Intelligence & Dashboards', 'business-intelligence-dashboards', 'BI platforms and data dashboards'],
      ['Data Visualization', 'data-visualization', 'Charts, graphs, and visual data tools'],
      ['Data Extraction & Scraping', 'data-extraction-scraping', 'Web scraping and data extraction'],
      ['Data Cleaning & Preparation', 'data-cleaning-preparation', 'Data quality and preparation tools'],
      ['Predictive Analytics', 'predictive-analytics', 'Forecasting and predictive modeling'],
      ['Search Engines & AI Search', 'search-engines-ai-search', 'AI-powered search and discovery'],
      ['Web Research & OSINT', 'web-research-osint', 'Open source intelligence and web research'],
      ['Market Research & Analysis', 'market-research-analysis', 'Market sizing and trend analysis'],
      ['Text & Sentiment Analysis', 'text-sentiment-analysis', 'NLP-based text and sentiment tools'],
      ['Data Labeling & Annotation', 'data-labeling-annotation', 'Training data labeling tools'],
      ['ETL & Data Pipelines', 'etl-data-pipelines', 'Data integration and pipeline tools'],
      ['Geospatial & Location Analytics', 'geospatial-location-analytics', 'Location data and mapping analytics'],
      ['Competitive Intelligence', 'competitive-intelligence', 'Track competitors and market shifts'],
      ['Survey & Poll Analytics', 'survey-poll-analytics', 'Survey analysis and polling tools'],
    ],
  },
  {
    name: 'E-Commerce',
    slug: 'e-commerce',
    icon: '🛒',
    description: 'AI tools for online retail, product management, and shopping',
    children: [
      ['Product Descriptions & Listings', 'product-descriptions-listings', 'Generate product copy and listings'],
      ['Product Photography & Visuals', 'product-photography-visuals', 'AI product photos and visuals'],
      ['Storefront & Shop Builders', 'storefront-shop-builders', 'Build online stores with AI'],
      ['Pricing & Revenue Optimization', 'pricing-revenue-optimization', 'Dynamic pricing and revenue tools'],
      ['Inventory & Supply Chain', 'inventory-supply-chain', 'Inventory management and logistics'],
      ['Personalization & Recommendations', 'personalization-recommendations', 'Product recommendation engines'],
      ['Customer Reviews & UGC', 'customer-reviews-ugc', 'Review management and user content'],
      ['Marketplace & Multi-Channel', 'marketplace-multi-channel', 'Multi-marketplace selling tools'],
      ['Dropshipping & Sourcing', 'dropshipping-sourcing', 'Product sourcing and dropship tools'],
      ['Checkout & Payment Optimization', 'checkout-payment-optimization', 'Optimize conversion at checkout'],
      ['Returns & Logistics', 'returns-logistics', 'Returns management and shipping AI'],
      ['Subscription & Recurring Commerce', 'subscription-recurring-commerce', 'Subscription box and recurring billing'],
    ],
  },
  {
    name: 'Education & Research',
    slug: 'education-research',
    icon: '🎓',
    description: 'AI tools for learning, teaching, and academic research',
    children: [
      ['Online Learning & Tutoring', 'online-learning-tutoring', 'AI tutors and e-learning platforms'],
      ['Study & Homework Help', 'study-homework-help', 'Homework assistance and study aids'],
      ['Course & Curriculum Creation', 'course-curriculum-creation', 'Build courses and learning materials'],
      ['Quiz & Assessment', 'quiz-assessment', 'Test generation and grading tools'],
      ['Language Learning', 'language-learning', 'AI language learning apps and tools'],
      ['Research & Paper Analysis', 'research-paper-analysis', 'Academic paper search and analysis'],
      ['Scientific Computing', 'scientific-computing', 'Computational science and simulation'],
      ['Knowledge Discovery', 'knowledge-discovery', 'AI-powered knowledge mining and discovery'],
      ['Coaching & Mentoring', 'coaching-mentoring', 'AI coaching and mentoring platforms'],
      ['Library & Citation Management', 'library-citation-management', 'Reference management and citation tools'],
      ['Special Education & Accessibility', 'special-education-accessibility', 'Accessible learning and assistive tools'],
      ['Teacher & Instructor Tools', 'teacher-instructor-tools', 'Classroom management and teaching AI'],
      ['Interactive Learning & Gamification', 'interactive-learning-gamification', 'Gamified and interactive education'],
      ['Certification & Credentialing', 'certification-credentialing', 'Digital certificates and credential tools'],
    ],
  },
  {
    name: 'Finance & Accounting',
    slug: 'finance-accounting',
    icon: '💵',
    description: 'AI tools for financial management, accounting, and investment',
    children: [
      ['Accounting & Bookkeeping', 'accounting-bookkeeping', 'Automated accounting and bookkeeping'],
      ['Financial Analysis & Modeling', 'financial-analysis-modeling', 'Financial modeling and analysis tools'],
      ['Tax Preparation', 'tax-preparation', 'AI tax filing and preparation'],
      ['Invoicing & Billing', 'invoicing-billing', 'Invoice generation and billing tools'],
      ['Expense Management', 'expense-management', 'Expense tracking and reimbursement'],
      ['Investment & Trading', 'investment-trading', 'AI trading and investment analysis'],
      ['Budgeting & Forecasting', 'budgeting-forecasting', 'Budget planning and financial forecasting'],
      ['Crypto & Blockchain Analytics', 'crypto-blockchain-analytics', 'Cryptocurrency and blockchain tools'],
      ['Financial Planning & Advisory', 'financial-planning-advisory', 'Personal finance and advisory AI'],
      ['Insurance & Risk Analysis', 'insurance-risk-analysis', 'Insurance and risk assessment tools'],
      ['Payroll & Compensation', 'payroll-compensation', 'Payroll processing and compensation tools'],
      ['Fraud Detection & AML', 'fraud-detection-aml', 'Fraud prevention and anti-money laundering'],
    ],
  },
  {
    name: 'HR & Recruiting',
    slug: 'hr-recruiting',
    icon: '👥',
    description: 'AI tools for human resources, hiring, and talent management',
    children: [
      ['Resume Screening & Parsing', 'resume-screening-parsing', 'Automated resume review and ranking'],
      ['Interview & Assessment Tools', 'interview-assessment-tools', 'AI interview and skills assessment'],
      ['Job Description & Posting', 'job-description-posting', 'Generate and distribute job listings'],
      ['Talent Sourcing', 'talent-sourcing', 'Find and attract candidates with AI'],
      ['Employee Onboarding', 'employee-onboarding', 'Automated new hire onboarding'],
      ['Performance Management', 'performance-management', 'Performance reviews and goal tracking'],
      ['Workforce Analytics', 'workforce-analytics', 'People analytics and workforce planning'],
      ['Compensation & Benefits', 'compensation-benefits', 'Comp benchmarking and benefits tools'],
      ['Employee Engagement', 'employee-engagement', 'Engagement surveys and culture tools'],
      ['Learning & Development', 'learning-development', 'Employee training and upskilling'],
      ['DEI & Culture Tools', 'dei-culture-tools', 'Diversity, equity, and inclusion tools'],
      ['HR Compliance & Policy', 'hr-compliance-policy', 'HR compliance and policy management'],
    ],
  },
  {
    name: 'Legal & Compliance',
    slug: 'legal-compliance',
    icon: '⚖️',
    description: 'AI tools for legal work, contracts, and regulatory compliance',
    children: [
      ['Contract Analysis & Review', 'contract-analysis-review', 'AI contract review and redlining'],
      ['Legal Research', 'legal-research', 'Case law and legal research tools'],
      ['Compliance & Regulatory', 'compliance-regulatory', 'Regulatory compliance monitoring'],
      ['Legal Document Drafting', 'legal-document-drafting', 'Draft legal documents with AI'],
      ['IP & Patent', 'ip-patent', 'Patent search and IP management'],
      ['Privacy & Data Protection', 'privacy-data-protection', 'GDPR, privacy, and data compliance'],
      ['E-Discovery', 'e-discovery', 'Electronic discovery and litigation tools'],
      ['Legal Practice Management', 'legal-practice-management', 'Law firm management tools'],
      ['Regulatory Filing & Reporting', 'regulatory-filing-reporting', 'Regulatory submission and reporting'],
      ['Legal Billing & Time Tracking', 'legal-billing-time-tracking', 'Billable hours and legal invoicing'],
    ],
  },
  {
    name: 'Healthcare & Medical',
    slug: 'healthcare-medical',
    icon: '🏥',
    description: 'AI tools for healthcare, medical research, and wellness',
    children: [
      ['Clinical Decision Support', 'clinical-decision-support', 'AI-assisted clinical diagnosis tools'],
      ['Medical Imaging & Diagnostics', 'medical-imaging-diagnostics', 'Medical image analysis and detection'],
      ['Patient Communication', 'patient-communication', 'Patient engagement and communication'],
      ['Health Monitoring & Wearables', 'health-monitoring-wearables', 'Health tracking and wearable AI'],
      ['Mental Health & Wellness', 'mental-health-wellness', 'Mental health and therapy tools'],
      ['Medical Documentation', 'medical-documentation', 'Clinical notes and medical records AI'],
      ['Drug Discovery & Biotech', 'drug-discovery-biotech', 'AI-powered pharmaceutical research'],
      ['Telemedicine Tools', 'telemedicine-tools', 'Virtual healthcare and telehealth'],
      ['Fitness & Nutrition', 'fitness-nutrition', 'AI fitness coaching and diet planning'],
      ['Dental & Vision Tools', 'dental-vision-tools', 'Dental and optometry AI tools'],
      ['Healthcare Administration', 'healthcare-administration', 'Hospital and clinic management'],
      ['Clinical Trial Management', 'clinical-trial-management', 'Clinical research and trial tools'],
      ['Medical Education & Training', 'medical-education-training', 'Medical training and simulation'],
      ['Elder Care & Assisted Living', 'elder-care-assisted-living', 'Senior care and aging-in-place tools'],
    ],
  },
  {
    name: 'AI Agents & Infrastructure',
    slug: 'ai-agents-infrastructure',
    icon: '🤖',
    description: 'AI agent frameworks, model serving, and AI engineering tools',
    children: [
      ['Autonomous AI Agents', 'autonomous-ai-agents', 'Self-operating AI agents and assistants'],
      ['Multi-Agent Frameworks', 'multi-agent-frameworks', 'Orchestrate multiple AI agents together'],
      ['AI Content Detection', 'ai-content-detection', 'Detect AI-generated text and media'],
      ['AI Safety & Guardrails', 'ai-safety-guardrails', 'AI moderation, safety, and alignment'],
      ['LLM Orchestration & RAG', 'llm-orchestration-rag', 'RAG pipelines and LLM orchestration'],
      ['AI Evaluation & Benchmarking', 'ai-evaluation-benchmarking', 'Test and benchmark AI models'],
      ['Fine-Tuning & Training', 'fine-tuning-training', 'Model fine-tuning and training tools'],
      ['AI Deployment & Serving', 'ai-deployment-serving', 'Deploy and serve ML models at scale'],
      ['Prompt Management & Optimization', 'prompt-management-optimization', 'Manage and optimize prompts'],
      ['Model Comparison & Routing', 'model-comparison-routing', 'Compare and route between AI models'],
      ['AI Observability & Logging', 'ai-observability-logging', 'Monitor AI system performance'],
      ['Open Source Model Hubs', 'open-source-model-hubs', 'Browse and download open models'],
    ],
  },
  {
    name: 'Security & IT',
    slug: 'security-it',
    icon: '🔒',
    description: 'AI tools for cybersecurity, IT operations, and infrastructure',
    children: [
      ['Cybersecurity & Threat Detection', 'cybersecurity-threat-detection', 'Threat detection and security monitoring'],
      ['Identity & Access Management', 'identity-access-management', 'Authentication and authorization tools'],
      ['IT Operations & Monitoring', 'it-operations-monitoring', 'IT infrastructure and ops management'],
      ['Cloud Security', 'cloud-security', 'Cloud security posture management'],
      ['Email & Phishing Protection', 'email-phishing-protection', 'Email security and phishing detection'],
      ['Data Loss Prevention', 'data-loss-prevention', 'Prevent data leaks and exfiltration'],
      ['Endpoint Security', 'endpoint-security', 'Device and endpoint protection'],
      ['Network Security', 'network-security', 'Network monitoring and firewall tools'],
      ['Compliance & Audit', 'compliance-audit', 'Security compliance and audit tools'],
      ['Vulnerability & Penetration Testing', 'vulnerability-penetration-testing', 'Security testing and vulnerability scanning'],
    ],
  },
  {
    name: 'Communication & Collaboration',
    slug: 'communication-collaboration',
    icon: '💬',
    description: 'AI tools for team communication, meetings, and collaboration',
    children: [
      ['Email Management & Triage', 'email-management-triage', 'Smart email organization and prioritization'],
      ['Business Messaging & Chat', 'business-messaging-chat', 'Team messaging and chat platforms'],
      ['Video Conferencing', 'video-conferencing', 'AI-enhanced video meeting tools'],
      ['Internal Communications', 'internal-communications', 'Company-wide announcements and updates'],
      ['Collaboration Platforms', 'collaboration-platforms', 'All-in-one team collaboration tools'],
      ['Presentation & Public Speaking', 'presentation-public-speaking', 'Presentation delivery and coaching'],
      ['Whiteboard & Visual Collaboration', 'whiteboard-visual-collaboration', 'Digital whiteboards and visual tools'],
      ['Translation & Interpretation (Live)', 'translation-interpretation-live', 'Real-time translation for meetings'],
      ['Customer & Client Communication', 'customer-client-communication', 'Client-facing communication tools'],
      ['Documentation & Wiki', 'documentation-wiki', 'Team wikis and knowledge documentation'],
    ],
  },
  {
    name: 'Lifestyle & Personal',
    slug: 'lifestyle-personal',
    icon: '🌟',
    description: 'AI tools for personal life, entertainment, and daily needs',
    children: [
      ['Personal AI Assistants', 'personal-ai-assistants', 'General-purpose personal AI assistants'],
      ['Travel Planning & Booking', 'travel-planning-booking', 'Trip planning and booking AI'],
      ['Real Estate', 'real-estate', 'Property search and real estate tools'],
      ['Gaming & Game Dev', 'gaming-game-dev', 'Games, gaming, and game development'],
      ['Entertainment & Fun', 'entertainment-fun', 'Fun, humor, and entertainment AI'],
      ['Food & Recipe', 'food-recipe', 'Cooking, recipes, and meal planning'],
      ['Fashion & Style', 'fashion-style', 'Personal styling and fashion AI'],
      ['Dating & Relationships', 'dating-relationships', 'Dating profiles and relationship tools'],
      ['Sports & Fitness', 'sports-fitness', 'Sports analysis and fitness AI'],
      ['Home & Garden', 'home-garden', 'Home improvement and gardening AI'],
      ['Religion & Spirituality', 'religion-spirituality', 'Faith, meditation, and spiritual tools'],
      ['Pet Care', 'pet-care', 'Pet health and care tools'],
      ['Parenting & Family', 'parenting-family', 'Parenting advice and family tools'],
      ['Astrology & Horoscopes', 'astrology-horoscopes', 'Astrology and horoscope generators'],
      ['Gift Ideas & Shopping', 'gift-ideas-shopping', 'Gift recommendations and shopping AI'],
      ['News & Content Curation', 'news-content-curation', 'Personalized news and content feeds'],
    ],
  },
];

// ─── Mapping: Old flat categories → New subcategory slugs ─────────────────────
const OLD_TO_NEW_MAP = {
  'text-writing': 'blog-article-writing',
  'image-generation': 'ai-image-generation',
  'image-editing': 'image-editing-enhancement',
  'video-generation': 'ai-video-generation',
  'video-editing': 'video-editing',
  'voice-speech': 'text-to-speech',
  'music': 'music-generation',
  'audio-sound': 'audio-editing-enhancement',
  'transcription-captions': 'transcription-captions',
  'translation-language': 'translation-localization',
  'design': 'graphic-design',
  '3d-animation': '3d-animation',
  'photo-avatars': 'photo-avatar-creation',
  'code-development': 'code-generation-completion',
  'no-code-website-builders': 'no-code-app-builders',
  'ai-models-apis': 'ai-models-apis',
  'marketing': 'content-marketing',
  'seo': 'seo-tools',
  'social-media': 'social-media-management',
  'sales-crm': 'crm-pipeline-management',
  'productivity': 'personal-productivity',
  'automation-workflows': 'automation-workflows',
  'project-management': 'task-project-management',
  'meeting-scheduling': 'meeting-scheduling',
  'spreadsheets-data': 'spreadsheets-data-tools',
  'presentations-documents': 'presentation-design',
  'email-communication': 'email-management-triage',
  'customer-support': 'ai-chatbots',
  'chatbots-ai-assistants': 'ai-chatbots',
  'data-analysis-bi': 'business-intelligence-dashboards',
  'search-information': 'search-engines-ai-search',
  'e-commerce': 'storefront-shop-builders',
  'education-learning': 'online-learning-tutoring',
  'research-science': 'research-paper-analysis',
  'finance-accounting': 'accounting-bookkeeping',
  'human-resources-recruiting': 'resume-screening-parsing',
  'legal': 'contract-analysis-review',
  'healthcare-medical': 'clinical-decision-support',
  'ai-agents': 'autonomous-ai-agents',
  'ai-detection-safety': 'ai-content-detection',
  'art-creative': 'graphic-design',
  'gaming-entertainment': 'gaming-game-dev',
  'personal-assistant-lifestyle': 'personal-ai-assistants',
  'real-estate': 'real-estate',
  'travel-logistics': 'travel-planning-booking',
  // Legacy seed categories
  'dev-tools': 'code-generation-completion',
  'research': 'research-paper-analysis',
  'writing': 'blog-article-writing',
  'media': 'social-media-content-creation',
  'support': 'ai-chatbots',
  'assistant': 'personal-ai-assistants',
  'data-ops': 'data-cleaning-preparation',
  'video-gen': 'ai-video-generation',
  'open-source': 'open-source-model-hubs',
};

// ─── Execution ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting AI Tool Category Taxonomy Migration...\n');

  // Step 1: Insert parent categories
  console.log('📁 Creating 21 parent categories...');
  const parentIds = {};

  for (let i = 0; i < TAXONOMY.length; i++) {
    const parent = TAXONOMY[i];
    await sql`
      INSERT INTO "ToolCategory" (id, name, slug, description, icon, "parentId", level, "sortOrder", "isActive", "toolCount", "createdAt")
      VALUES (gen_random_uuid(), ${parent.name}, ${parent.slug}, ${parent.description}, ${parent.icon}, NULL, 0, ${i + 1}, true, 0, NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        "parentId" = NULL,
        level = 0,
        "sortOrder" = EXCLUDED."sortOrder",
        "isActive" = true
    `;
    const [row] = await sql`SELECT id FROM "ToolCategory" WHERE slug = ${parent.slug}`;
    parentIds[parent.slug] = row.id;
    console.log(`  ✓ ${parent.icon} ${parent.name} (${parent.children.length} subs)`);
  }

  // Step 2: Insert subcategories
  console.log('\n📂 Creating subcategories...');
  let totalSubs = 0;

  for (const parent of TAXONOMY) {
    const parentId = parentIds[parent.slug];
    for (let j = 0; j < parent.children.length; j++) {
      const [name, slug, description] = parent.children[j];
      await sql`
        INSERT INTO "ToolCategory" (id, name, slug, description, icon, "parentId", level, "sortOrder", "isActive", "toolCount", "createdAt")
        VALUES (gen_random_uuid(), ${name}, ${slug}, ${description}, NULL, ${parentId}, 1, ${j + 1}, true, 0, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          "parentId" = ${parentId},
          level = 1,
          "sortOrder" = EXCLUDED."sortOrder",
          "isActive" = true
      `;
      totalSubs++;
    }
  }
  console.log(`  ✓ ${totalSubs} subcategories created\n`);

  // Step 3: Migrate existing tools from old flat categories to new subcategories
  console.log('🔄 Migrating existing tools to new subcategories...');
  let migratedCount = 0;
  let skippedCount = 0;

  for (const [oldSlug, newSlug] of Object.entries(OLD_TO_NEW_MAP)) {
    // Get old category ID
    const oldCats = await sql`SELECT id FROM "ToolCategory" WHERE slug = ${oldSlug} LIMIT 1`;
    if (oldCats.length === 0) continue;
    const oldCatId = oldCats[0].id;

    // Get new subcategory ID
    const newCats = await sql`SELECT id FROM "ToolCategory" WHERE slug = ${newSlug} LIMIT 1`;
    if (newCats.length === 0) {
      console.log(`  ⚠ New subcategory not found: ${newSlug}`);
      skippedCount++;
      continue;
    }
    const newCatId = newCats[0].id;

    // If old and new are the same row (slug matches), skip
    if (oldCatId === newCatId) continue;

    // Migrate tools
    const result = await sql`
      UPDATE "AiTool"
      SET "categoryId" = ${newCatId}
      WHERE "categoryId" = ${oldCatId}
    `;

    const toolCount = result.length || 0;
    if (toolCount > 0) {
      console.log(`  ✓ ${oldSlug} → ${newSlug} (${toolCount} tools moved)`);
      migratedCount += toolCount;
    }
  }

  console.log(`\n  Total tools migrated: ${migratedCount}`);
  if (skippedCount > 0) console.log(`  Skipped mappings: ${skippedCount}`);

  // Step 4: Update tool counts on subcategories
  console.log('\n📊 Updating tool counts...');
  await sql`
    UPDATE "ToolCategory" tc
    SET "toolCount" = (
      SELECT COUNT(*)::int FROM "AiTool" t
      WHERE t."categoryId" = tc.id AND t."deletedAt" IS NULL
    )
    WHERE tc.level = 1
  `;

  // Update parent counts (sum of children)
  await sql`
    UPDATE "ToolCategory" parent
    SET "toolCount" = (
      SELECT COALESCE(SUM(child."toolCount"), 0)::int
      FROM "ToolCategory" child
      WHERE child."parentId" = parent.id
    )
    WHERE parent.level = 0
  `;
  console.log('  ✓ Tool counts updated\n');

  // Step 5: Deactivate old flat categories that no longer have tools
  console.log('🧹 Deactivating empty old categories...');
  const deactivated = await sql`
    UPDATE "ToolCategory"
    SET "isActive" = false
    WHERE level = 0
      AND "toolCount" = 0
      AND "parentId" IS NULL
      AND id NOT IN (SELECT id FROM "ToolCategory" WHERE slug = ANY(${Object.values(parentIds).length > 0 ? TAXONOMY.map(t => t.slug) : []}))
  `;
  console.log(`  ✓ Done\n`);

  console.log('✅ Migration complete!');
  console.log(`   Parents: ${TAXONOMY.length}`);
  console.log(`   Subcategories: ${totalSubs}`);
  console.log(`   Tools migrated: ${migratedCount}`);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
