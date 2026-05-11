// Route-level input validation helpers
import { AppError } from '../middleware/errors.js';

/** Assert value is one of the enum's values */
export function validateEnum<T extends Record<string, string>>(
  value: unknown,
  enumObj: T,
  label: string
): string {
  const valid = Object.values(enumObj);
  if (typeof value !== 'string' || !valid.includes(value)) {
    throw new AppError(400, `Invalid ${label}. Must be one of: ${valid.join(', ')}`);
  }
  return value;
}

/** Assert value is a finite number (not NaN/Infinity). Returns the number or undefined if input is falsy. */
export function safeNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new AppError(400, `Invalid ${label}: must be a number`);
  }
  return n;
}

/** Assert value is a positive integer. */
export function requirePositiveInt(value: unknown, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError(400, `${label} must be a positive integer`);
  }
  return n;
}

/** Assert value is a non-negative integer (0 allowed). */
export function requireNonNegativeInt(value: unknown, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new AppError(400, `${label} must be a non-negative integer`);
  }
  return n;
}

/** Assert value is a non-empty string. */
export function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(400, `${label} is required`);
  }
  return value.trim();
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Assert value is a valid UUID string. */
export function validateUUID(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
    throw new AppError(400, `${label} must be a valid UUID`);
  }
  return value;
}

/** Assert gender is 'male' or 'female'. */
export function validateGender(value: unknown): 'male' | 'female' {
  if (value !== 'male' && value !== 'female') {
    throw new AppError(400, `gender must be 'male' or 'female'`);
  }
  return value;
}

export interface TradeItem {
  inventoryItemId: string;
  quantity: number;
}

/** Assert trade items array has correct structure: [{ inventoryItemId: string, quantity: number }]. */
export function validateTradeItems(value: unknown): TradeItem[] {
  if (!Array.isArray(value)) {
    throw new AppError(400, 'items must be an array');
  }
  return value.map((item: unknown, index: number) => {
    if (typeof item !== 'object' || item === null) {
      throw new AppError(400, `items[${index}] must be an object`);
    }
    const obj = item as Record<string, unknown>;
    if (typeof obj.inventoryItemId !== 'string' || obj.inventoryItemId.trim().length === 0) {
      throw new AppError(400, `items[${index}].inventoryItemId is required`);
    }
    const qty = Number(obj.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new AppError(400, `items[${index}].quantity must be a positive integer`);
    }
    return { inventoryItemId: obj.inventoryItemId.trim(), quantity: qty };
  });
}

/** Assert extraCrystals has correct structure: { spiritCount?: number, dominionCount?: number }. */
export function validateExtraCrystals(
  value: unknown,
): { spiritCount?: number; dominionCount?: number } | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(400, 'extraCrystals must be an object');
  }
  const obj = value as Record<string, unknown>;
  const result: { spiritCount?: number; dominionCount?: number } = {};
  if (obj.spiritCount !== undefined) {
    const n = Number(obj.spiritCount);
    if (!Number.isInteger(n) || n < 0) {
      throw new AppError(400, 'extraCrystals.spiritCount must be a non-negative integer');
    }
    result.spiritCount = n;
  }
  if (obj.dominionCount !== undefined) {
    const n = Number(obj.dominionCount);
    if (!Number.isInteger(n) || n < 0) {
      throw new AppError(400, 'extraCrystals.dominionCount must be a non-negative integer');
    }
    result.dominionCount = n;
  }
  return result;
}
