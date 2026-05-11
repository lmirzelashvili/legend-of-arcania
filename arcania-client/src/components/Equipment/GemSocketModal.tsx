import React, { useState, useMemo } from 'react';
import { Character, InventoryItem, ItemType } from '@/types/game.types';
import { characterAPI } from '@/services/api.service';
import { formatStatName } from '@/utils/rarity-styles';

interface Props {
  character: Character;
  targetItem: InventoryItem;
  onClose: () => void;
  onCharacterUpdate: (character: Character) => void;
}

interface SocketData {
  gemId: string | null;
  gemName?: string;
  gemStat?: string;
  gemValue?: number;
}

const GemSocketModal: React.FC<Props> = ({ character, targetItem, onClose, onCharacterUpdate }) => {
  const [selectedSocketIndex, setSelectedSocketIndex] = useState<number | null>(null);
  const [selectedGem, setSelectedGem] = useState<InventoryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const item = targetItem.item;
  const sockets: SocketData[] = (item as any).sockets || [];

  const inventory = character.inventory?.items || [];
  const availableGems = useMemo(() => {
    return inventory.filter(inv => inv.item.type === ItemType.GEM || inv.item.type === ('GEM' as any));
  }, [inventory]);

  const handleInsertGem = async () => {
    if (selectedSocketIndex === null || !selectedGem) return;
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await characterAPI.socketGem(
        character.id,
        targetItem.id,
        selectedGem.id,
        selectedSocketIndex
      );
      onCharacterUpdate(res.updatedCharacter);
      setMessage({ type: 'success', text: res.message });
      setSelectedGem(null);
      setSelectedSocketIndex(null);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to socket gem',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveGem = async (socketIndex: number) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await characterAPI.unsocketGem(character.id, targetItem.id, socketIndex);
      onCharacterUpdate(res.updatedCharacter);
      setMessage({ type: 'success', text: res.message });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to remove gem',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getGemColor = (gemStat?: string): string => {
    if (!gemStat) return 'text-gray-400';
    if (['physicalAttack', 'magicAttack', 'criticalChance', 'criticalDamage', 'attackSpeed'].includes(gemStat)) {
      return 'text-red-400'; // Anguish
    }
    if (['physicalDefense', 'magicResistance', 'maxHp'].includes(gemStat)) {
      return 'text-blue-400'; // Void
    }
    return 'text-yellow-400'; // Light
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-pixel">
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />

      <div className="relative w-[460px]">
        {/* Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500" style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
        }} />
        <div className="absolute inset-[4px] bg-black" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-800">
            <div className="text-purple-400 text-[10px] tracking-widest">GEM SOCKETING</div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-[10px]">X</button>
          </div>

          {/* Item Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 p-[2px] bg-gradient-to-r from-purple-700 to-purple-600">
              <div className="w-full h-full bg-black flex items-center justify-center">
                {item.icon ? (
                  <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-gray-600 text-[8px]">?</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-purple-400 text-[10px]">{item.name.toUpperCase()}</div>
              <div className="text-gray-500 text-[7px] mt-1">
                Sockets: {sockets.length}
              </div>
            </div>
          </div>

          {sockets.length === 0 ? (
            <div className="text-center text-gray-500 text-[8px] py-6">
              This item has no sockets
            </div>
          ) : (
            <>
              {/* Sockets */}
              <div className="mb-4">
                <div className="text-gray-500 text-[7px] mb-2">SOCKETS:</div>
                <div className="space-y-2">
                  {sockets.map((socket, index) => (
                    <div
                      key={index}
                      onClick={() => !socket.gemId && setSelectedSocketIndex(
                        selectedSocketIndex === index ? null : index
                      )}
                      className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                        socket.gemId
                          ? 'border-gray-700 bg-gray-900/50'
                          : selectedSocketIndex === index
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 border ${
                          socket.gemId ? 'border-purple-600 bg-purple-900/40' : 'border-gray-700 bg-gray-900'
                        } flex items-center justify-center`}>
                          {socket.gemId ? (
                            <span className={`text-[8px] ${getGemColor(socket.gemStat)}`}>◆</span>
                          ) : (
                            <span className="text-gray-700 text-[8px]">○</span>
                          )}
                        </div>
                        {socket.gemId ? (
                          <div>
                            <div className={`text-[8px] ${getGemColor(socket.gemStat)}`}>
                              {socket.gemName || 'Gem'}
                            </div>
                            <div className="text-gray-500 text-[7px]">
                              +{socket.gemValue} {formatStatName(socket.gemStat || '')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[8px]">Empty Socket</span>
                        )}
                      </div>

                      {socket.gemId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGem(index);
                          }}
                          disabled={isProcessing}
                          className="text-red-500 hover:text-red-400 text-[7px] disabled:opacity-50"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Gems */}
              {selectedSocketIndex !== null && (
                <div className="mb-4">
                  <div className="text-gray-500 text-[7px] mb-2">AVAILABLE GEMS:</div>
                  {availableGems.length === 0 ? (
                    <div className="text-center text-gray-600 text-[7px] py-3 border border-gray-800">
                      No gems in inventory. Purchase from the Arcanist.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {availableGems.map((gem) => (
                        <div
                          key={gem.id}
                          onClick={() => setSelectedGem(selectedGem?.id === gem.id ? null : gem)}
                          className={`flex items-center justify-between p-2 border cursor-pointer transition-colors ${
                            selectedGem?.id === gem.id
                              ? 'border-purple-500 bg-purple-900/20'
                              : 'border-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div>
                            <div className={`text-[8px] ${getGemColor(gem.item.gemStat)}`}>
                              {gem.item.name}
                            </div>
                            <div className="text-gray-500 text-[7px]">
                              +{gem.item.gemValue} {formatStatName(gem.item.gemStat || '')}
                            </div>
                          </div>
                          {gem.quantity > 1 && (
                            <span className="text-amber-400 text-[7px]">x{gem.quantity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`mb-4 p-3 border text-center text-[8px] ${
                  message.type === 'success'
                    ? 'border-green-800 bg-green-900/30 text-green-400'
                    : 'border-red-800 bg-red-900/30 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Insert Button */}
              {selectedSocketIndex !== null && selectedGem && (
                <button
                  onClick={handleInsertGem}
                  disabled={isProcessing}
                  className="relative w-full group disabled:opacity-40"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-purple-700 group-hover:from-purple-500 group-hover:to-purple-600 transition-colors" />
                  <div className="absolute inset-[2px] bg-gradient-to-b from-gray-900 to-black" />
                  <div className="relative px-6 py-3 text-purple-400 group-hover:text-purple-300 text-[10px] transition-colors text-center">
                    {isProcessing ? 'SOCKETING...' : 'INSERT GEM'}
                  </div>
                </button>
              )}

              <div className="mt-3 text-center text-gray-700 text-[6px]">
                Removing a gem will destroy it
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GemSocketModal;
