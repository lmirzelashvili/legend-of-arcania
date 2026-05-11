import React, { useState, useEffect } from 'react';
import { Ability, CharacterAbility, AbilityEffect } from '@/types/game.types';
import { characterAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';

// Effect type colors
const EFFECT_TYPE_COLORS: Record<string, string> = {
  DAMAGE: 'text-red-400',
  HEAL: 'text-green-400',
  SCALING_HEAL: 'text-green-300',
  STUN: 'text-yellow-400',
  FREEZE: 'text-cyan-400',
  ROOT: 'text-amber-400',
  TAUNT: 'text-orange-400',
  DAMAGE_REDUCTION: 'text-blue-400',
  INVULNERABLE: 'text-purple-400',
  HP_REGEN: 'text-emerald-400',
  CLEANSE: 'text-teal-400',
  DEBUFF_IMMUNITY: 'text-teal-300',
  HEAL_ON_DAMAGE: 'text-lime-400',
  PREVENT_DEATH: 'text-pink-400',
  RESURRECT: 'text-pink-300',
  AOE_DAMAGE: 'text-red-300',
  CENTER_BONUS: 'text-red-200',
  DAMAGE_AMPLIFY: 'text-orange-300',
  DAMAGE_TO_MANA: 'text-blue-300',
  CHANNEL: 'text-indigo-400',
  DOT: 'text-orange-400',
  ARMOR_REDUCTION: 'text-amber-300',
  ATTACK_SPEED: 'text-yellow-300',
  MOVEMENT_SPEED: 'text-cyan-300',
  KILL_EXTEND: 'text-emerald-300',
  MOVEMENT_SLOW: 'text-gray-400',
  SPLASH_DAMAGE: 'text-red-200',
  ARMOR_PENETRATION: 'text-amber-200',
  BLEED: 'text-red-500',
  LIFESTEAL: 'text-green-300',
  CC_IMMUNITY: 'text-purple-300',
  CHARGE_BONUS: 'text-yellow-200',
  PIERCE: 'text-gray-300',
  MAX_CHARGES: 'text-blue-200',
  DODGE: 'text-gray-300',
  CRIT_CHANCE: 'text-yellow-400',
  RANGE_INCREASE: 'text-cyan-200',
  PIERCE_ALL: 'text-gray-200',
  RESET_ON_KILL: 'text-green-200',
  STORED_DAMAGE: 'text-purple-200',
};

const AbilitiesPanel: React.FC = () => {
  const { setCurrentCharacter } = useCharacterStore();
  const character = useCharacterStore(s => s.currentCharacter);
  if (!character) return null;
  const [selectedAbility, setSelectedAbility] = useState<CharacterAbility | null>(null);
  const [selectedAvailableAbility, setSelectedAvailableAbility] = useState<Ability | null>(null);
  const [availableAbilities, setAvailableAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(false);

  const availableAbilityPoints = character.abilityPoints || 0;

  useEffect(() => {
    loadAvailableAbilities();
  }, [character.id]);

  const loadAvailableAbilities = async () => {
    try {
      const abilities = await characterAPI.getAvailableAbilities(character.id);
      setAvailableAbilities(abilities);
    } catch (error) {
      console.error('Failed to load abilities:', error);
    }
  };

  const characterAbilities = character.abilities || [];

  const handleLearnAbility = async (ability: Ability) => {
    if (availableAbilityPoints > 0 && character.level >= ability.unlockLevel) {
      setLoading(true);
      try {
        const updatedCharacter = await characterAPI.learnAbility(character.id, ability.id);
        setCurrentCharacter(updatedCharacter);
        loadAvailableAbilities();
      } catch (error: any) {
        console.error('Failed to learn ability:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpgradeAbility = async (characterAbility: CharacterAbility) => {
    if (availableAbilityPoints > 0) {
      setLoading(true);
      try {
        const updatedCharacter = await characterAPI.upgradeAbility(character.id, characterAbility.ability.id);
        setCurrentCharacter(updatedCharacter);
      } catch (error: any) {
        console.error('Failed to upgrade ability:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const isAbilityUnlocked = (ability: Ability) => {
    return character.level >= ability.unlockLevel;
  };

  return (
    <div className="font-pixel">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learned Abilities */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="LEARNED ABILITIES" color="green">
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-500 text-[8px]">ABILITY POINTS</div>
              <div className="text-amber-400 text-xl">{availableAbilityPoints}</div>
            </div>

            {characterAbilities.length > 0 ? (
              <div className="space-y-3">
                {characterAbilities.map((charAbility) => (
                  <div
                    key={charAbility.id}
                    onClick={() => {
                      setSelectedAbility(charAbility);
                      setSelectedAvailableAbility(null);
                    }}
                    className="relative cursor-pointer group"
                  >
                    <div className={`absolute inset-0 ${
                      charAbility.ability.isUltimate
                        ? 'bg-gradient-to-r from-purple-700 to-purple-600'
                        : 'bg-gradient-to-r from-green-700 to-green-600'
                    } ${
                      selectedAbility?.id === charAbility.id
                        ? 'animate-pulse'
                        : 'group-hover:brightness-110'
                    } transition-all`}></div>
                    <div className="absolute inset-[3px] bg-black"></div>
                    <div className="relative p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className={`text-[10px] mb-1 ${
                            charAbility.ability.isUltimate ? 'text-purple-400' : 'text-green-400'
                          }`}>
                            {charAbility.ability.name.toUpperCase()}
                            {charAbility.ability.isUltimate && <span className="ml-2 text-[6px]">★ ULTIMATE</span>}
                          </div>
                          <div className="text-gray-500 text-[6px] mb-2">
                            {charAbility.ability.description}
                          </div>
                          <div className="flex gap-3 text-[6px]">
                            <span className="text-blue-400">CD: {charAbility.ability.cooldown}s</span>
                            <span className="text-cyan-400">MANA: {charAbility.ability.manaCost}</span>
                          </div>
                        </div>
                        <div className="relative ml-4">
                          <div className="absolute inset-0 bg-purple-700"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative px-3 py-1 text-purple-400 text-[8px]">
                            LV.{charAbility.level}
                          </div>
                        </div>
                      </div>
                      {availableAbilityPoints > 0 && charAbility.level < 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeAbility(charAbility);
                          }}
                          className="relative w-full group/btn mt-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-600 group-hover/btn:brightness-110 transition-all"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative py-2 text-amber-400 group-hover/btn:text-amber-300 text-[8px] transition-colors">
                            UPGRADE TO LV.{charAbility.level + 1}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-12 text-[8px]">
                <div className="mb-2">NO ABILITIES LEARNED</div>
                <div className="text-[6px]">Check available abilities below</div>
              </div>
            )}
          </Panel>

          {/* Available Abilities */}
          <Panel title="AVAILABLE ABILITIES" color="amber">
            <div className="space-y-3">
              {availableAbilities.map((ability) => {
                const unlocked = isAbilityUnlocked(ability);
                const isSelected = selectedAvailableAbility?.id === ability.id;

                return (
                  <div
                    key={ability.id}
                    onClick={() => {
                      setSelectedAvailableAbility(ability);
                      setSelectedAbility(null);
                    }}
                    className="relative cursor-pointer group"
                  >
                    <div className={`absolute inset-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 animate-pulse'
                        : unlocked
                          ? ability.isUltimate
                            ? 'bg-gradient-to-r from-purple-700 to-purple-600 group-hover:brightness-110'
                            : 'bg-gradient-to-r from-gray-700 to-gray-600 group-hover:brightness-110'
                          : 'bg-gradient-to-r from-red-900 to-red-800'
                    } transition-all`}></div>
                    <div className="absolute inset-[3px] bg-black"></div>
                    <div className={`relative p-4 ${!unlocked ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className={`text-[10px] mb-1 ${
                            ability.isUltimate ? 'text-purple-400' : 'text-gray-300'
                          }`}>
                            {ability.name.toUpperCase()}
                            {ability.isUltimate && <span className="ml-2 text-[6px]">★ ULTIMATE</span>}
                          </div>
                          <div className="text-gray-500 text-[6px] mb-2">
                            {ability.description}
                          </div>
                          <div className="flex gap-3 text-[6px]">
                            <span className="text-blue-400">CD: {ability.cooldown}s</span>
                            <span className="text-cyan-400">MANA: {ability.manaCost}</span>
                          </div>
                        </div>
                        <div className="relative ml-4">
                          <div className={`absolute inset-0 ${unlocked ? 'bg-green-700' : 'bg-red-700'}`}></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className={`relative px-3 py-1 text-[8px] ${unlocked ? 'text-green-400' : 'text-red-400'}`}>
                            LV.{ability.unlockLevel}
                          </div>
                        </div>
                      </div>
                      {unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLearnAbility(ability);
                          }}
                          disabled={availableAbilityPoints === 0 || loading}
                          className="relative w-full group/btn disabled:opacity-30 mt-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover/btn:brightness-110 transition-all"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative py-2 text-green-400 group-hover/btn:text-green-300 text-[8px] transition-colors">
                            LEARN (1 POINT)
                          </div>
                        </button>
                      ) : (
                        <div className="mt-2 text-center text-red-400 text-[6px]">
                          REQUIRES LEVEL {ability.unlockLevel}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Ability Details / Tips */}
        <div className="space-y-6">
          {(selectedAbility || selectedAvailableAbility) ? (
            <Panel title="ABILITY DETAILS" color="purple">
              {(() => {
                const ability = selectedAbility?.ability || selectedAvailableAbility!;
                const level = selectedAbility?.level;
                const isLearned = !!selectedAbility;

                return (
                  <>
                    <div className="text-center mb-4">
                      <div className={`text-xl font-bold mb-2 ${
                        ability.isUltimate ? 'text-purple-400' : isLearned ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {ability.name.toUpperCase()}
                      </div>
                      {isLearned ? (
                        <div className="text-gray-500 text-[6px]">
                          LEVEL {level} / 5
                        </div>
                      ) : (
                        <div className="text-amber-500 text-[6px]">
                          NOT LEARNED
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gray-900"></div>
                        <div className="absolute inset-[2px] bg-black"></div>
                        <div className="relative p-3">
                          <div className="text-gray-500 text-[6px] mb-1">DESCRIPTION</div>
                          <div className="text-gray-300 text-[8px] leading-relaxed">
                            {ability.description}
                          </div>
                        </div>
                      </div>

                      {/* Effects Section */}
                      {ability.effects && ability.effects.length > 0 && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gray-900"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative p-3">
                            <div className="text-gray-500 text-[6px] mb-2">EFFECTS</div>
                            <div className="space-y-1.5">
                              {ability.effects.map((effect: AbilityEffect, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className={`text-[7px] px-1 py-0.5 bg-gray-800 ${EFFECT_TYPE_COLORS[effect.type] || 'text-gray-400'}`}>
                                    {effect.type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-gray-400 text-[7px] flex-1">
                                    {effect.description}
                                    {effect.duration && <span className="text-cyan-400"> ({effect.duration}s)</span>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gray-900"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative p-3">
                            <div className="text-gray-500 text-[6px] mb-1">COOLDOWN</div>
                            <div className="text-blue-400 text-[10px]">
                              {ability.cooldown}s
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gray-900"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative p-3">
                            <div className="text-gray-500 text-[6px] mb-1">MANA</div>
                            <div className="text-cyan-400 text-[10px]">
                              {ability.manaCost}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 bg-gray-900"></div>
                        <div className="absolute inset-[2px] bg-black"></div>
                        <div className="relative p-3">
                          <div className="text-gray-500 text-[6px] mb-1">UNLOCK LEVEL</div>
                          <div className={`text-[10px] ${character.level >= ability.unlockLevel ? 'text-green-400' : 'text-red-400'}`}>
                            LEVEL {ability.unlockLevel} {character.level >= ability.unlockLevel ? '✓' : '✗'}
                          </div>
                        </div>
                      </div>

                      {isLearned && selectedAbility && selectedAbility.level < 5 && (
                        <button
                          onClick={() => handleUpgradeAbility(selectedAbility)}
                          disabled={availableAbilityPoints === 0 || loading}
                          className="relative w-full group disabled:opacity-30"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-600 group-hover:brightness-110 transition-all"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative py-2 text-amber-400 group-hover:text-amber-300 text-[8px] transition-colors">
                            UPGRADE TO LV.{selectedAbility.level + 1}
                          </div>
                        </button>
                      )}

                      {!isLearned && selectedAvailableAbility && character.level >= selectedAvailableAbility.unlockLevel && (
                        <button
                          onClick={() => handleLearnAbility(selectedAvailableAbility)}
                          disabled={availableAbilityPoints === 0 || loading}
                          className="relative w-full group disabled:opacity-30"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110 transition-all"></div>
                          <div className="absolute inset-[2px] bg-black"></div>
                          <div className="relative py-2 text-green-400 group-hover:text-green-300 text-[8px] transition-colors">
                            LEARN ABILITY (1 POINT)
                          </div>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </Panel>
          ) : (
            <Panel title="ABILITY INFO" color="gray">
              <div className="text-center text-gray-600 py-8 text-[8px]">
                <div className="mb-2">SELECT AN ABILITY</div>
                <div className="text-[6px]">To view details</div>
              </div>
            </Panel>
          )}

          {/* Tips */}
          <Panel title="ABILITY TIPS" color="gray">
            <ul className="space-y-2 text-[8px] text-gray-400 leading-relaxed">
              <li>• Earn points when leveling up</li>
              <li>• Ultimates are powerful but have long cooldowns</li>
              <li>• Upgrade abilities to increase effectiveness</li>
              <li>• Max ability level is 5</li>
              <li>• Choose abilities that match your playstyle</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};

// Panel Component
const Panel: React.FC<{ children: React.ReactNode; title?: string; color?: 'amber' | 'gray' | 'green' | 'purple' }> = ({
  children,
  title,
  color = 'gray'
}) => {
  const borderColor =
    color === 'amber' ? 'from-amber-600 to-amber-500' :
    color === 'green' ? 'from-green-600 to-green-500' :
    color === 'purple' ? 'from-purple-600 to-purple-500' :
    'from-gray-700 to-gray-600';

  const titleColor =
    color === 'amber' ? 'text-amber-400' :
    color === 'green' ? 'text-green-400' :
    color === 'purple' ? 'text-purple-400' :
    'text-gray-400';

  return (
    <div className="relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${borderColor}`} style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
      }}></div>
      <div className="absolute inset-[4px] bg-black"></div>
      <div className="relative p-6">
        {title && (
          <div className={`${titleColor} text-[10px] mb-4 pb-2 border-b-2 border-gray-800 tracking-widest`}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default AbilitiesPanel;
