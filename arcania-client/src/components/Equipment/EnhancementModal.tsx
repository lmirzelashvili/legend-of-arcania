import React, { useState, useMemo } from 'react';
import { Character, InventoryItem } from '@/types/game.types';
import { characterAPI } from '@/services/api.service';
import {
  ENHANCEMENT_SUCCESS_RATES,
  getRequiredCrystal,
  getEnhanceFailureResult,
  getEnhancementBonusPercent,
} from '@/constants/item-templates';

interface Props {
  character: Character;
  targetItem: InventoryItem;
  onClose: () => void;
  onCharacterUpdate: (character: Character) => void;
}

const ENHANCEABLE_TYPES: string[] = ['WEAPON', 'ARMOR', 'SHIELD', 'ACCESSORY'];

const EnhancementModal: React.FC<Props> = ({ character, targetItem, onClose, onCharacterUpdate }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    failureResult?: string | null;
  } | null>(null);

  const item = targetItem.item;
  const currentLevel = item.enhancementLevel || 0;
  const targetLevel = currentLevel + 1;
  const canEnhance = ENHANCEABLE_TYPES.includes(item.type) && currentLevel < 15;

  const requiredCrystalType = canEnhance ? getRequiredCrystal(targetLevel) : null;
  const requiredCrystalName = requiredCrystalType === 'spirit' ? 'Crystal of Spirit' : 'Crystal of Dominion';

  const successRate = canEnhance ? (ENHANCEMENT_SUCCESS_RATES[targetLevel] ?? 0) : 0;
  const failureOutcome = canEnhance ? getEnhanceFailureResult(targetLevel) : null;
  const currentBonus = getEnhancementBonusPercent(currentLevel);
  const nextBonus = canEnhance ? getEnhancementBonusPercent(targetLevel) : currentBonus;

  const inventory = character.inventory?.items || [];
  const availableCrystals = useMemo(() => {
    return inventory.filter(inv => {
      const id = inv.item.id || '';
      const name = inv.item.name || '';
      if (requiredCrystalType === 'spirit') {
        return id.includes('spirit') || name.includes('Spirit');
      }
      return id.includes('dominion') || name.includes('Dominion');
    });
  }, [inventory, requiredCrystalType]);

  const crystalCount = availableCrystals.reduce((sum, inv) => sum + inv.quantity, 0);
  const hasCrystal = crystalCount > 0;

  const handleEnhance = async () => {
    if (!hasCrystal || !canEnhance) return;
    setIsEnhancing(true);
    setResult(null);

    try {
      const crystalInv = availableCrystals[0];
      const res = await characterAPI.enhanceItem(character.id, targetItem.id, crystalInv.id);
      onCharacterUpdate(res.updatedCharacter);
      setResult({
        success: res.success,
        message: res.message,
        failureResult: res.failureResult,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error?.response?.data?.message || 'Enhancement failed',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const getFailureText = () => {
    if (!failureOutcome) return '';
    switch (failureOutcome.result) {
      case 'crystal_consumed': return 'Crystal consumed, item unchanged';
      case 'level_drop': return `Item drops to +${failureOutcome.dropTo}`;
      case 'destroyed': return 'ITEM DESTROYED';
      default: return '';
    }
  };

  const getSuccessRateColor = () => {
    if (successRate >= 0.7) return 'text-green-400';
    if (successRate >= 0.4) return 'text-amber-400';
    if (successRate >= 0.2) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-pixel">
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />

      <div className="relative w-[420px]">
        {/* Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
        }} />
        <div className="absolute inset-[4px] bg-black" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-800">
            <div className="text-amber-400 text-[10px] tracking-widest">ENHANCEMENT</div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-[10px]">X</button>
          </div>

          {/* Item Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 p-[2px] bg-gradient-to-r from-amber-700 to-amber-600">
              <div className="w-full h-full bg-black flex items-center justify-center">
                {item.icon ? (
                  <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-gray-600 text-[8px]">?</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-amber-400 text-[10px]">{item.name.toUpperCase()}</div>
              <div className="text-gray-500 text-[7px] mt-1">
                Enhancement: +{currentLevel} / 15
              </div>
              <div className="text-gray-500 text-[7px]">
                Stat Bonus: +{currentBonus}%
              </div>
            </div>
          </div>

          {!canEnhance ? (
            <div className="text-center text-gray-500 text-[8px] py-4">
              {currentLevel >= 15 ? 'Item is at maximum enhancement (+15)' : 'This item cannot be enhanced'}
            </div>
          ) : (
            <>
              {/* Enhancement Details */}
              <div className="space-y-2 mb-4 p-3 bg-gray-900/50 border border-gray-800">
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">TARGET LEVEL:</span>
                  <span className="text-amber-400">+{targetLevel}</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">STAT BONUS:</span>
                  <span className="text-green-400">+{currentBonus}% → +{nextBonus}%</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">SUCCESS RATE:</span>
                  <span className={getSuccessRateColor()}>{Math.round(successRate * 100)}%</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">ON FAILURE:</span>
                  <span className={failureOutcome?.result === 'destroyed' ? 'text-red-400' : 'text-orange-400'}>
                    {getFailureText()}
                  </span>
                </div>
              </div>

              {/* Crystal Requirement */}
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-900/50 border border-gray-800">
                <div>
                  <div className="text-gray-500 text-[7px]">REQUIRED:</div>
                  <div className={`text-[8px] ${hasCrystal ? 'text-cyan-400' : 'text-red-400'}`}>
                    {requiredCrystalName}
                  </div>
                </div>
                <div className={`text-[10px] ${hasCrystal ? 'text-green-400' : 'text-red-400'}`}>
                  x{crystalCount}
                </div>
              </div>

              {/* Enhancement Progress Bar */}
              <div className="mb-4">
                <div className="flex gap-[2px]">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 ${
                        i < currentLevel
                          ? 'bg-gradient-to-b from-amber-500 to-amber-600'
                          : i === currentLevel
                          ? 'bg-gradient-to-b from-amber-800 to-amber-900 animate-pulse'
                          : 'bg-gray-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Result Message */}
              {result && (
                <div className={`mb-4 p-3 border text-center text-[8px] ${
                  result.success
                    ? 'border-green-800 bg-green-900/30 text-green-400'
                    : result.failureResult === 'destroyed'
                    ? 'border-red-800 bg-red-900/30 text-red-400'
                    : 'border-orange-800 bg-orange-900/30 text-orange-400'
                }`}>
                  {result.message}
                </div>
              )}

              {/* Enhance Button */}
              <button
                onClick={handleEnhance}
                disabled={!hasCrystal || isEnhancing || (result?.failureResult === 'destroyed')}
                className="relative w-full group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 transition-colors" />
                <div className="absolute inset-[2px] bg-gradient-to-b from-gray-900 to-black" />
                <div className="relative px-6 py-3 text-amber-400 group-hover:text-amber-300 text-[10px] transition-colors text-center">
                  {isEnhancing ? 'ENHANCING...' : result?.failureResult === 'destroyed' ? 'ITEM DESTROYED' : 'ENHANCE'}
                </div>
              </button>

              {!hasCrystal && (
                <div className="text-center text-red-400 text-[7px] mt-2">
                  Purchase {requiredCrystalName} from the Arcanist
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancementModal;
