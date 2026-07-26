import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed canonical event tags for the normalized tag taxonomy.
 * These are the master tags that prevent duplicates like "LLM" vs "GenAI"
 * from fragmenting subscriber interest profiles.
 */
const EVENT_TAGS = [
  // Technology domains
  { name: "LLM", canonicalName: "large-language-models", category: "technology" },
  { name: "GenAI", canonicalName: "large-language-models", category: "technology" },
  { name: "Generative AI", canonicalName: "large-language-models", category: "technology" },
  { name: "Computer Vision", canonicalName: "computer-vision", category: "technology" },
  { name: "NLP", canonicalName: "natural-language-processing", category: "technology" },
  { name: "MLOps", canonicalName: "mlops", category: "technology" },
  { name: "Deep Learning", canonicalName: "deep-learning", category: "technology" },
  { name: "Reinforcement Learning", canonicalName: "reinforcement-learning", category: "technology" },
  { name: "Robotics", canonicalName: "robotics", category: "technology" },
  { name: "Speech AI", canonicalName: "speech-ai", category: "technology" },
  { name: "AI Agents", canonicalName: "ai-agents", category: "technology" },
  { name: "RAG", canonicalName: "retrieval-augmented-generation", category: "technology" },
  { name: "Fine-tuning", canonicalName: "model-fine-tuning", category: "technology" },
  { name: "Edge AI", canonicalName: "edge-ai", category: "technology" },
  { name: "Multimodal AI", canonicalName: "multimodal-ai", category: "technology" },

  // Industry verticals
  { name: "Healthcare AI", canonicalName: "ai-healthcare", category: "industry" },
  { name: "FinTech AI", canonicalName: "ai-fintech", category: "industry" },
  { name: "EdTech AI", canonicalName: "ai-edtech", category: "industry" },
  { name: "AgriTech AI", canonicalName: "ai-agritech", category: "industry" },
  { name: "Legal AI", canonicalName: "ai-legal", category: "industry" },
  { name: "Creative AI", canonicalName: "ai-creative", category: "industry" },
  { name: "AI for Good", canonicalName: "ai-for-good", category: "industry" },

  // Topics
  { name: "AI Ethics", canonicalName: "ai-ethics", category: "topic" },
  { name: "AI Safety", canonicalName: "ai-safety", category: "topic" },
  { name: "AI Regulation", canonicalName: "ai-regulation", category: "topic" },
  { name: "Open Source AI", canonicalName: "open-source-ai", category: "topic" },
  { name: "AI Startups", canonicalName: "ai-startups", category: "topic" },
  { name: "AI Funding", canonicalName: "ai-funding", category: "topic" },
  { name: "AI Careers", canonicalName: "ai-careers", category: "topic" },
  { name: "AI Research", canonicalName: "ai-research", category: "topic" },
  { name: "AI Infrastructure", canonicalName: "ai-infrastructure", category: "topic" },
  { name: "Prompt Engineering", canonicalName: "prompt-engineering", category: "topic" },
];

async function main() {
  console.log("Seeding event tags...");

  for (const tag of EVENT_TAGS) {
    await prisma.eventTag.upsert({
      where: { name: tag.name },
      update: { canonicalName: tag.canonicalName, category: tag.category },
      create: tag,
    });
  }

  console.log(`Seeded ${EVENT_TAGS.length} event tags.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
