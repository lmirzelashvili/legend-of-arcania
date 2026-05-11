import React, { useState, useEffect, useMemo } from 'react';
import { Character, InventoryItem } from '@/types/game.types';
import { getRarityBorder } from '@/utils/rarity-styles';
import { characterAPI } from '@/services/api.service';
import { useVaultStore } from '@/store/useVaultStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import EquipmentPreview from '../Equipment/EquipmentPreview';
import EnhancementModal from '../Equipment/EnhancementModal';
import GemSocketModal from '../Equipment/GemSocketModal';
import { mergeEquipmentSpriteInfo } from '@/config/item-sprite-mapping';
import CompactStatsPanel from './CompactStatsPanel';
import EquipmentSlot from './EquipmentSlot';
import InventorySlot from './InventorySlot';
import { SET_BONUSES } from '@/constants/item-templates';
import { canEquipCape, canEquipWings } from '@/constants/equipment.constants';
import { xpRequiredForLevel, MAX_LEVEL } from '@/constants/game.constants';
import PixelPanel from '../ui/PixelPanel';

interface Props {
  character: Character;
}

const CharacterSheet: React.FC<Props> = ({ character: propCharacter }) => {
  const { depositToVault } = useVaultStore();
  const { setCurrentCharacter } = useCharacterStore();
  const storeCharacter = useCharacterStore(s => s.currentCharacter);

  // Local state guarantees re-render on every setState call
  const [character, setCharacter] = useState<Character>(storeCharacter || propCharacter);

  // Sync when store changes externally (e.g. vault operations, other tabs)
  useEffect(() => {
    if (storeCharacter) setCharacter(storeCharacter);
  }, [storeCharacter]);

  // Also sync when prop changes
  useEffect(() => {
    if (propCharacter) setCharacter(storeCharacter || propCharacter);
  }, [propCharacter]);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMessage, setDepositMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [showGemSocket, setShowGemSocket] = useState(false);

  const equipment = character.equipment || {} as any;
  const inventory = character.inventory?.items || [];

  const ITEMS_PER_PAGE = 20; // 4 columns × 5 rows
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageItems = inventory.slice(startIndex, endIndex);

  const spriteInfo = mergeEquipmentSpriteInfo(
    equipment.head,
    equipment.chest,
    equipment.legs,
    equipment.gloves,
    equipment.boots,
    undefined, // shoulders removed
    equipment.cape,
    equipment.wings,
    equipment.weapon,
    equipment.offHand
  );

  console.log('[DEBUG] class:', character.class, '| canWings:', canEquipWings(character.class), '| canCape:', canEquipCape(character.class));

  const gender = character.gender || 'male';

  // Calculate active set bonuses from equipped items
  const activeSetBonuses = useMemo(() => {
    const equippedItems = Object.values(equipment).filter(Boolean) as any[];
    const setCounts: Record<string, number> = {};
    for (const item of equippedItems) {
      if (item?.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    }

    const results: { setId: string; piecesEquipped: number; bonuses: typeof SET_BONUSES }[] = [];
    for (const [setId, count] of Object.entries(setCounts)) {
      const allBonuses = SET_BONUSES.filter(b =>
        b.setId === setId &&
        (!b.className || b.className === character.class)
      );
      if (allBonuses.length > 0) {
        results.push({ setId, piecesEquipped: count, bonuses: allBonuses });
      }
    }
    return results;
  }, [equipment, character.class]);

  const getPlaceholderIcon = (slotKey: string): string => {
    const placeholders: Record<string, string> = {
      ring1: '/assets/icons/items/accessories/ring_vharun.png',
      ring2: '/assets/icons/items/accessories/ring_vharun.png',
      gloves: '/assets/icons/items/armor/gauntlets.svg',
      weapon: '/assets/icons/items/weapons/sword.svg',
      offHand: '/assets/icons/items/shields/shield-round.svg',
      head: '/assets/icons/items/armor/helm.svg',
      pendant: '/assets/icons/items/accessories/pendant_vharun.png',
      cape: '/assets/icons/items/accessories/sentinel_cape.png',
      wings: '/assets/icons/items/accessories/sentinel_wings.png',
      chest: '/assets/icons/items/armor/chestplate.svg',
      legs: '/assets/icons/items/armor/leggings.svg',
      boots: '/assets/icons/items/armor/boots.svg',
    };
    return placeholders[slotKey] || '/assets/icons/items/armor/chestplate.svg';
  };

  const handleEquipFromInventory = async (item: InventoryItem) => {
    if (!item.item.equipmentSlot) return;
    try {
      const updatedCharacter = await characterAPI.equipItem(character.id, item.item.id, item.item.equipmentSlot);
      console.log('[DEBUG] Equip response - equipment:', JSON.stringify(updatedCharacter.equipment, null, 2));
      console.log('[DEBUG] Equip response - chest:', updatedCharacter.equipment?.chest);
      setCharacter(updatedCharacter);        // immediate local re-render
      setCurrentCharacter(updatedCharacter);  // sync store for other components
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  };

  const handleUnequip = async (slotKey: string) => {
    try {
      const updatedCharacter = await characterAPI.unequipItem(character.id, slotKey);
      setCharacter(updatedCharacter);        // immediate local re-render
      setCurrentCharacter(updatedCharacter);  // sync store for other components
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to unequip item:', error);
    }
  };

  const handleSellItem = async (item: InventoryItem) => {
    try {
      const result = await characterAPI.sellItem(character.id, item.id, 1);
      setCharacter(result.character);
      setCurrentCharacter(result.character);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to sell item:', error);
    }
  };

  const handleOpenBox = async (item: InventoryItem) => {
    try {
      const result = await characterAPI.openBox(character.id, item.id);
      setCharacter(result.updatedCharacter);
      setCurrentCharacter(result.updatedCharacter);
      setSelectedItem(null);
      setDepositMessage({
        type: 'success',
        text: `Opened ${result.boxName}! Got ${result.rewardCount} item(s)`
      });
    } catch (error: any) {
      setDepositMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to open box' });
    }
    setTimeout(() => setDepositMessage(null), 4000);
  };

  const handleUseScroll = async (item: InventoryItem) => {
    try {
      const result = await characterAPI.useScroll(character.id, item.id);
      setCharacter(result.character);
      setCurrentCharacter(result.character);
      setSelectedItem(null);
      setDepositMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      setDepositMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to use scroll' });
    }
    setTimeout(() => setDepositMessage(null), 4000);
  };

  const handleDepositToVault = async (item: InventoryItem) => {
    setIsDepositing(true);
    setDepositMessage(null);
    try {
      // Use item.id (inventory slot ID), not item.item.id (item definition ID)
      const success = await depositToVault(character.id, item.id, item.quantity);
      if (success) {
        setDepositMessage({ type: 'success', text: `${item.item.name} moved to vault!` });
        setSelectedItem(null);
      } else {
        setDepositMessage({ type: 'error', text: 'Failed to deposit. Vault may be full.' });
      }
    } catch (error) {
      console.error('Failed to deposit item:', error);
      setDepositMessage({ type: 'error', text: 'Failed to deposit item' });
    } finally {
      setIsDepositing(false);
      // Clear message after 3 seconds
      setTimeout(() => setDepositMessage(null), 3000);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-pixel">
      {/* UNIFIED EQUIPMENT PANEL - Wraps all 3 sections */}
      <div className="lg:col-span-6">
        <PixelPanel color="amber">
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT - Accessories & Weapons */}
            <div className="space-y-6 mt-28">
              <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                <EquipmentSlot slotKey="ring1" label="RING I" small equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="pendant" label="PENDANT" small equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="ring2" label="RING II" small equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
                <EquipmentSlot slotKey="weapon" label="WEAPON" large equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="offHand" label="OFF-HAND" large equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
              </div>
            </div>

            {/* CENTER - Character */}
            <div>
          <div className="space-y-4">
            {/* Character Name */}
            <div className="text-center">
              <div className="text-amber-400 text-[12px] mb-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                {character.name.toUpperCase()}
              </div>
              <div className="text-gray-500 text-[6px]">
                {character.race.toUpperCase()} • {character.class.toUpperCase()}
              </div>
            </div>

            {/* Level & XP */}
            <div>
              {(() => {
                const isMaxLevel = character.level >= MAX_LEVEL;
                const currentXp = character.experience ?? 0;
                const requiredXp = xpRequiredForLevel(character.level);
                const xpPercentage = isMaxLevel ? 100 : Math.min(100, Math.floor((currentXp / requiredXp) * 100));

                return (
                  <>
                    <div className="flex justify-between items-center mb-2 text-[8px]">
                      <span className="text-gray-400">LV {character.level}</span>
                      {isMaxLevel ? (
                        <span className="text-purple-400">MAX LEVEL</span>
                      ) : (
                        <span className="text-amber-500">{currentXp.toLocaleString()} / {requiredXp.toLocaleString()} XP</span>
                      )}
                    </div>
                    <div className="w-full h-4 p-[2px] bg-gray-800">
                      <div className="w-full h-full bg-black relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${isMaxLevel ? 'from-purple-600 to-purple-500' : 'from-amber-600 to-amber-500'}`} style={{ width: `${xpPercentage}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-[6px] text-white" style={{ textShadow: '1px 1px 2px black' }}>
                          {isMaxLevel ? 'MAX' : `${xpPercentage}%`}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Character Preview */}
            <div className="flex justify-center -mb-4" style={{ marginTop: '-4rem' }}>
              <EquipmentPreview
                race={character.race}
                characterClass={character.class}
                gender={gender}
                scale={5}
                showControls={false}
                autoPlay={true}
                hideBackground={true}
                spriteInfo={spriteInfo}
              />
            </div>
          </div>
            </div>

            {/* RIGHT - Armor & Wings */}
            <div className="space-y-6 mt-28">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <EquipmentSlot slotKey="head" label="HEAD" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                {canEquipCape(character.class) && <EquipmentSlot slotKey="cape" label="CAPE" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />}
                {canEquipWings(character.class) && <EquipmentSlot slotKey="wings" label="WINGS" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />}
                <EquipmentSlot slotKey="gloves" label="GLOVES" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="chest" label="CHEST" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="legs" label="LEGS" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
                <EquipmentSlot slotKey="boots" label="BOOTS" equipment={equipment} hoveredSlot={hoveredSlot} setHoveredSlot={setHoveredSlot} onUnequip={handleUnequip} getRarityBorder={getRarityBorder} getPlaceholderIcon={getPlaceholderIcon} />
              </div>
            </div>
          </div>

          {/* Set Bonuses */}
          {activeSetBonuses.length > 0 && (
            <div className="mt-4 pt-3 border-t-2 border-gray-800">
              <div className="text-amber-500 text-[8px] mb-2 tracking-wider">SET BONUSES</div>
              {activeSetBonuses.map(({ setId, piecesEquipped, bonuses }) => (
                <div key={setId} className="mb-2">
                  <div className="text-gray-400 text-[7px] mb-1">
                    {setId.replace(/_/g, ' ').toUpperCase()} ({piecesEquipped} PC)
                  </div>
                  {bonuses.map((b, i) => (
                    <div key={i} className={`flex justify-between text-[7px] ${
                      b.piecesRequired <= piecesEquipped ? 'text-green-400' : 'text-gray-700'
                    }`}>
                      <span>({b.piecesRequired}) {b.bonusStat.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>+{b.bonusValue}{b.bonusIsPercent ? '%' : ''}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </PixelPanel>
      </div>

      {/* INVENTORY PANEL */}
      <div className="lg:col-span-4">
        <PixelPanel title={`INVENTORY • PAGE ${currentPage + 1}/${Math.max(1, totalPages)}`} color="amber">
          {/* Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4 ml-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => {
              const item = currentPageItems[index];

              return (
                <InventorySlot
                  key={index}
                  item={item}
                  index={index}
                  isSelected={selectedItem?.item.id === item?.item.id}
                  onClick={() => item && setSelectedItem(item)}
                  onDoubleClick={() => item && handleEquipFromInventory(item)}
                  getRarityBorder={getRarityBorder}
                />
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mb-4 pt-4 border-t-2 border-gray-900">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative group disabled:opacity-30"
            >
              <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className="relative px-4 py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">◄</div>
            </button>

            <div className="text-gray-500 text-[8px]">{inventory.length} ITEMS</div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="relative group disabled:opacity-30"
            >
              <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className="relative px-4 py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">►</div>
            </button>
          </div>

          {/* Selected Item Actions */}
          {selectedItem ? (
            <div className="pt-4 border-t-2 border-gray-900">
              <div className="text-amber-400 text-[8px] mb-3">{selectedItem.item.name.toUpperCase()}</div>

              {/* Deposit Message */}
              {depositMessage && (
                <div className={`mb-3 text-[7px] text-center ${
                  depositMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {depositMessage.text}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (selectedItem.item.equipmentSlot) {
                      handleEquipFromInventory(selectedItem);
                      setSelectedItem(null);
                    }
                  }}
                  disabled={!selectedItem.item.equipmentSlot}
                  className="relative flex-1 group disabled:opacity-30"
                >
                  <div className={`absolute inset-0 ${
                    selectedItem.item.equipmentSlot
                      ? 'bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110'
                      : 'bg-gray-800'
                  } transition-all`}></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className={`relative py-2 text-[8px] ${
                    selectedItem.item.equipmentSlot ? 'text-green-400 group-hover:text-green-300' : 'text-gray-700'
                  } transition-colors`}>
                    EQUIP
                  </div>
                </button>
                <button
                  onClick={() => selectedItem && handleSellItem(selectedItem)}
                  className="relative flex-1 group"
                >
                  <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">
                    SELL
                  </div>
                </button>
                <button
                  onClick={() => handleDepositToVault(selectedItem)}
                  disabled={isDepositing}
                  className="relative flex-1 group disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-purple-400 group-hover:text-purple-300 text-[8px] transition-colors">
                    {isDepositing ? 'MOVING...' : 'TO VAULT'}
                  </div>
                </button>
              </div>

              {/* Enhancement & Socketing Buttons */}
              {selectedItem.item.equipmentSlot && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowEnhancement(true)}
                    className="relative flex-1 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-700 group-hover:brightness-110 transition-all"></div>
                    <div className="absolute inset-[2px] bg-black"></div>
                    <div className="relative py-2 text-amber-400 group-hover:text-amber-300 text-[8px] transition-colors">
                      ENHANCE
                    </div>
                  </button>
                  {(selectedItem.item as any).sockets?.length > 0 && (
                    <button
                      onClick={() => setShowGemSocket(true)}
                      className="relative flex-1 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-700 group-hover:brightness-110 transition-all"></div>
                      <div className="absolute inset-[2px] bg-black"></div>
                      <div className="relative py-2 text-purple-400 group-hover:text-purple-300 text-[8px] transition-colors">
                        SOCKET
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Open Box Button */}
              {selectedItem.item.name.includes('Box of') && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenBox(selectedItem)}
                    className="relative flex-1 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-yellow-600 group-hover:brightness-110 transition-all"></div>
                    <div className="absolute inset-[2px] bg-black"></div>
                    <div className="relative py-2 text-amber-300 group-hover:text-amber-200 text-[8px] transition-colors">
                      OPEN BOX
                    </div>
                  </button>
                </div>
              )}

              {/* Use Scroll Button */}
              {selectedItem.item.name.includes('Scroll of') && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUseScroll(selectedItem)}
                    className="relative flex-1 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-cyan-600 group-hover:brightness-110 transition-all"></div>
                    <div className="absolute inset-[2px] bg-black"></div>
                    <div className="relative py-2 text-cyan-300 group-hover:text-cyan-200 text-[8px] transition-colors">
                      USE SCROLL
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t-2 border-gray-900 text-center text-gray-800 text-[8px]">
              SELECT ITEM
            </div>
          )}
        </PixelPanel>
      </div>

      {/* STATS ALLOCATION & DERIVED STATS */}
      <div className="lg:col-span-10">
        <PixelPanel title="CHARACTER STATS" color="green">
          <CompactStatsPanel character={character} />
        </PixelPanel>
      </div>

      {/* Enhancement Modal */}
      {showEnhancement && selectedItem && (
        <EnhancementModal
          character={character}
          targetItem={selectedItem}
          onClose={() => setShowEnhancement(false)}
          onCharacterUpdate={(updated) => {
            setCharacter(updated);
            setCurrentCharacter(updated);
            // Re-select the item if it still exists after enhancement
            const updatedInv = updated.inventory?.items || [];
            const stillExists = updatedInv.find(i => i.id === selectedItem.id);
            setSelectedItem(stillExists || null);
            if (!stillExists) setShowEnhancement(false);
          }}
        />
      )}

      {/* Gem Socket Modal */}
      {showGemSocket && selectedItem && (
        <GemSocketModal
          character={character}
          targetItem={selectedItem}
          onClose={() => setShowGemSocket(false)}
          onCharacterUpdate={(updated) => {
            setCharacter(updated);
            setCurrentCharacter(updated);
            const updatedInv = updated.inventory?.items || [];
            const stillExists = updatedInv.find(i => i.id === selectedItem.id);
            setSelectedItem(stillExists || null);
          }}
        />
      )}

    </div>
  );
};

// Panel Component (same as in CharacterManagement)
export default CharacterSheet;
