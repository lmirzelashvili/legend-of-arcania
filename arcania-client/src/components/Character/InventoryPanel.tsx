import React, { useState } from 'react';
import { Character, InventoryItem, ItemRarity, BAG_CAPACITY_CONFIG } from '@/types/game.types';
import { getRarityColor } from '@/utils/rarity-styles';
import { characterAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useVaultStore } from '@/store/useVaultStore';
import { getItemIcon } from '@/config/asset-registry';

interface Props {
  character: Character;
}

// Calculate dynamic inventory size based on character level and battle pass
const calculateInventorySize = (level: number, hasBattlePass: boolean): number => {
  let size = BAG_CAPACITY_CONFIG.baseSlots;
  if (level >= 30) size += BAG_CAPACITY_CONFIG.level30Bonus;
  if (level >= 60) size += BAG_CAPACITY_CONFIG.level60Bonus;
  if (hasBattlePass) size += BAG_CAPACITY_CONFIG.premiumBonus;
  return size;
};

const InventoryPanel: React.FC<Props> = ({ character }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const { depositToVault, loadVault } = useVaultStore();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [usingConsumable, setUsingConsumable] = useState(false);
  const [consumableMessage, setConsumableMessage] = useState<string | null>(null);
  const [depositing, setDepositing] = useState(false);
  const [depositQuantity, setDepositQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const INVENTORY_SIZE = calculateInventorySize(character.level, character.hasBattlePass || false);

  const inventory = character.inventory?.items || [];

  // Create a map of slot -> item for quick lookup
  // Calculate slot from gridX and gridY: slot = gridY * 8 + gridX
  const itemBySlot = new Map<number, InventoryItem>();
  inventory.forEach(item => {
    const slot = (item.gridY || 0) * 8 + (item.gridX || 0);
    itemBySlot.set(slot, item);
  });



  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
    setDepositQuantity(1); // Reset quantity when selecting new item
  };

  const handleDragStart = (e: React.DragEvent, item: InventoryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    if (draggedItem) {
      const fromSlot = (draggedItem.gridY || 0) * 8 + (draggedItem.gridX || 0);
      if (fromSlot !== targetSlot) {
        setSaving(true);
        try {
          const updatedCharacter = await characterAPI.moveInventoryItem(
            character.id,
            draggedItem.id,
            fromSlot,
            targetSlot
          );
          setCurrentCharacter(updatedCharacter);
        } catch (error) {
          console.error('Failed to move item:', error);
          setActionMessage({ text: 'Failed to move item. Please try again.', type: 'error' });
        } finally {
          setSaving(false);
        }
      }
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleEquipItem = async (item: InventoryItem) => {
    if (!item.item.equipmentSlot) {
      setActionMessage({ text: 'This item cannot be equipped', type: 'error' });
      return;
    }

    // Check level requirement
    if (character.level < item.item.requiredLevel) {
      setActionMessage({ text: `You need to be level ${item.item.requiredLevel} to equip this item`, type: 'error' });
      return;
    }

    // Check class requirement
    if (item.item.requiredClass && item.item.requiredClass !== character.class) {
      setActionMessage({ text: `This item can only be equipped by ${item.item.requiredClass}`, type: 'error' });
      return;
    }

    setEquipping(true);
    try {
      const updatedCharacter = await characterAPI.equipItem(
        character.id,
        item.item.id,
        item.item.equipmentSlot
      );
      setCurrentCharacter(updatedCharacter);
      setSelectedItem(null);
      setActionMessage({ text: `${item.item.name} equipped successfully!`, type: 'success' });
    } catch (error: any) {
      console.error('Failed to equip item:', error);
      setActionMessage({ text: error.response?.data?.message || 'Failed to equip item. Please try again.', type: 'error' });
    } finally {
      setEquipping(false);
    }
  };

  const handleUseConsumable = async (item: InventoryItem) => {
    // Check level requirement
    if (character.level < item.item.requiredLevel) {
      setActionMessage({ text: `You need to be level ${item.item.requiredLevel} to use this item`, type: 'error' });
      return;
    }

    setUsingConsumable(true);
    setConsumableMessage(null);
    try {
      const result = await characterAPI.useConsumable(character.id, item.id);
      setCurrentCharacter(result.character);

      // Build effect message
      const effects: string[] = [];
      if (result.effect.hpRestored > 0) {
        effects.push(`+${result.effect.hpRestored} HP`);
      }
      if (result.effect.manaRestored > 0) {
        effects.push(`+${result.effect.manaRestored} Mana`);
      }

      const message = `Used ${result.effect.itemName}: ${effects.join(', ')}`;
      setConsumableMessage(message);

      // Clear message after 3 seconds
      setTimeout(() => setConsumableMessage(null), 3000);

      // Clear selection if the item was consumed (quantity reached 0)
      const remainingItem = result.character.inventory?.items?.find(i => i.id === item.id);
      if (!remainingItem) {
        setSelectedItem(null);
      }
    } catch (error: any) {
      console.error('Failed to use consumable:', error);
      setActionMessage({ text: error.response?.data?.message || 'Failed to use item. Please try again.', type: 'error' });
    } finally {
      setUsingConsumable(false);
    }
  };

  const handleDepositToVault = async (item: InventoryItem) => {
    setDepositing(true);
    setActionMessage(null);

    try {
      const success = await depositToVault(character.id, item.id, depositQuantity);
      if (success) {
        setActionMessage({ text: `Deposited ${depositQuantity}x ${item.item.name} to vault`, type: 'success' });
        setSelectedItem(null);
        setDepositQuantity(1);
        // Reload vault to sync
        loadVault();
      } else {
        setActionMessage({ text: 'Failed to deposit. Vault may be full.', type: 'error' });
      }

      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Failed to deposit to vault:', error);
      setActionMessage({ text: 'Failed to deposit item', type: 'error' });
    } finally {
      setDepositing(false);
    }
  };

  const handleOpenBox = async (item: InventoryItem) => {
    try {
      const result = await characterAPI.openBox(character.id, item.id);
      setCurrentCharacter(result.updatedCharacter);
      setSelectedItem(null);
      setActionMessage({
        type: 'success',
        text: `Opened ${result.boxName}! Got ${result.rewardCount} item(s)`
      });
    } catch (error: any) {
      setActionMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to open box' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleUseScroll = async (item: InventoryItem) => {
    try {
      const result = await characterAPI.useScroll(character.id, item.id);
      setCurrentCharacter(result.character);
      setSelectedItem(null);
      setActionMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      setActionMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to use scroll' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Get next capacity milestone info
  const getNextMilestone = (): string | null => {
    if (character.level < 30) return `+${BAG_CAPACITY_CONFIG.level30Bonus} slots at Lv.30`;
    if (character.level < 60) return `+${BAG_CAPACITY_CONFIG.level60Bonus} slots at Lv.60`;
    if (!character.hasBattlePass) return `+${BAG_CAPACITY_CONFIG.premiumBonus} slots with Battle Pass`;
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-pixel">
      {/* Inventory Grid */}
      <div className="lg:col-span-2 border-2 border-gray-800 bg-black p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] text-amber-400" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>INVENTORY</h3>
          <div className="text-right">
            <div className="text-gray-400 text-[8px]">
              {inventory.length} / {INVENTORY_SIZE} SLOTS
            </div>
            {getNextMilestone() && (
              <div className="text-gray-600 text-[7px] mt-1">
                {getNextMilestone()}
              </div>
            )}
          </div>
        </div>

        {saving && (
          <div className="mb-3 bg-blue-900/30 border-2 border-blue-700 text-blue-200 px-4 py-2 text-[8px]">
            SAVING CHANGES...
          </div>
        )}

        {consumableMessage && (
          <div className="mb-3 bg-green-900/30 border-2 border-green-700 text-green-200 px-4 py-2 text-[8px] animate-pulse">
            {consumableMessage}
          </div>
        )}

        {actionMessage && (
          <div className={`mb-3 px-4 py-2 text-[8px] border-2 ${
            actionMessage.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-200'
              : 'bg-red-900/30 border-red-700 text-red-200'
          }`}>
            {actionMessage.text}
          </div>
        )}

        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: INVENTORY_SIZE }).map((_, index) => {
            const item = itemBySlot.get(index);
            const isHovered = hoveredSlot === index;
            const isSelected = selectedItem && item && selectedItem.id === item.id;

            return (
              <div
                key={index}
                draggable={!!item}
                onDragStart={(e) => item && handleDragStart(e, item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  aspect-square border-2 p-2 transition-all cursor-pointer
                  ${item ? (isSelected ? 'border-yellow-500 bg-gray-800' : getRarityColor(item.item.rarity)) : 'border-gray-700/50 bg-gray-900/30'}
                  ${isHovered && !item ? 'border-gray-600' : ''}
                  ${draggedItem?.id === item?.id ? 'opacity-50' : ''}
                  ${item ? 'hover:border-yellow-500' : ''}
                `}
                onMouseEnter={() => setHoveredSlot(index)}
                onMouseLeave={() => setHoveredSlot(null)}
                onClick={() => item && handleItemClick(item)}
              >
                {item ? (
                  <div className="relative h-full flex items-center justify-center">
                    {/* Item Icon */}
                    <img
                      src={item.item.icon || getItemIcon(item.item.name)}
                      alt={item.item.name}
                      className="w-full h-full object-contain"
                    />

                    {/* Quantity badge */}
                    {item.quantity > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/80 text-amber-400 text-[6px] px-1 border border-amber-600">
                        {item.quantity}
                      </div>
                    )}

                    {/* Enhancement level */}
                    {(item.item.enhancementLevel || 0) > 0 && (
                      <div className="absolute top-0 left-0 bg-purple-600 text-white text-[6px] px-1 border border-purple-400">
                        +{item.item.enhancementLevel}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600/50 text-[6px]">
                    {index + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inventory Actions */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button className="relative group border-2 border-gray-800 hover:border-gray-600 bg-black py-3 text-gray-400 hover:text-gray-200 text-[8px] transition-colors">
            DESTROY
          </button>
          <button className="relative group border-2 border-gray-800 hover:border-gray-600 bg-black py-3 text-gray-400 hover:text-gray-200 text-[8px] transition-colors">
            SELL
          </button>
          <button className="relative group border-2 border-gray-800 hover:border-gray-600 bg-black py-3 text-gray-400 hover:text-gray-200 text-[8px] transition-colors">
            DROP
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className="border-2 border-gray-800 bg-black p-6">
        <h3 className="text-[14px] text-amber-400 mb-4" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>ITEM DETAILS</h3>

        {selectedItem ? (
          <div className="space-y-4">
            {/* Item Header */}
            <div>
              <div className={`text-[10px] ${
                selectedItem.item.rarity === ItemRarity.PRESTIGE ? 'text-yellow-400' : 'text-gray-300'
              }`}>
                {selectedItem.item.name.toUpperCase()}
                {(selectedItem.item.enhancementLevel || 0) > 0 && (
                  <span className="text-purple-400"> +{selectedItem.item.enhancementLevel}</span>
                )}
              </div>
              <div className="text-[7px] text-gray-400 mt-1">
                {selectedItem.item.rarity} {selectedItem.item.type}
              </div>
            </div>

            {/* Description */}
            {selectedItem.item.description && (
              <p className="text-gray-300 text-[7px] border-t-2 border-gray-800 pt-3">
                {selectedItem.item.description}
              </p>
            )}

            {/* Requirements */}
            <div className="border-t-2 border-gray-800 pt-3 space-y-2">
              <div className="text-[7px]">
                <span className="text-gray-400">REQUIRED LEVEL:</span>
                <span className="text-white ml-2">{selectedItem.item.requiredLevel}</span>
              </div>
              {selectedItem.item.requiredClass && (
                <div className="text-[7px]">
                  <span className="text-gray-400">REQUIRED CLASS:</span>
                  <span className="text-white ml-2">{selectedItem.item.requiredClass}</span>
                </div>
              )}
            </div>

            {/* Stats / Effects */}
            <div className="border-t-2 border-gray-800 pt-3 space-y-1">
              <div className="text-[8px] text-gray-300 mb-2">
                {selectedItem.item.type === 'CONSUMABLE' ? 'EFFECTS:' : 'STATS:'}
              </div>
              {/* Consumable Effects */}
              {selectedItem.item.type === 'CONSUMABLE' && (
                <>
                  {(selectedItem.item.maxHp || 0) > 0 && (
                    <div className="text-[7px] flex justify-between">
                      <span className="text-gray-400">RESTORES HP:</span>
                      <span className="text-red-400">+{selectedItem.item.maxHp}</span>
                    </div>
                  )}
                  {(selectedItem.item.maxMana || 0) > 0 && (
                    <div className="text-[7px] flex justify-between">
                      <span className="text-gray-400">RESTORES MANA:</span>
                      <span className="text-blue-400">+{selectedItem.item.maxMana}</span>
                    </div>
                  )}
                </>
              )}
              {/* Equipment Stats */}
              {(selectedItem.item.physicalAttack || 0) > 0 && (
                <StatLine label="PHYSICAL ATTACK" value={selectedItem.item.physicalAttack || 0} positive />
              )}
              {(selectedItem.item.magicAttack || 0) > 0 && (
                <StatLine label="MAGIC ATTACK" value={selectedItem.item.magicAttack || 0} positive />
              )}
              {(selectedItem.item.physicalDefense || 0) > 0 && (
                <StatLine label="PHYSICAL DEFENSE" value={selectedItem.item.physicalDefense || 0} positive />
              )}
              {(selectedItem.item.magicResistance || 0) > 0 && (
                <StatLine label="MAGIC RESISTANCE" value={selectedItem.item.magicResistance || 0} positive />
              )}
              {(selectedItem.item.strength || 0) > 0 && (
                <StatLine label="STRENGTH" value={selectedItem.item.strength || 0} positive />
              )}
              {(selectedItem.item.agility || 0) > 0 && (
                <StatLine label="AGILITY" value={selectedItem.item.agility || 0} positive />
              )}
              {(selectedItem.item.intelligence || 0) > 0 && (
                <StatLine label="INTELLIGENCE" value={selectedItem.item.intelligence || 0} positive />
              )}
              {(selectedItem.item.vitality || 0) > 0 && (
                <StatLine label="VITALITY" value={selectedItem.item.vitality || 0} positive />
              )}
              {(selectedItem.item.spirit || 0) > 0 && (
                <StatLine label="SPIRIT" value={selectedItem.item.spirit || 0} positive />
              )}
            </div>

            {/* Actions */}
            <div className="border-t-2 border-gray-800 pt-3 space-y-2">
              {selectedItem.item.equipmentSlot && (
                <button
                  className="relative w-full group"
                  onClick={() => handleEquipItem(selectedItem)}
                  disabled={equipping}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-green-400 group-hover:text-green-300 text-[8px] transition-colors">
                    {equipping ? 'EQUIPPING...' : 'EQUIP ITEM'}
                  </div>
                </button>
              )}
              {selectedItem.item.type === 'CONSUMABLE' && (
                <button
                  className="relative w-full group"
                  onClick={() => handleUseConsumable(selectedItem)}
                  disabled={usingConsumable}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-green-400 group-hover:text-green-300 text-[8px] transition-colors">
                    {usingConsumable ? 'USING...' : 'USE ITEM'}
                  </div>
                </button>
              )}

              {/* Open Box */}
              {selectedItem.item.name.includes('Box of') && (
                <button
                  className="relative w-full group"
                  onClick={() => handleOpenBox(selectedItem)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-yellow-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-amber-300 group-hover:text-amber-200 text-[8px] transition-colors">
                    OPEN BOX
                  </div>
                </button>
              )}

              {/* Use Scroll */}
              {selectedItem.item.name.includes('Scroll of') && (
                <button
                  className="relative w-full group"
                  onClick={() => handleUseScroll(selectedItem)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-cyan-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-cyan-300 group-hover:text-cyan-200 text-[8px] transition-colors">
                    USE SCROLL
                  </div>
                </button>
              )}

              {/* Deposit to Vault */}
              <div className="border-t-2 border-gray-800 pt-2 mt-2">
                <div className="text-[8px] text-gray-400 mb-2">TRANSFER TO VAULT</div>
                {selectedItem.quantity > 1 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500 text-[7px]">QTY:</span>
                    <input
                      type="number"
                      min={1}
                      max={selectedItem.quantity}
                      value={depositQuantity}
                      onChange={(e) => setDepositQuantity(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="flex-1 bg-black border-2 border-gray-700 focus:border-gray-500 text-gray-300 text-[8px] px-2 py-1 text-center outline-none"
                    />
                  </div>
                )}
                <button
                  className="relative w-full group disabled:opacity-50"
                  onClick={() => handleDepositToVault(selectedItem)}
                  disabled={depositing}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-600 group-hover:brightness-110 transition-all"></div>
                  <div className="absolute inset-[2px] bg-black"></div>
                  <div className="relative py-2 text-purple-400 group-hover:text-purple-300 text-[8px] transition-colors">
                    {depositing ? 'DEPOSITING...' : 'DEPOSIT TO VAULT'}
                  </div>
                </button>
              </div>

              <button className="w-full border-2 border-gray-800 hover:border-gray-600 bg-black py-2 text-gray-400 hover:text-gray-200 text-[8px] transition-colors">
                DROP (x{selectedItem.quantity})
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-[14px] mb-4 text-gray-700">---</div>
            <p className="text-[8px]">SELECT AN ITEM TO VIEW DETAILS</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for stat lines
const StatLine: React.FC<{ label: string; value: number; positive?: boolean }> = ({
  label,
  value,
  positive = true
}) => (
  <div className="text-[7px] flex justify-between">
    <span className="text-gray-400">{label}:</span>
    <span className={positive ? 'text-green-400' : 'text-red-400'}>
      {positive && '+'}{value}
    </span>
  </div>
);

export default InventoryPanel;
