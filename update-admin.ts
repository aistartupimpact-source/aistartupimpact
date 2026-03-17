import { prisma } from '@aistartupimpact/database';

async function main() {
  try {
    const dummyEmail = 'author@aistartupimpact.com';
    const realEmails = ['lahorivenkatesh709@gmail.com', 'lahorivenkatesh 709@gmail.com', 'lahorivenkatesh709@gmail.com'];

    const dummyUser = await prisma.user.findUnique({
      where: { email: dummyEmail },
      select: { id: true, email: true }
    });

    let realUser;
    for (const email of realEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true }
      });
      if (user) {
        realUser = user;
        break;
      }
    }

    console.log("Dummy user:", dummyUser ? dummyUser.id : "Not found");
    console.log("Real user:", realUser ? realUser.email : "Not found");

    if (!realUser) {
      console.log("Creating real user...");
      realUser = await prisma.user.create({
        data: {
          email: 'lahorivenkatesh709@gmail.com',
          name: 'Lahori Venkatesh',
          slug: 'lahori-venkatesh',
          role: 'SUPER_ADMIN'
        },
        select: { id: true, email: true, role: true }
      });
      console.log("Created real user:", realUser.id);
    } else if (realUser.role !== 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: realUser.id },
        data: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true, role: true }
      });
      console.log("Updated real user to SUPER_ADMIN");
    } else {
      console.log("User is already SUPER_ADMIN.");
    }

    if (dummyUser && realUser) {
      const articles = await prisma.article.findMany({
        where: { authorId: dummyUser.id },
        select: { id: true }
      });

      let count = 0;
      for (const article of articles) {
        await prisma.article.update({
          where: { id: article.id },
          data: { authorId: realUser.id },
          select: { id: true }
        });
        count++;
      }
      console.log(`Transferred ${count} articles to real user.`);
    }
  } catch (e) {
    console.error("Crash:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
