/**
 * Shortens a base58 Solana address to the form: XXXX…XXXX (first 4 + last 4 chars).
 */
export function shortenAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
