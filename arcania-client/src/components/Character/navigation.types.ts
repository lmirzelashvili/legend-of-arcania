export type NavSection = 'home' | 'character' | 'adventure' | 'trade' | 'social';

export interface SubTabDef {
  id: string;
  label: string;
}

export const SUB_TABS: Record<NavSection, SubTabDef[]> = {
  home: [],
  character: [
    { id: 'equipment', label: 'EQUIPMENT & STATS' },
    { id: 'abilities', label: 'ABILITIES' },
  ],
  adventure: [
    { id: 'quests', label: 'QUESTS' },
    { id: 'battlepass', label: 'BATTLE PASS' },
    { id: 'pvp', label: 'PVP' },
  ],
  trade: [
    { id: 'vault', label: 'VAULT' },
    { id: 'auction', label: 'AUCTION HOUSE' },
    { id: 'vendors', label: 'VENDORS' },
    { id: 'forge', label: 'FORGE' },
  ],
  social: [
    { id: 'friends', label: 'FRIENDS' },
    { id: 'boosters', label: 'BOOSTERS' },
  ],
};

export const NAV_SECTIONS: { id: NavSection; icon: string; label: string }[] = [
  { id: 'home', icon: '\u2302', label: 'HOME' },
  { id: 'character', icon: '\u2666', label: 'CHARACTER' },
  { id: 'adventure', icon: '\u2694', label: 'ADVENTURE' },
  { id: 'trade', icon: '\u2699', label: 'TRADE' },
  { id: 'social', icon: '\u2663', label: 'SOCIAL' },
];
