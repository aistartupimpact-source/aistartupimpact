/**
 * Format paise (integer) to INR display string.
 * Example: 1500000 → "₹15,000"
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Convert rupees to paise for storage.
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees for display.
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format large numbers with Cr/L suffixes (Indian notation).
 * Example: 75000000 (paise) → "₹7.5L"
 */
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees}`;
}
