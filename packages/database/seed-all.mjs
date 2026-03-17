// Run: npx dotenv-cli -e .env -- node packages/database/seed-all.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const ADMIN_EMAIL = 'lahorivenkatesh709@gmail.com';

async function main() {
  console.log('🌱 Starting seed...');

  // Find admin
  const [admin] = await sql`SELECT id, name FROM "User" WHERE email = ${ADMIN_EMAIL} LIMIT 1`;
  if (!admin) throw new Error(`Admin not found: ${ADMIN_EMAIL}`);
  console.log(`✅ Admin: ${admin.name} (${admin.id})`);

  // ── Categories ──────────────────────────────────────────────────────────────
  const catList = [
    ['AI News','ai-news'], ['Deep Dive','deep-dive'], ['Founder Stories','founder-stories'],
    ['Funding','funding'], ['Policy','policy'], ['Tech Review','tech-review'],
    ['Ecosystem','ecosystem'], ['Product Launches','product-launches'], ['Startups','startups'],
    ['Public Tech','public-tech'], ['Telecom','telecom'], ['AgriTech','agritech'],
  ];
  const cats = {};
  for (const [name, slug] of catList) {
    await sql`INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt") VALUES (gen_random_uuid(), ${name}, ${slug}, NOW(), NOW()) ON CONFLICT (slug) DO NOTHING`;
    const [row] = await sql`SELECT id FROM "Category" WHERE slug = ${slug}`;
    cats[slug] = row.id;
  }
  console.log(`✅ ${catList.length} categories ready`);

  // ── Tool Categories ──────────────────────────────────────────────────────────
  const tcList = [
    ['Dev Tools','dev-tools'], ['Research','research'], ['Design','design'],
    ['Productivity','productivity'], ['Open Source','open-source'], ['Writing','writing'],
    ['Media','media'], ['Marketing','marketing'], ['Support','support'],
    ['Assistant','assistant'], ['Data Ops','data-ops'], ['Video Gen','video-gen'],
  ];
  const tcs = {};
  for (const [name, slug] of tcList) {
    await sql`INSERT INTO "ToolCategory" (id, name, slug, "createdAt") VALUES (gen_random_uuid(), ${name}, ${slug}, NOW()) ON CONFLICT (slug) DO NOTHING`;
    const [row] = await sql`SELECT id FROM "ToolCategory" WHERE slug = ${slug}`;
    tcs[slug] = row.id;
  }
  console.log(`✅ ${tcList.length} tool categories ready`);

  // ── Helper: upsert article ───────────────────────────────────────────────────
  async function upsertArticle({ slug, title, excerpt, type, catId, img, thumb, featured, mins, authorId }) {
    const content = JSON.stringify({ html: `<p>${excerpt}</p>` });
    const thumbnailUrl = thumb || img; // fallback to coverImage if no thumb
    await sql`
      INSERT INTO "Article" (id, title, slug, excerpt, content, type, status, "authorId", "categoryId", "coverImage", "thumbnailImage", "isFeatured", "readTimeMinutes", "publishedAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${title}, ${slug}, ${excerpt}, ${content}::jsonb, ${type}::"ArticleType", 'PUBLISHED'::"ArticleStatus", ${authorId}, ${catId}, ${img}, ${thumbnailUrl}, ${featured}, ${mins}, NOW(), NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        "coverImage" = EXCLUDED."coverImage",
        "thumbnailImage" = EXCLUDED."thumbnailImage",
        "isFeatured" = EXCLUDED."isFeatured",
        status = 'PUBLISHED'::"ArticleStatus",
        "updatedAt" = NOW()
    `;
  }

  // ── News Articles ────────────────────────────────────────────────────────────
  const news = [
    { slug:'india-ai-revolution-2026', title:'The Rise of Indic LLMs: How Indian Startups Are Building AI for a Billion Voices in 2026', excerpt:"With Sarvam AI OpenHathi and Ola Krutrim dominating the landscape, the focus has shifted entirely to vernacular AI. Indian AI companies raised over $3.5 billion to solve the multilingual challenge.", cat:'deep-dive', type:'NEWS', featured:true, mins:14, img:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=450&fit=crop&q=80' },
    { slug:'krutrim-1b-valuation', title:"Ola Krutrim Reaches $1B Valuation, Becoming India's First AI Unicorn", excerpt:"Ola's AI subsidiary Krutrim has crossed the billion-dollar valuation mark, cementing its position as India's first AI unicorn after a landmark funding round.", cat:'funding', type:'NEWS', featured:true, mins:5, img:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=450&fit=crop&q=80' },
    { slug:'sarvam-ai-open-sources-hindi-llm', title:'Sarvam AI Open-Sources Its Foundational Hindi LLM Series', excerpt:'In a major move for the Indian AI ecosystem, Sarvam AI has released its Hindi language model series under an open-source license, enabling developers across India to build on top of it.', cat:'ai-news', type:'NEWS', featured:false, mins:6, img:'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&h=450&fit=crop&q=80' },
    { slug:'nvidia-reliance-ai-infrastructure', title:'NVIDIA Partners with Reliance to Build Massive AI Infrastructure in India', excerpt:"NVIDIA and Reliance Industries have announced a landmark partnership to deploy thousands of H100 GPUs across India, creating the country's largest AI compute infrastructure.", cat:'ecosystem', type:'NEWS', featured:false, mins:7, img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=450&fit=crop&q=80' },
    { slug:'indiaai-mission-10372-crore', title:"Cabinet Approves Rs 10372 Crore IndiaAI Mission to Bolster Domestic Innovation", excerpt:"The Indian government has approved a massive Rs 10,372 crore mission to accelerate AI research, infrastructure, and talent development across the country.", cat:'policy', type:'NEWS', featured:false, mins:8, img:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=450&fit=crop&q=80' },
    { slug:'bhashini-digital-public-good', title:'Bhashini: The Digital Public Good Revolutionizing Cross-Language Communication', excerpt:"India's Bhashini platform is breaking language barriers by providing free AI-powered translation across 22 official languages, transforming how a billion people access digital services.", cat:'public-tech', type:'NEWS', featured:false, mins:6, img:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=450&fit=crop&q=80' },
    { slug:'reliance-jio-ai-next-billion', title:'Why Reliance Jio is Banking Heavily on AI for the Next Billion Users', excerpt:"Reliance Jio's aggressive AI strategy targets India's next wave of internet users with vernacular AI assistants, smart home devices, and AI-powered telecom services.", cat:'telecom', type:'NEWS', featured:false, mins:9, img:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=450&fit=crop&q=80' },
    { slug:'ai-agriculture-supply-chain-india', title:'Startups Using AI to Solve Agriculture Supply Chain Issues in Rural India', excerpt:'A new wave of agri-tech startups is deploying AI to reduce post-harvest losses, optimize supply chains, and connect farmers directly to markets across rural India.', cat:'agritech', type:'NEWS', featured:false, mins:7, img:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=450&fit=crop&q=80' },
    { slug:'bengaluru-hyderabad-ai-hubs', title:'Why Global Tech Leaders Are Setting Up AI Hubs in Bengaluru and Hyderabad', excerpt:"From Google's AI research center to Microsoft's AI hub, global tech giants are doubling down on India's twin tech cities as the next frontier for AI innovation.", cat:'ecosystem', type:'NEWS', featured:false, mins:9, img:'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=450&fit=crop&q=80' },
    { slug:'qure-ai-65m-series-d', title:'Qure.ai Secures $65M Series D to Expand AI Healthcare Diagnostics Globally', excerpt:"Mumbai-based Qure.ai has raised $65M in a Series D round to scale its AI-powered radiology diagnostics platform to hospitals across Asia, Africa, and Latin America.", cat:'funding', type:'NEWS', featured:false, mins:5, img:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80', thumb:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=450&fit=crop&q=80' },
  ];
  console.log('\n📰 Seeding news articles...');
  for (const a of news) {
    await upsertArticle({ slug:a.slug, title:a.title, excerpt:a.excerpt, type:a.type, catId:cats[a.cat], img:a.img, thumb:a.thumb, featured:a.featured, mins:a.mins, authorId:admin.id });
    console.log(`  ✅ ${a.slug}`);
  }
  // ── Founder Stories ──────────────────────────────────────────────────────────
  const stories = [
    { slug:'pratyush-kumar-sarvam', title:'Building Sarvam AI: Pratyush Kumar on the Mission to Democratize Vernacular Intelligence for India', excerpt:"From co-founding AI4Bharat to raising a massive $41M Series A for Sarvam AI, Pratyush Kumar and Vivek Raghavan are leading the charge in building foundational AI models tailored specifically for India.", featured:true, mins:12, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
    { slug:'bhavish-aggarwal-krutrim', title:"Bhavish Aggarwal's Krutrim Bet: Building India's Own AI Stack from Scratch", excerpt:"The Ola founder explains why he believes India needs its own foundational AI models, and how Krutrim is building the full stack from chips to applications to make that happen.", featured:true, mins:10, img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80' },
    { slug:'anima-anandkumar-ai-research', title:"Anima Anandkumar: From IIT Madras to Caltech Shaping the Future of AI Research", excerpt:"One of the world's leading AI researchers talks about her journey, the importance of diversity in AI, and why she believes India's mathematical tradition gives it a unique edge in AI research.", featured:false, mins:15, img:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80' },
    { slug:'krutrim-base-pro-technical-breakdown', title:'Krutrim Base and Pro Models: A Technical Breakdown for Indic Developers', excerpt:"A deep technical analysis of Krutrim's model architecture, training data composition, benchmark performance across Indic languages, and how it compares to GPT-4 and Claude for Indian use cases.", featured:false, mins:7, img:'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80' },
    { slug:'nikhil-kamath-ai-investing', title:"Nikhil Kamath on Why He's Betting Big on Indian AI Startups in 2026", excerpt:"The Zerodha co-founder and prolific angel investor shares his thesis on Indian AI, the sectors he's most excited about, and why he thinks the next Google could come from Bangalore.", featured:false, mins:8, img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80' },
    { slug:'deepinder-goyal-zomato-ai', title:"Deepinder Goyal on Zomato's AI Transformation: We're Becoming an AI Company", excerpt:"The Zomato CEO reveals how AI is reshaping every aspect of the food delivery giant from demand forecasting and route optimization to personalized recommendations and customer service.", featured:false, mins:11, img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80' },
  ];
  console.log('\n📖 Seeding founder stories...');
  for (const s of stories) {
    await upsertArticle({ slug:s.slug, title:s.title, excerpt:s.excerpt, type:'STORY', catId:cats['founder-stories'], img:s.img, featured:s.featured, mins:s.mins, authorId:admin.id });
    console.log(`  ✅ ${s.slug}`);
  }
  // ── Funding Digests ──────────────────────────────────────────────────────────
  const digests = [
    { slug:'funding-digest-mar-7-2025', title:'Funding Digest 12 Sarvam AI raises Rs 415Cr MedAI Health closes seed and more', excerpt:'This week saw Rs 548Cr flow into Indian AI startups across 4 deals. Sarvam AI leads with a massive Series A, while healthcare and agri-tech continue attracting investor interest.', mins:5, img:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
    { slug:'funding-digest-feb-28-2025', title:'Funding Digest 11 LendAI raises Rs 250Cr NeuralScale grows GPU cloud', excerpt:'LendAI closes a landmark Series B as NeuralScale expands its GPU cloud infrastructure. A strong week for fintech and infrastructure plays in Indian AI.', mins:5, img:'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80' },
    { slug:'funding-digest-feb-21-2025', title:'Funding Digest 10 PadhAI gets Rs 33Cr to teach AI in 10 Indian languages', excerpt:'EdTech startup PadhAI closes a seed round to expand its AI tutoring platform to 10 Indian languages, targeting 200 million students in Tier 2 and Tier 3 cities.', mins:4, img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80' },
    { slug:'funding-digest-feb-14-2025', title:'Funding Digest 9 GreenAI closes Rs 300Cr Series B for clean energy AI', excerpt:'GreenAI raises a massive Series B to deploy AI-powered energy optimization across Indian industrial facilities, targeting a 30% reduction in energy consumption.', mins:5, img:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80' },
    { slug:'funding-digest-feb-7-2025', title:'Funding Digest 8 Q4 2024 wrap-up Rs 3100Cr across 34 deals', excerpt:'Our comprehensive Q4 2024 funding roundup: 34 deals totaling Rs 3,100Cr across AI startups in India. LLMs, HealthTech, and FinTech dominated investor attention.', mins:8, img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  ];
  console.log('\n💰 Seeding funding digests...');
  for (const d of digests) {
    await upsertArticle({ slug:d.slug, title:d.title, excerpt:d.excerpt, type:'REPORT', catId:cats['funding'], img:d.img, featured:false, mins:d.mins, authorId:admin.id });
    console.log(`  ✅ ${d.slug}`);
  }
  // ── AI Tools ─────────────────────────────────────────────────────────────────
  const tools = [
    { slug:'cursor', name:'Cursor', tagline:'AI-first code editor that writes edits and debugs for you', tc:'dev-tools', pricing:'FREEMIUM', rating:4.8, desc:'Cursor is an AI-first code editor built on VS Code with Composer for multi-file edits, inline code generation, and an AI chat that understands your entire codebase.', url:'https://cursor.sh' },
    { slug:'perplexity', name:'Perplexity', tagline:'AI search engine with cited sources and zero hallucinations', tc:'research', pricing:'FREEMIUM', rating:4.8, desc:'Perplexity is an AI-powered search engine that provides direct answers with cited sources, replacing traditional search for research queries.', url:'https://perplexity.ai' },
    { slug:'midjourney', name:'Midjourney', tagline:'The gold standard for AI image generation and design', tc:'design', pricing:'PAID', rating:4.7, desc:'Midjourney is the leading AI image generation platform, known for its exceptional artistic quality and creative capabilities.', url:'https://midjourney.com' },
    { slug:'v0-dev', name:'v0.dev', tagline:'AI-powered UI generation from text prompts by Vercel', tc:'dev-tools', pricing:'FREEMIUM', rating:4.6, desc:'v0.dev by Vercel generates production-ready React UI components from text descriptions, dramatically accelerating frontend development.', url:'https://v0.dev' },
    { slug:'claude', name:'Claude', tagline:"Anthropic conversational AI with 200K context window", tc:'productivity', pricing:'FREEMIUM', rating:4.7, desc:"Anthropic's Claude is a conversational AI assistant with a 200K token context window, ideal for long-document analysis and complex reasoning tasks.", url:'https://claude.ai' },
    { slug:'hugging-face', name:'Hugging Face', tagline:'The open-source AI community models datasets spaces', tc:'open-source', pricing:'FREE', rating:4.9, desc:'Hugging Face is the central hub for open-source AI, hosting thousands of models, datasets, and interactive Spaces for the ML community.', url:'https://huggingface.co' },
    { slug:'notion-ai', name:'Notion AI', tagline:'AI writing assistant built into your workspace', tc:'writing', pricing:'PAID', rating:4.4, desc:'Notion AI integrates AI writing assistance directly into the Notion workspace, offering summarization, Q&A, and content generation.', url:'https://notion.so' },
    { slug:'gamma', name:'Gamma', tagline:'AI-powered presentations from text beautiful slides in seconds', tc:'productivity', pricing:'FREEMIUM', rating:4.6, desc:'Gamma generates beautiful, professional presentations from text input in seconds, eliminating the need for manual slide design.', url:'https://gamma.app' },
    { slug:'descript', name:'Descript', tagline:'AI-powered video and podcast editing platform', tc:'media', pricing:'FREEMIUM', rating:4.5, desc:'Descript lets you edit video and audio by editing text transcripts, with AI features for filler word removal, voice cloning, and screen recording.', url:'https://descript.com' },
    { slug:'replit-ai', name:'Replit AI', tagline:'AI-powered cloud IDE with code generation and deployment', tc:'dev-tools', pricing:'FREEMIUM', rating:4.5, desc:'Replit AI is a cloud-based IDE with integrated AI that can generate, explain, and deploy full applications from natural language prompts.', url:'https://replit.com' },
    { slug:'jasper', name:'Jasper', tagline:'Enterprise AI content platform for marketing teams', tc:'marketing', pricing:'PAID', rating:4.3, desc:'Jasper is an enterprise AI content platform designed for marketing teams, offering brand-consistent copy generation at scale.', url:'https://jasper.ai' },
    { slug:'intercom-fin', name:'Intercom Fin', tagline:'AI customer service agent that resolves 50 percent of queries', tc:'support', pricing:'PAID', rating:4.4, desc:'Intercom Fin is an AI customer service agent that autonomously resolves customer queries using your documentation, reducing support ticket volume by up to 50%.', url:'https://intercom.com' },
  ];
  console.log('\n🔧 Seeding AI tools...');
  for (const t of tools) {
    const featured = t.rating >= 4.7;
    await sql`
      INSERT INTO "AiTool" (id, name, slug, tagline, description, "websiteUrl", "categoryId", "pricingModel", "avgRating", status, "isFeatured", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${t.name}, ${t.slug}, ${t.tagline}, ${t.desc}, ${t.url}, ${tcs[t.tc]}, ${t.pricing}::"PricingModel", ${t.rating}, 'APPROVED'::"ToolApprovalStatus", ${featured}, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, tagline = EXCLUDED.tagline, "avgRating" = EXCLUDED."avgRating", status = 'APPROVED'::"ToolApprovalStatus", "updatedAt" = NOW()
    `;
    console.log(`  ✅ ${t.name}`);
  }
  // ── Startups + Funding Rounds ─────────────────────────────────────────────────
  const startups = [
    { slug:'sarvam-ai', name:'Sarvam AI', tagline:'India-first foundation models for enterprise', desc:'Sarvam AI builds foundational AI models optimized for Indian languages and enterprise use cases, with a focus on vernacular NLP and speech recognition.', stage:'SERIES_A', city:'Bangalore', emp:80, score:92, funding:'41500000000', round:'Series A', investors:['Lightspeed','Peak XV'] },
    { slug:'medai-health', name:'MedAI Health', tagline:'AI diagnostics for rural healthcare', desc:'MedAI Health deploys AI-powered diagnostic tools in rural healthcare centers, enabling early detection of diseases with limited medical infrastructure.', stage:'SEED', city:'Chennai', emp:35, score:88, funding:'8300000000', round:'Seed', investors:['Sequoia Scout','AngelList'] },
    { slug:'krutrim', name:'Krutrim', tagline:"India's own AI foundation model by Ola", desc:"Krutrim is Ola's AI subsidiary building India's own foundational AI models, from chips to applications, with deep support for all 22 official Indian languages.", stage:'SERIES_B', city:'Bangalore', emp:300, score:95, funding:'500000000000', round:'Series B', investors:['Matrix Partners India'] },
    { slug:'agribot-tech', name:'AgriBot Tech', tagline:'AI-powered precision farming for Indian agriculture', desc:'AgriBot Tech uses AI and IoT sensors to enable precision farming, helping Indian farmers optimize water usage, predict crop diseases, and maximize yields.', stage:'SERIES_A', city:'Pune', emp:45, score:79, funding:'5000000000', round:'Series A', investors:['Omnivore','Accel'] },
    { slug:'lendai', name:'LendAI', tagline:'NLP credit scoring for underserved borrowers', desc:'LendAI uses natural language processing and alternative data to provide credit scores for the 400 million Indians without formal credit history.', stage:'SERIES_B', city:'Mumbai', emp:120, score:85, funding:'25000000000', round:'Series B', investors:['Tiger Global','Sequoia India'] },
    { slug:'padhai', name:'PadhAI', tagline:'AI tutoring in 10 Indian languages', desc:'PadhAI provides personalized AI tutoring in 10 Indian languages, making quality education accessible to students in Tier 2 and Tier 3 cities.', stage:'SEED', city:'Delhi', emp:25, score:76, funding:'3300000000', round:'Seed', investors:['Blume Ventures','Kalaari Capital'] },
    { slug:'neuralscale', name:'NeuralScale', tagline:'GPU cloud infrastructure with Mumbai data residency', desc:'NeuralScale provides enterprise-grade GPU cloud infrastructure with data centers in Mumbai, ensuring data residency compliance for Indian AI companies.', stage:'SERIES_A', city:'Hyderabad', emp:60, score:82, funding:'16600000000', round:'Series A', investors:['Nexus Venture Partners'] },
    { slug:'codeassist', name:'CodeAssist', tagline:'AI pair programmer for Indian tech teams', desc:'CodeAssist is an AI pair programming tool built specifically for Indian development teams, with support for Indian coding patterns, local frameworks, and vernacular comments.', stage:'PRE_SEED', city:'Bangalore', emp:12, score:68, funding:'1200000000', round:'Pre-Seed', investors:['100X.VC'] },
  ];
  console.log('\n🚀 Seeding startups...');
  for (const s of startups) {
    const isFeatured = s.score >= 90;
    await sql`
      INSERT INTO "Startup" (id, name, slug, tagline, description, stage, "headquartersCity", "employeeCount", "impactScore", "isIndian", "isFeatured", "totalFundingInr", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${s.name}, ${s.slug}, ${s.tagline}, ${s.desc}, ${s.stage}::"StartupStage", ${s.city}, ${s.emp}, ${s.score}, true, ${isFeatured}, ${s.funding}::bigint, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, tagline = EXCLUDED.tagline, stage = EXCLUDED.stage, "impactScore" = EXCLUDED."impactScore", "updatedAt" = NOW()
    `;
    const [startup] = await sql`SELECT id FROM "Startup" WHERE slug = ${s.slug}`;
    const [existing] = await sql`SELECT id FROM "FundingRound" WHERE "startupId" = ${startup.id} AND "roundType" = ${s.round} LIMIT 1`;
    if (!existing) {
      await sql`
        INSERT INTO "FundingRound" (id, "startupId", "roundType", "amountInr", "announcedAt", "leadInvestors", "allInvestors", "createdAt")
        VALUES (gen_random_uuid(), ${startup.id}, ${s.round}, ${s.funding}::bigint, NOW(), ${s.investors}::text[], ${s.investors}::text[], NOW())
      `;
    }
    console.log(`  ✅ ${s.name}`);
  }
  console.log('\n🎉 Seed complete! All mock data is now in the database.');
}
main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
