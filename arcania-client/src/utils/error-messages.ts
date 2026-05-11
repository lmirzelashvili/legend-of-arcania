// Error message sanitizer — converts raw server/network errors to user-friendly strings.
// Components will adopt getUserFriendlyError() in a later phase.

import { FetchClientError } from '@/services/api/client';

// ==================== ERROR PATTERN MAP ====================
// Maps substrings of raw server error messages to user-friendly replacements.
// Patterns are matched case-insensitively and checked in order; first match wins.

export const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Prisma / database internals — never expose these
  'prisma': 'Something went wrong. Please try again.',
  'unique constraint': 'That value is already taken.',
  'foreign key constraint': 'Something went wrong. Please try again.',
  'database': 'Something went wrong. Please try again.',
  'p2002': 'That value is already taken.',
  'p2025': 'The requested item could not be found.',

  // Auth errors — keep these as informative but safe
  'invalid email or password': 'Invalid email or password.',
  'invalid credentials': 'Invalid email or password.',
  'email already in use': 'That email address is already registered.',
  'username already taken': 'That username is already taken.',
  'username already in use': 'That username is already taken.',
  'email already exists': 'That email address is already registered.',
  'token expired': 'Your session has expired. Please log in again.',
  'invalid token': 'Your session is invalid. Please log in again.',
  'unauthorized': 'You must be logged in to do that.',

  // Character errors
  'character not found': 'Character not found.',
  'not enough gold': 'You do not have enough gold.',
  'not enough arcanite': 'You do not have enough Arcanite.',
  'insufficient gold': 'You do not have enough gold.',
  'insufficient arcanite': 'You do not have enough Arcanite.',
  'inventory full': 'Your inventory is full.',
  'item not found': 'Item not found.',
  'already equipped': 'That item is already equipped.',
  'cannot equip': 'You cannot equip that item.',
  'not enough stat points': 'You do not have enough stat points.',

  // Marketplace / trading errors
  'listing not found': 'That listing could not be found.',
  'cannot buy your own': 'You cannot purchase your own listing.',
  'trade not found': 'That trade could not be found.',
  'trade expired': 'This trade has expired.',

  // Vault errors
  'vault full': 'Your vault is full.',
  'vault not found': 'Vault not found.',

  // Network / connectivity
  'failed to fetch': 'Could not connect to the server. Please check your connection.',
  'networkerror': 'Could not connect to the server. Please check your connection.',
  'network error': 'Could not connect to the server. Please check your connection.',
  'timeout': 'The request timed out. Please try again.',

  // Generic server errors
  'internal server error': 'Something went wrong. Please try again.',
  'service unavailable': 'The server is temporarily unavailable. Please try again later.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

// ==================== MAIN MAPPER ====================

/**
 * Converts any thrown error value into a user-friendly display string.
 *
 * Resolution order:
 *  1. If it is a FetchClientError, use its message (already extracted from the
 *     server response body by the fetch client).
 *  2. If it is a plain Error, use its message.
 *  3. If it is a string, use it directly.
 *  4. Otherwise, fall back to the generic message.
 *
 * The resolved raw message is then checked against ERROR_MESSAGE_MAP; if a
 * pattern matches (case-insensitive substring), the mapped friendly string is
 * returned instead.
 */
export function getUserFriendlyError(error: unknown): string {
  const raw = extractRawMessage(error);
  return sanitizeMessage(raw);
}

// ==================== HELPERS ====================

function extractRawMessage(error: unknown): string {
  if (error instanceof FetchClientError) {
    return error.message || FALLBACK_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message || FALLBACK_MESSAGE;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  return FALLBACK_MESSAGE;
}

function sanitizeMessage(raw: string): string {
  const lower = raw.toLowerCase();

  for (const [pattern, friendly] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (lower.includes(pattern)) {
      return friendly;
    }
  }

  // If the raw message looks like a technical string (stack trace, Prisma model
  // path, SQL fragment, etc.) fall back to generic rather than showing it raw.
  if (looksLikeTechnical(raw)) {
    return FALLBACK_MESSAGE;
  }

  return raw;
}

/**
 * Returns true when the message string contains indicators of internal/technical
 * content that should never be shown to a player.
 */
function looksLikeTechnical(msg: string): boolean {
  const technicalPatterns = [
    /at\s+\w+\s*\(/,          // Stack trace frame: "at functionName ("
    /^\s*Error:/,              // Plain Error prefix
    /PrismaClient/,            // Prisma class names
    /\bSQL\b/i,                // Raw SQL references
    /\bstack\b.*:\s*\n/i,     // "stack: \n..."
    /\[\s*object Object\s*\]/, // Serialized object leak
  ];

  return technicalPatterns.some(re => re.test(msg));
}
