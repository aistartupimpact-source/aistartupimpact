import { getMyPlacementsAction, getPlacementStatsAction } from './actions';
import MyPlacementsClient from './MyPlacementsClient';

export default async function MyPlacementsPage() {
  const [campaignsRes, statsRes] = await Promise.all([
    getMyPlacementsAction(),
    getPlacementStatsAction(),
  ]);

  return (
    <MyPlacementsClient
      campaigns={campaignsRes.data || []}
      stats={statsRes.data || { total: 0, active: 0, impressions: 0, clicks: 0 }}
    />
  );
}
