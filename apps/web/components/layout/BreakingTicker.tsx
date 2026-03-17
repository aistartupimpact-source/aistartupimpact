import { getActiveBreakingTickers } from '@/lib/db';
import BreakingTickerClient from './BreakingTickerClient';

export default async function BreakingTicker() {
  let breakingItems: string[] = [];
  try {
    breakingItems = await getActiveBreakingTickers();
  } catch {
    // falls back to defaults in client component
  }
  return <BreakingTickerClient items={breakingItems} />;
}
