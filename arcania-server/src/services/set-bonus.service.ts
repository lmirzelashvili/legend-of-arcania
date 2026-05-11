// Set Bonus Service — server-side set bonus calculation

import type { ItemInstance, DerivedStatKey } from '../types/index.js';
import { SET_BONUSES } from '../data/item-templates.js';

export function calculateSetBonuses(
  equippedItems: (ItemInstance | undefined | null)[],
  characterClass?: string
): Partial<Record<DerivedStatKey, number>> {
  const result: Partial<Record<DerivedStatKey, number>> = {};

  const setCounts: Record<string, number> = {};
  for (const item of equippedItems) {
    if (!item?.setId) continue;
    setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
  }

  for (const [setId, count] of Object.entries(setCounts)) {
    if (count < 2) continue;

    const bonuses = SET_BONUSES.filter(b =>
      b.setId === setId &&
      b.piecesRequired <= count &&
      (!b.className || b.className === characterClass)
    );

    for (const bonus of bonuses) {
      const current = result[bonus.bonusStat] || 0;
      result[bonus.bonusStat] = current + bonus.bonusValue;
    }
  }

  return result;
}
