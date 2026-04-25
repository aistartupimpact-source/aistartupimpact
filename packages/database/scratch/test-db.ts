import { getAiToolBySlugDirect } from '../apps/web/lib/db';
import 'dotenv/config';

async function check() {
  const tool = await getAiToolBySlugDirect('cursor');
  console.log("DB Tool:", tool ? `Found, reviews length: ${tool.userReviews?.length}` : "Not found!");
  if (tool) console.log(tool.userReviews);
}
check();
