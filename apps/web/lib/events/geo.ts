/**
 * Geo-distance utilities for event subscriber targeting.
 *
 * Uses the Haversine formula for client-side calculations and
 * PostgreSQL's earthdistance extension for database queries.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Generate a raw SQL clause for finding subscribers within a radius.
 * Uses PostgreSQL's earthdistance extension (cube + earthdistance).
 *
 * @param lat - Event latitude
 * @param lng - Event longitude
 * @param radiusKm - Radius in kilometers
 * @returns SQL WHERE clause fragment
 */
export function geoRadiusWhereClause(
  lat: number,
  lng: number,
  radiusKm: number
): string {
  const radiusMeters = radiusKm * 1000;
  return `earth_distance(
    ll_to_earth("locationLat", "locationLng"),
    ll_to_earth(${lat}, ${lng})
  ) <= ${radiusMeters}`;
}

/**
 * Generate a raw SQL ORDER BY clause for sorting by proximity.
 */
export function geoDistanceOrderClause(lat: number, lng: number): string {
  return `earth_distance(
    ll_to_earth("locationLat", "locationLng"),
    ll_to_earth(${lat}, ${lng})
  ) ASC`;
}
