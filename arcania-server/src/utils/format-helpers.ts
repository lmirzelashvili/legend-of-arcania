/**
 * Convert a camelCase stat key into a human-readable label.
 * e.g. "physicalAttack" → "Physical Attack"
 */
export function formatStatName(stat: string): string {
  return stat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}
