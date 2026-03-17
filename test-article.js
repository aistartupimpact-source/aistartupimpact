const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const authorId = 'ab688fe9-886e-4f0b-b4c5-7b76c1052bd6';

  const data = {
    title: "Test Article Debug",
    slug: "test-article-debug-55",
    excerpt: "Testing",
    content: "<p>test</p>",
    type: 'NEWS',
    status: 'DRAFT',
    authorId
  };

  try {
    const article = await prisma.article.create({
      data
    });
    console.log("Success:", article.id);
  } catch (error) {
    console.error("Crash:", error.message);
  }
}
test();
