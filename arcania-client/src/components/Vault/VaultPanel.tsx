import React, { useState, useEffect } from 'react';
import { VaultItem, ItemType, VaultTier, VAULT_TIER_CONFIG } from '@/types/game.types';
import { getRarityColor, getRarityTextColor } from '@/utils/rarity-styles';
import { useVaultStore } from '@/store/useVaultStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { getItemIcon as getItemIconByName } from '@/config/asset-registry';
import VaultBank from './VaultBank';
import VaultUpgradeModal from './VaultUpgradeModal';

type FilterTab = 'all' | 'equipment' | 'materials' | 'consumables';

const VaultPanel: React.FC = () => {
  const {
    vault,
    isVaultLoading,
    loadVault,
    withdrawFromVault,
    upgradeVaultTier,
  } = useVaultStore();
  const { characters } = useCharacterStore();
  const character = useCharacterStore(s => s.currentCharacter);
  if (!character) return null;

  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [isTransferring, setIsTransferring] = useState(false);
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(character.id);
  const [showCharacterDropdown, setShowCharacterDropdown] = useState(false);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  // Update selected character when prop changes
  useEffect(() => {
    setSelectedCharacterId(character.id);
  }, [character.id]);

  // Get the selected character for withdrawal
  const targetCharacter = characters.find(c => c.id === selectedCharacterId) || character;

  const filterItems = (items: VaultItem[]): VaultItem[] => {
    if (activeFilter === 'all') return items;

    return items.filter(vi => {
      switch (activeFilter) {
        case 'equipment':
          return vi.item.type === ItemType.WEAPON ||
                 vi.item.type === ItemType.ARMOR ||
                 vi.item.type === ItemType.ACCESSORY;
        case 'materials':
          return vi.item.type === ItemType.MATERIAL;
        case 'consumables':
          return vi.item.type === ItemType.CONSUMABLE;
        default:
          return true;
      }
    });
  };

  const handleWithdraw = async () => {
    if (!selectedItem) return;

    setIsTransferring(true);
    setMessage(null);

    try {
      const success = await withdrawFromVault(selectedCharacterId, selectedItem.id, transferQuantity);
      if (success) {
        setMessage({
          text: `Withdrew ${transferQuantity}x ${selectedItem.item.name} to ${targetCharacter.name}'s bag`,
          type: 'success'
        });
        setSelectedItem(null);
        setTransferQuantity(1);
      } else {
        setMessage({ text: `Failed to withdraw. ${targetCharacter.name}'s bag may be full.`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to withdraw item', type: 'error' });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleUpgrade = async () => {
    if (!vault) return;

    const nextTier = vault.tier === VaultTier.BASE ? VaultTier.EXPANDED : VaultTier.PREMIUM;
    const cost = VAULT_TIER_CONFIG[nextTier].cost;

    if (nextTier === VaultTier.EXPANDED) {
      const characterGold = character.resources?.gold || 0;
      if (characterGold < cost) {
        setMessage({ text: `Not enough gold. Need ${cost.toLocaleString()} gold.`, type: 'error' });
        return;
      }
    }

    const success = await upgradeVaultTier(nextTier, character.id);
    if (success) {
      setMessage({ text: `Vault upgraded to ${nextTier}!`, type: 'success' });
      setShowUpgradeModal(false);
    } else {
      setMessage({ text: 'Failed to upgrade vault', type: 'error' });
    }
  };

  if (isVaultLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-400 text-[10px] animate-pulse">Loading vault...</div>
      </div>
    );
  }

  const filteredItems = vault ? filterItems(vault.items) : [];
  const usedSlots = vault?.items.length || 0;
  const maxSlots = vault?.maxSlots || 100;

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div className={`px-4 py-2 text-[9px] border ${
          message.type === 'success'
            ? 'border-green-800 bg-green-900/20 text-green-400'
            : 'border-red-800 bg-red-900/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Vault Header - Top aligned with navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="text-amber-400 text-[12px]">
            VAULT STORAGE
          </div>
          <div className="text-gray-600 text-[10px]">
            {usedSlots} / {maxSlots} SLOTS
          </div>
          <div className="text-gray-700 text-[8px]">
            {vault?.tier || 'BASE'} TIER
          </div>
        </div>

        {vault && vault.tier !== VaultTier.PREMIUM && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="border border-amber-700 hover:border-amber-500 bg-amber-900/20 px-3 py-1.5 text-amber-400 text-[8px] transition-colors"
          >
            UPGRADE VAULT
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2" role="tablist">
        {(['all', 'equipment', 'materials', 'consumables'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeFilter === tab}
            onClick={() => setActiveFilter(tab)}
            className="relative flex-1 group"
          >
            {activeFilter === tab ? (
              <>
                <div className="absolute inset-0 bg-amber-600"></div>
                <div className="absolute inset-[2px] bg-amber-900"></div>
                <div className="relative py-3 text-amber-400 text-[10px]">{tab.toUpperCase()}</div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
                <div className="absolute inset-[2px] bg-black"></div>
                <div className="relative py-3 text-gray-500 group-hover:text-gray-400 text-[10px] transition-colors">
                  {tab.toUpperCase()}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Vault Grid */}
        <div className="col-span-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
            }}></div>
            <div className="absolute inset-[4px] bg-black"></div>
            <div className="relative p-4">
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: Math.min(50, maxSlots) }).map((_, index) => {
                  const item = filteredItems[index];
                  const isSelected = selectedItem?.id === item?.id;

                  return (
                    <div
                      key={index}
                      onClick={() => item && setSelectedItem(isSelected ? null : item)}
                      className={`
                        relative aspect-square cursor-pointer transition-all
                        ${item
                          ? `border ${getRarityColor(item.item.rarity)} ${isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'hover:border-amber-600'}`
                          : 'border border-gray-800 bg-gray-900/20'
                        }
                      `}
                    >
                      {item ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img src={item.item.icon || getItemIconByName(item.item.name)} alt={item.item.name} className="w-full h-full object-contain p-1" />

                          {/* Quantity badge */}
                          {item.quantity > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[7px] px-1">
                              {item.quantity}
                            </div>
                          )}

                          {/* Enhancement level */}
                          {item.item.enhancementLevel && item.item.enhancementLevel > 0 && (
                            <div className="absolute top-0 left-0 bg-purple-600 text-white text-[6px] px-0.5">
                              +{item.item.enhancementLevel}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[7px] text-gray-700">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show more indicator */}
              {filteredItems.length > 50 && (
                <div className="mt-2 text-center text-gray-500 text-[8px]">
                  +{filteredItems.length - 50} more items...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item Details Panel */}
        <div className="col-span-1">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
            }}></div>
            <div className="absolute inset-[4px] bg-black"></div>
            <div className="relative p-4">
              <div className="text-gray-400 text-[10px] mb-4 pb-2 border-b border-gray-800">
                ITEM DETAILS
              </div>

              {selectedItem ? (
                <div className="space-y-4">
                  {/* Item Name */}
                  <div>
                    <div className={`text-[12px] font-bold ${getRarityTextColor(selectedItem.item.rarity)}`}>
                      {selectedItem.item.name}
                      {selectedItem.item.enhancementLevel && selectedItem.item.enhancementLevel > 0 && (
                        <span className="text-purple-400"> +{selectedItem.item.enhancementLevel}</span>
                      )}
                    </div>
                    <div className="text-[8px] text-gray-500 mt-1">
                      {selectedItem.item.rarity} {selectedItem.item.type}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1 text-[8px]">
                    {selectedItem.item.physicalAttack && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Physical Attack</span>
                        <span className="text-red-400">+{selectedItem.item.physicalAttack}</span>
                      </div>
                    )}
                    {selectedItem.item.magicAttack && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Magic Attack</span>
                        <span className="text-blue-400">+{selectedItem.item.magicAttack}</span>
                      </div>
                    )}
                    {selectedItem.item.physicalDefense && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Physical Defense</span>
                        <span className="text-gray-300">+{selectedItem.item.physicalDefense}</span>
                      </div>
                    )}
                    {selectedItem.item.magicResistance && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Magic Resistance</span>
                        <span className="text-purple-400">+{selectedItem.item.magicResistance}</span>
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="border-t border-gray-800 pt-2 text-[8px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required Level</span>
                      <span className={targetCharacter.level >= selectedItem.item.requiredLevel ? 'text-green-400' : 'text-red-400'}>
                        {selectedItem.item.requiredLevel}
                      </span>
                    </div>
                    {selectedItem.item.requiredClass && (
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">Required Class</span>
                        <span className={targetCharacter.class === selectedItem.item.requiredClass ? 'text-green-400' : 'text-red-400'}>
                          {selectedItem.item.requiredClass}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Character Selection */}
                  <div className="border-t border-gray-800 pt-3 space-y-2">
                    <div className="text-gray-500 text-[8px]">WITHDRAW TO CHARACTER</div>
                    <div className="relative">
                      <div
                        onClick={() => setShowCharacterDropdown(!showCharacterDropdown)}
                        className="w-full bg-black border border-gray-700 hover:border-amber-600 text-gray-300 text-[9px] px-3 py-2 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">{targetCharacter.name}</span>
                          <span className="text-gray-600">Lv.{targetCharacter.level} {targetCharacter.class}</span>
                        </div>
                        <span className={`text-gray-500 transition-transform ${showCharacterDropdown ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                      {showCharacterDropdown && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-black border border-gray-700 max-h-40 overflow-y-auto">
                          {[...characters].sort((a, b) => a.id === selectedCharacterId ? -1 : b.id === selectedCharacterId ? 1 : 0).map((char) => (
                            <div
                              key={char.id}
                              onClick={() => {
                                setSelectedCharacterId(char.id);
                                setShowCharacterDropdown(false);
                              }}
                              className={`px-3 py-2 cursor-pointer text-[9px] flex items-center justify-between transition-colors ${
                                char.id === selectedCharacterId
                                  ? 'bg-amber-900/30 text-amber-400'
                                  : 'hover:bg-gray-900 text-gray-400 hover:text-gray-200'
                              }`}
                            >
                              <span>{char.name}</span>
                              <span className="text-gray-600">Lv.{char.level} {char.class}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Transfer */}
                  <div className="border-t border-gray-800 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[8px]">In Vault</span>
                      <span className="text-amber-400 text-[10px]">{selectedItem.quantity}</span>
                    </div>

                    {selectedItem.quantity > 1 && (
                      <div className="space-y-2">
                        <div className="text-gray-500 text-[8px]">QUANTITY</div>
                        <div className="flex items-center gap-1">
                          {/* Quantity Display */}
                          <div className="flex-1 h-8 border border-gray-700 bg-black flex items-center justify-center">
                            <span className="text-amber-400 text-[11px]">{transferQuantity}</span>
                          </div>

                          {/* Decrease Button */}
                          <button
                            onClick={() => setTransferQuantity(Math.max(1, transferQuantity - 1))}
                            disabled={transferQuantity <= 1}
                            className="w-8 h-8 border border-gray-700 hover:border-gray-500 bg-black text-gray-400 hover:text-gray-200 text-[12px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            -
                          </button>

                          {/* Increase Button */}
                          <button
                            onClick={() => setTransferQuantity(Math.min(selectedItem.quantity, transferQuantity + 1))}
                            disabled={transferQuantity >= selectedItem.quantity}
                            className="w-8 h-8 border border-gray-700 hover:border-gray-500 bg-black text-gray-400 hover:text-gray-200 text-[12px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            +
                          </button>

                          {/* Max Button */}
                          <button
                            onClick={() => setTransferQuantity(selectedItem.quantity)}
                            disabled={transferQuantity >= selectedItem.quantity}
                            className="px-2 h-8 border border-gray-700 hover:border-amber-600 bg-black text-gray-500 hover:text-amber-400 text-[8px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleWithdraw}
                      disabled={isTransferring}
                      className="w-full border border-green-700 hover:border-green-500 bg-green-900/20 py-2 text-green-400 text-[9px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTransferring ? 'TRANSFERRING...' : `WITHDRAW TO ${targetCharacter.name.toUpperCase()}`}
                    </button>
                  </div>

                  {/* Deposited Info */}
                  <div className="text-[7px] text-gray-600 pt-2 border-t border-gray-800">
                    Deposited {new Date(selectedItem.depositedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 text-[9px] text-center py-8">
                  Select an item to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank -- Currency Deposit / Withdraw */}
      {vault && (
        <VaultBank vault={vault} characters={characters} />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && vault && (
        <VaultUpgradeModal
          vault={vault}
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

export default VaultPanel;
