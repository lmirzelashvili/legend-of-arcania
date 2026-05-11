import { Race, Class } from '@/types/game.types';
import { getCharacterTraits } from './character-traits';

const BASE_URL = '/assets/sprites';

export interface SpriteLayerInfo {
  path: string;
  isUniversal: boolean;
  frameSize?: number; // Oversize attack sprites use 192 instead of default 64
}

export interface SpritePaths {
  // Character base layers
  body: SpriteLayerInfo;
  head: SpriteLayerInfo;
  nose: SpriteLayerInfo;
  eyes: SpriteLayerInfo;
  eyebrows: SpriteLayerInfo;
  hair: SpriteLayerInfo;
  beard: SpriteLayerInfo | null;
  ear: SpriteLayerInfo | null;
  horn: SpriteLayerInfo | null;
  tailBg: SpriteLayerInfo | null;
  tailFg: SpriteLayerInfo | null;
  basePants: SpriteLayerInfo;
  baseShirt: SpriteLayerInfo | null;

  // Equipment layers
  torso: SpriteLayerInfo | null;
  legs: SpriteLayerInfo | null;
  arms: SpriteLayerInfo | null;
  boots: SpriteLayerInfo | null;
  shoulders: SpriteLayerInfo | null;
  bracers: SpriteLayerInfo | null;
  helmet: SpriteLayerInfo | null;
  weaponBg: SpriteLayerInfo | null;
  weapon: SpriteLayerInfo | null;
  offHandWeaponBg: SpriteLayerInfo | null;
  offHandWeapon: SpriteLayerInfo | null;
  shieldBg: SpriteLayerInfo | null;
  shieldFg: SpriteLayerInfo | null;
  shieldTrimBg: SpriteLayerInfo | null;
  shieldTrimFg: SpriteLayerInfo | null;
  capeBg: SpriteLayerInfo | null;
  capeFg: SpriteLayerInfo | null;
  wingsBg: SpriteLayerInfo | null;
  wingsFg: SpriteLayerInfo | null;
}

interface EquipmentProps {
  weapon: string;
  weaponColor: string;
  weaponPath?: string;
  shield: string;
  shieldColor: string;
  shieldPath?: string;
  helmet: string;
  helmetMaterial: string;
  torso: string;
  torsoMaterial: string;
  legs: string;
  legsMaterial: string;
  arms: string;
  armsMaterial: string;
  boots: string;
  bootsMaterial: string;
  shoulders: string;
  shouldersMaterial: string;
  bracers: string;
  bracersMaterial: string;
  cape: string;
  capeColor: string;
  wings: string;
  wingsColor: string;
  offHandWeapon: string;
  offHandWeaponColor: string;
}

const layer = (path: string, isUniversal = false): SpriteLayerInfo => ({ path, isUniversal });

const getWeaponAnimation = (anim: string): string => {
  if (['walk', 'run', 'idle', 'combat_idle', 'sit', 'jump', 'climb', 'emote'].includes(anim)) return 'walk';
  if (['slash', 'backslash', 'halfslash'].includes(anim)) return 'attack_slash';
  if (anim === 'thrust') return 'attack_thrust';
  return anim;
};

const getShieldAnimation = (anim: string): string => {
  if (['walk', 'run', 'idle', 'combat_idle', 'sit', 'jump', 'climb', 'emote'].includes(anim)) return 'walk';
  if (['slash', 'backslash', 'halfslash'].includes(anim)) return 'slash';
  return anim;
};

// Equipment types that have no idle sprites upstream — fall back to walk
const TORSO_NO_IDLE = ['leather', 'chainmail', 'tabard'];

const WS = `${BASE_URL}/weapon_sets`;

function buildWeaponPaths(weapon: string, weaponColor: string, _gender: string, weaponAnim: string, weaponPath?: string): { weapon: SpriteLayerInfo | null; weaponBg: SpriteLayerInfo | null } {
  if (!weapon || !weaponPath) return { weapon: null, weaponBg: null };

  if (weapon === 'mace') {
    const maceColor = weaponColor || 'mace';
    if (weaponAnim === 'attack_slash') {
      return {
        weapon: { path: `${weaponPath}/attack_slash/${maceColor}.png`, isUniversal: false, frameSize: 192 },
        weaponBg: { path: `${weaponPath}/attack_slash/behind/${maceColor}.png`, isUniversal: false, frameSize: 192 },
      };
    }
    return {
      weapon: layer(`${weaponPath}/${weaponAnim}/${maceColor}.png`),
      weaponBg: null,
    };
  } else if (weapon === 'longsword' || weapon === 'glowsword' || weapon === 'scythe' || weapon === 'halberd') {
    const swordColor = weaponColor || 'iron';
    const fgDir = weaponAnim === 'walk' ? 'front' : 'fg';
    const bgDir = weaponAnim === 'walk' ? 'behind' : 'bg';
    return {
      weapon: { path: `${weaponPath}/${weaponAnim}/${fgDir}/${swordColor}.png`, isUniversal: false, frameSize: 128 },
      weaponBg: { path: `${weaponPath}/${weaponAnim}/${bgDir}/${swordColor}.png`, isUniversal: false, frameSize: 128 },
    };
  } else if (weapon === 'arming') {
    const swordColor = weaponColor || 'iron';
    const fgDir = weaponAnim === 'walk' ? 'front' : 'fg';
    const bgDir = weaponAnim === 'walk' ? 'behind' : 'bg';
    // Attack spritesheets are 128×128 frames; walk spritesheets are 64×64 frames
    const frameSize = weaponAnim === 'walk' ? 64 : 128;
    return {
      weapon: { path: `${weaponPath}/${weaponAnim}/${fgDir}/${swordColor}.png`, isUniversal: false, frameSize },
      weaponBg: { path: `${weaponPath}/${weaponAnim}/${bgDir}/${swordColor}.png`, isUniversal: false, frameSize },
    };
  } else if (weapon === 'normal' || weapon === 'great' || weapon === 'recurve') {
    const bowColor = weaponColor || 'light';
    if (weaponAnim === 'attack_slash' || weaponAnim === 'attack_thrust') {
      // Shoot sprites: 64×64 frames, per-animation 4-row layout (up/left/down/right)
      return {
        weapon: layer(`${weaponPath}/universal/foreground/shoot/${bowColor}.png`),
        weaponBg: layer(`${weaponPath}/universal/background/shoot/${bowColor}.png`),
      };
    }
    // Walk (and hurt fallback): 128×128 frames, per-animation 4-row layout
    return {
      weapon: { path: `${weaponPath}/walk/foreground/${bowColor}.png`, isUniversal: false, frameSize: 128 },
      weaponBg: { path: `${weaponPath}/walk/background/${bowColor}.png`, isUniversal: false, frameSize: 128 },
    };
  } else if (weapon === 'crossbow') {
    const xbowAnim = weaponAnim === 'attack_slash' ? 'thrust' :
                     weaponAnim === 'attack_thrust' ? 'thrust' : weaponAnim;
    return {
      weapon: layer(`${weaponPath}/foreground/${xbowAnim}/crossbow.png`),
      weaponBg: layer(`${weaponPath}/background/${xbowAnim}/crossbow.png`),
    };
  } else if (weapon === 'simple') {
    const simpleAnim = weaponAnim === 'attack_slash' ? 'thrust' :
                       weaponAnim === 'attack_thrust' ? 'thrust' : weaponAnim;
    return {
      weapon: layer(`${weaponPath}/foreground/${simpleAnim}/simple.png`),
      weaponBg: layer(`${weaponPath}/background/${simpleAnim}/simple.png`),
    };
  } else if (['gnarled', 'loop', 'diamond', 'crystal', 's'].includes(weapon)) {
    const staffColor = weaponColor || 'light';
    return {
      weapon: layer(`${weaponPath}/thrust/foreground/${staffColor}.png`),
      weaponBg: layer(`${weaponPath}/thrust/background/${staffColor}.png`),
    };
  }

  return { weapon: null, weaponBg: null };
}

function buildOffHandWeaponPaths(offHandWeapon: string, offHandWeaponColor: string, weaponAnim: string, weaponPath?: string): { weapon: SpriteLayerInfo | null; weaponBg: SpriteLayerInfo | null } {
  if (!offHandWeapon || !weaponPath) return { weapon: null, weaponBg: null };

  if (offHandWeapon === 'arming') {
    const swordColor = offHandWeaponColor || 'iron';
    const fgDir = weaponAnim === 'walk' ? 'front' : 'fg';
    const bgDir = weaponAnim === 'walk' ? 'behind' : 'bg';
    const frameSize = weaponAnim === 'walk' ? 64 : 128;
    return {
      weapon: { path: `${weaponPath}/${weaponAnim}/${fgDir}/${swordColor}.png`, isUniversal: false, frameSize },
      weaponBg: { path: `${weaponPath}/${weaponAnim}/${bgDir}/${swordColor}.png`, isUniversal: false, frameSize },
    };
  } else if (offHandWeapon === 'glowsword') {
    const swordColor = offHandWeaponColor || 'iron';
    const fgDir = weaponAnim === 'walk' ? 'front' : 'fg';
    const bgDir = weaponAnim === 'walk' ? 'behind' : 'bg';
    return {
      weapon: { path: `${weaponPath}/${weaponAnim}/${fgDir}/${swordColor}.png`, isUniversal: false, frameSize: 128 },
      weaponBg: { path: `${weaponPath}/${weaponAnim}/${bgDir}/${swordColor}.png`, isUniversal: false, frameSize: 128 },
    };
  }

  return { weapon: null, weaponBg: null };
}

function buildShieldPaths(shield: string, shieldColor: string, gender: string, shieldAnim: string, shieldPath?: string): {
  shieldBg: SpriteLayerInfo | null;
  shieldFg: SpriteLayerInfo | null;
  shieldTrimBg: SpriteLayerInfo | null;
  shieldTrimFg: SpriteLayerInfo | null;
} {
  if (!shield) return { shieldBg: null, shieldFg: null, shieldTrimBg: null, shieldTrimFg: null };
  // Use provided shieldPath, or fall back to shared shields dir
  const sp = shieldPath || `${WS}/shields/${shield}`;

  if (shield === 'crusader') {
    return {
      shieldBg: layer(`${sp}/bg/${shieldAnim}/crusader.png`),
      shieldFg: layer(`${sp}/fg/${gender.toLowerCase()}/${shieldAnim}/crusader.png`),
      shieldTrimBg: null,
      shieldTrimFg: null,
    };
  } else if (shield === 'heater') {
    const heaterColor = shieldColor || 'gold';
    return {
      shieldBg: layer(`${sp}/original/paint/bg/${shieldAnim}/${heaterColor}.png`),
      shieldFg: layer(`${sp}/original/paint/fg/${shieldAnim}/${heaterColor}.png`),
      shieldTrimBg: layer(`${sp}/original/trim/bg/${shieldAnim}/${heaterColor}.png`),
      shieldTrimFg: layer(`${sp}/original/trim/fg/${shieldAnim}/${heaterColor}.png`),
    };
  } else if (shield === 'spartan') {
    return {
      shieldBg: layer(`${sp}/bg/${shieldAnim}/spartan.png`),
      shieldFg: layer(`${sp}/fg/${gender.toLowerCase()}/${shieldAnim}/spartan.png`),
      shieldTrimBg: null,
      shieldTrimFg: null,
    };
  } else if (shield.startsWith('kite')) {
    const kiteVariant = shieldColor || 'kite_gray_blue';
    const kitePath = `${sp}/${gender.toLowerCase()}/${shieldAnim}/${kiteVariant}.png`;
    return {
      shieldBg: layer(kitePath),
      shieldFg: layer(kitePath),
      shieldTrimBg: null,
      shieldTrimFg: null,
    };
  } else if (shield === 'scutum') {
    return {
      shieldBg: layer(`${sp}/paint/bg/${shieldAnim}/scutum.png`),
      shieldFg: layer(`${sp}/paint/fg/${gender.toLowerCase()}/${shieldAnim}/scutum.png`),
      shieldTrimBg: null,
      shieldTrimFg: null,
    };
  } else if (shield === 'round') {
    const roundColor = shieldColor || 'black';
    return {
      shieldBg: null,
      shieldFg: layer(`${sp}/${shieldAnim}/${roundColor}.png`),
      shieldTrimBg: null,
      shieldTrimFg: null,
    };
  }

  return { shieldBg: null, shieldFg: null, shieldTrimBg: null, shieldTrimFg: null };
}

export function buildSpritePaths(
  race: Race,
  characterClass: Class,
  gender: string,
  equipment: EquipmentProps,
  currentAnimation: string,
): SpritePaths {
  const traits = getCharacterTraits(race, characterClass, gender);
  const { skinTone, hairColor, eyeColor } = traits;

  // Character base paths — all resolved from the per-character directory
  const charBase = `${BASE_URL}/characters/${race.toLowerCase()}/${characterClass.toLowerCase()}/${gender.toLowerCase()}`;

  const bodyPath     = `${charBase}/body/${currentAnimation}/${skinTone}.png`;
  const headPath     = `${charBase}/head/${currentAnimation}/${skinTone}.png`;
  const nosePath     = `${charBase}/nose/${currentAnimation}/${skinTone}.png`;
  const eyesPath     = `${charBase}/eyes/${currentAnimation}/${eyeColor}.png`;
  const eyebrowsPath = `${charBase}/eyebrows/${currentAnimation}/${hairColor}.png`;
  const hairPath     = `${charBase}/hair/${currentAnimation}/${hairColor}.png`;
  const beardPath    = `${charBase}/beard/${currentAnimation}/${hairColor}.png`;
  const earPath      = `${charBase}/ears/${skinTone}.png`;
  const hornPath     = `${charBase}/horns/${currentAnimation}/horns.png`;

  // Base clothing
  const basePantsPath = `${charBase}/base_pants/${currentAnimation}/${traits.basePantsColor}.png`;

  let baseShirt: SpriteLayerInfo | null = null;
  if (traits.needsBaseShirt) {
    baseShirt = layer(`${charBase}/base_shirt/${currentAnimation}/${traits.baseShirtColor}.png`);
  }

  // Equipment — resolved from pre-built equipment_sets/{race}/{class}/{gender}/
  const equipBase = `${BASE_URL}/equipment_sets/${race.toLowerCase()}/${characterClass.toLowerCase()}/${gender.toLowerCase()}`;

  // Animations that don't exist for some equipment — fall back to walk
  const torsoAnim = (currentAnimation === 'idle' && TORSO_NO_IDLE.includes(equipment.torso)) ? 'walk' : currentAnimation;
  const capeAnim = (currentAnimation === 'idle') ? 'walk' : currentAnimation; // capes have no idle upstream

  let armsInfo: SpriteLayerInfo | null = null;
  if (equipment.arms) {
    armsInfo = layer(`${equipBase}/gloves/${currentAnimation}/${equipment.armsMaterial}.png`);
  }

  let bootsInfo: SpriteLayerInfo | null = null;
  if (equipment.boots) {
    bootsInfo = layer(`${equipBase}/boots/basic/${currentAnimation}/${equipment.bootsMaterial}.png`);
  }

  let shouldersInfo: SpriteLayerInfo | null = null;
  if (equipment.shoulders) {
    shouldersInfo = layer(`${equipBase}/shoulders/${equipment.shoulders}/${currentAnimation}/${equipment.shouldersMaterial}.png`);
  }

  let bracersInfo: SpriteLayerInfo | null = null;
  if (equipment.bracers) {
    bracersInfo = layer(`${equipBase}/bracers/${currentAnimation}/${equipment.bracersMaterial}.png`);
  }

  // Torso
  const torsoInfo = equipment.torso
    ? layer(`${equipBase}/torso/${equipment.torso}/${torsoAnim}/${equipment.torsoMaterial}.png`)
    : null;

  // Legs
  const legsAnim = (currentAnimation === 'idle' && equipment.legs === 'pants') ? 'walk' : currentAnimation;
  const legsInfo = equipment.legs
    ? layer(`${equipBase}/legs/${equipment.legs}/${legsAnim}/${equipment.legsMaterial}.png`)
    : null;

  // Helmet
  const helmetInfo = equipment.helmet
    ? layer(`${equipBase}/helmet/${equipment.helmet}/${currentAnimation}/${equipment.helmetMaterial}.png`)
    : null;

  // Cape
  let capeBg: SpriteLayerInfo | null = null;
  let capeFg: SpriteLayerInfo | null = null;
  if (equipment.cape === 'solid') {
    capeBg = layer(`${equipBase}/cape/solid_behind/${capeAnim}/${equipment.capeColor}.png`);
    capeFg = layer(`${equipBase}/cape/solid/${capeAnim}/${equipment.capeColor}.png`);
  }

  // Wings
  let wingsBg: SpriteLayerInfo | null = null;
  let wingsFg: SpriteLayerInfo | null = null;
  if (equipment.wings) {
    if (equipment.wingsColor) {
      wingsBg = layer(`${equipBase}/wings/${equipment.wings}/bg/${currentAnimation}/${equipment.wingsColor}.png`);
      wingsFg = layer(`${equipBase}/wings/${equipment.wings}/fg/${currentAnimation}/${equipment.wingsColor}.png`);
    } else {
      wingsBg = layer(`${equipBase}/wings/${equipment.wings}/${currentAnimation}/bg.png`);
      wingsFg = layer(`${equipBase}/wings/${equipment.wings}/${currentAnimation}/fg.png`);
    }
  }

  // Weapons and shields — resolved from weapon_sets/{class}/{weapon}/, hidden during idle
  const weaponAnim = getWeaponAnimation(currentAnimation);
  const shieldAnim = getShieldAnimation(currentAnimation);
  const noWeapons = currentAnimation === 'idle' || currentAnimation === 'combat_idle';
  const weaponPaths = noWeapons
    ? { weapon: null, weaponBg: null }
    : buildWeaponPaths(equipment.weapon, equipment.weaponColor, gender, weaponAnim, equipment.weaponPath);
  const offHandPaths = noWeapons
    ? { weapon: null, weaponBg: null }
    : buildOffHandWeaponPaths(equipment.offHandWeapon, equipment.offHandWeaponColor, weaponAnim, equipment.weaponPath);
  const shieldPaths = noWeapons
    ? { shieldBg: null, shieldFg: null, shieldTrimBg: null, shieldTrimFg: null }
    : buildShieldPaths(equipment.shield, equipment.shieldColor, gender, shieldAnim, equipment.shieldPath);

  return {
    body: layer(bodyPath),
    head: layer(headPath),
    nose: layer(nosePath),
    eyes: layer(eyesPath),
    eyebrows: layer(eyebrowsPath),
    hair: layer(hairPath),
    beard: traits.shouldHaveBeard ? layer(beardPath) : null,
    ear: traits.shouldHaveEars ? layer(earPath, true) : null,
    horn: traits.shouldHaveDemonHorns ? layer(hornPath) : null,
    tailBg: null,
    tailFg: null,
    basePants: layer(basePantsPath),
    baseShirt,
    torso: torsoInfo,
    legs: legsInfo,
    arms: armsInfo,
    boots: bootsInfo,
    shoulders: shouldersInfo,
    bracers: bracersInfo,
    helmet: helmetInfo,
    weapon: weaponPaths.weapon,
    weaponBg: weaponPaths.weaponBg,
    offHandWeapon: offHandPaths.weapon,
    offHandWeaponBg: offHandPaths.weaponBg,
    shieldBg: shieldPaths.shieldBg,
    shieldFg: shieldPaths.shieldFg,
    shieldTrimBg: shieldPaths.shieldTrimBg,
    shieldTrimFg: shieldPaths.shieldTrimFg,
    capeBg,
    capeFg,
    wingsBg,
    wingsFg,
  };
}
