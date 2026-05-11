// Barrel export for all API domain modules
// Import from '@/services/api' to get everything

export { api as default, api, BASE_URL, FetchClientError, request } from './client';

export { authAPI } from './auth.api';
export { characterAPI } from './character.api';
export { marketplaceAPI } from './marketplace.api';
export { questAPI } from './quest.api';
export type {
  QuestReward,
  QuestDefinition,
  PlayerQuest,
  QuestData,
  LoginStreakData,
  ReferralStats,
} from './quest.api';
export { vaultAPI } from './vault.api';
export { vendorAPI } from './vendor.api';
export { walletAPI } from './wallet.api';
export { forgeAPI } from './forge.api';
export type { ForgeRecipeMaterial, ForgeRecipe, ForgeResult } from './forge.api';
export { friendsAPI } from './friends.api';
export type {
  Friend,
  FriendRequestIncoming,
  FriendRequestOutgoing,
  PendingRequests,
} from './friends.api';
export { tradeAPI } from './trade.api';
export type { TradeOfferItem, TradeOffer, Trade, TradeConfirmResult } from './trade.api';
export { battlePassAPI } from './battle-pass.api';
export type {
  TierReward,
  BattlePassTier,
  BattlePassSeason,
  BattlePassProgress,
} from './battle-pass.api';
export { premiumAPI } from './premium.api';
export type { PremiumSubscriptionInfo, PremiumStatus } from './premium.api';
export { boosterAPI } from './booster.api';
export type { ActiveBooster, BoosterBonuses } from './booster.api';
export { pvpAPI } from './pvp.api';
export type { PvPStatsData, PvPSeason } from './pvp.api';
