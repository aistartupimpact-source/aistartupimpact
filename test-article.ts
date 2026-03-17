import { prisma } from './packages/database/src/client';
import crypto from 'crypto';

async function test() {
  const payload = {
    title: "India AI Revolution",
    subtitle: "Testing",
    content: "<p>test</p>",
    type: "NEWS",
    status: "DRAFT"
  };
  const authorId = 'ab688fe9-886e-4f0b-b4c5-7b76c1052bd6';

  let baseSlug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let finalSlug = baseSlug;
  
  let isUnique = false;
  let counter = 1;
  while (!isUnique) {
    const existing = await prisma.article.findUnique({
      where: { slug: finalSlug },
      select: { id: true }
    });

    if (!existing) {
      isUnique = true;
    } else {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const data: any = {
    title: payload.title,
    slug: finalSlug,
    excerpt: payload.subtitle,
    content: payload.content,
    type: payload.type || 'NEWS',
    status: payload.status || 'DRAFT',
  };

  try {
    const article = await prisma.article.create({
      data: {
        ...data,
        authorId,
      },
    });
    console.log("Success:", article.id);
  } catch (error: any) {
    console.error("Crash:", error.message);
  }
}
test();
