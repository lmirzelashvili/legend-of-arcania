import { clusterApiUrl } from '@solana/web3.js';

export const SOLANA_NETWORK = 'devnet' as const;

export const SOLANA_RPC_ENDPOINT = clusterApiUrl('devnet');

/** ARC SPL token deployed on Solana devnet. */
export const ARC_MINT_DEVNET = 'DcYWNXRrXzQcNgYPu8e6fcn4gk4pwqEJhR8TJPzN5Tu8';

/** Treasury holding the initial 100M ARC supply (devnet). */
export const ARC_TREASURY_ATA_DEVNET = 'AGfU3mincahSWPSD53XL2RRfUNa6SHPhE3S4TaM7Huct';

/** Total supply minted at genesis. */
export const ARC_TOTAL_SUPPLY = 100_000_000;

/** Set to false now that the real mint address is live. */
export const ARC_MINT_PLACEHOLDER = false;

export const ARC_DECIMALS = 9;
