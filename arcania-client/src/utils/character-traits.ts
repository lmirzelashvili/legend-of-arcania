import { Race, Class } from '@/types/game.types';

export const getSkinTone = (race: Race): string => {
  switch (race) {
    case Race.HUMAN: return 'olive';
    case Race.LUMINAR: return 'light';
    case Race.LILIN: return 'lavender';
    case Race.DARKAN: return 'black';
    default: return 'olive';
  }
};

export const getHairColor = (race: Race, characterClass: Class, gender: string): string => {
  if (race === Race.HUMAN) {
    switch (characterClass) {
      case Class.PALADIN: return 'dark_brown';
      case Class.CLERIC: return 'white';
      case Class.MAGE: return gender === 'female' ? 'purple' : 'blue';
      case Class.FIGHTER: return 'black';
      case Class.RANGER: return 'ginger';
      default: return 'dark_brown';
    }
  }
  if (race === Race.LUMINAR) {
    switch (characterClass) {
      case Class.PALADIN: return 'platinum';
      case Class.CLERIC: return 'white';
      case Class.MAGE: return 'platinum';
      case Class.FIGHTER: return 'platinum';
      case Class.RANGER: return 'blonde';
      default: return 'platinum';
    }
  }
  switch (race) {
    case Race.LILIN: return 'violet';
    case Race.DARKAN: return 'raven';
    default: return 'dark_brown';
  }
};

export const getBasePantsColor = (race: Race): string => {
  switch (race) {
    case Race.HUMAN: return 'brown';
    case Race.LILIN: return 'maroon';
    case Race.DARKAN: return 'black';
    case Race.LUMINAR: return 'white';
    default: return 'brown';
  }
};

export const getBaseShirtColor = (race: Race): string => {
  switch (race) {
    case Race.HUMAN: return 'white';
    case Race.LILIN: return 'black';
    case Race.DARKAN: return 'slate';
    case Race.LUMINAR: return 'sky';
    default: return 'white';
  }
};

export const getEyeColor = (race: Race): string => {
  switch (race) {
    case Race.HUMAN: return 'brown';
    case Race.LUMINAR: return 'blue';
    case Race.LILIN: return 'purple';
    case Race.DARKAN: return 'red';
    default: return 'brown';
  }
};

export interface CharacterTraits {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  shouldHaveBeard: boolean;
  shouldHaveEars: boolean;
  shouldHaveDemonHorns: boolean;
  basePantsColor: string;
  baseShirtColor: string;
  needsBaseShirt: boolean;
}

export const getCharacterTraits = (race: Race, characterClass: Class, gender: string): CharacterTraits => {
  const isLilin = race === Race.LILIN;
  const isFemale = gender === 'female';

  return {
    skinTone: getSkinTone(race),
    hairColor: getHairColor(race, characterClass, gender),
    eyeColor: getEyeColor(race),
    shouldHaveBeard: !isFemale && race === Race.HUMAN && characterClass !== Class.MAGE,
    shouldHaveEars: race === Race.LUMINAR || isLilin,
    shouldHaveDemonHorns: race === Race.DARKAN,
    basePantsColor: getBasePantsColor(race),
    baseShirtColor: getBaseShirtColor(race),
    needsBaseShirt: isFemale || isLilin,
  };
};
