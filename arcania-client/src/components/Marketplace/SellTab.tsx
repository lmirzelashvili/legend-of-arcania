import React, { useState } from 'react';
import {
  Character,
  Item,
  ListingCurrency,
  InventoryItem,
  VaultItem,
  Vault,
} from '@/types/game.types';
import { marketplaceAPI } from '@/services/api.service';
import { useVaultStore } from '@/store/useVaultStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { getItemIcon } from '@/config/asset-registry';
import PixelPanel from '@/components/ui/PixelPanel';

interface SellTabProps {
  character: Character;
  vault: Vault | null;
}

const SellTab: React.FC<SellTabProps> = ({ character, vault }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const { loadVault } = useVaultStore();
  const [itemSource, setItemSource] = useState<'bag' | 'vault'>('bag');
  const [selectedItem, setSelectedItem] = useState<{ invItem?: InventoryItem; vaultItem?: VaultItem } | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<ListingCurrency>('gold');
  const [quantity, setQuantity] = useState(1);
  const [isListing, setIsListing] = useState(false);
  const [message, setMessage] = useState('');

  const bagItems = character.inventory?.items || [];
  const vaultItems = vault?.items || [];
  const sourceItems = itemSource === 'bag' ? bagItems : vaultItems;

  const selectedItemData = selectedItem
    ? (selectedItem.invItem?.item || selectedItem.vaultItem?.item)
    : null;
  const selectedMaxQty = selectedItem
    ? (selectedItem.invItem?.quantity || selectedItem.vaultItem?.quantity || 1)
    : 1;

  const fee = price ? Math.ceil(parseInt(price) * 0.05) : 0;
  const youReceive = price ? parseInt(price) - fee : 0;

  const handleList = async () => {
    if (!selectedItemData || !price || parseInt(price) <= 0) return;

    setIsListing(true);
    setMessage('');
    try {
      const result = await marketplaceAPI.createListing({
        characterId: character.id,
        inventoryItemId: selectedItem?.invItem?.id,
        vaultItemId: selectedItem?.vaultItem?.id,
        itemSource,
        price: parseInt(price),
        currency,
        quantity,
      });

      if (result.success) {
        setMessage('Listed successfully!');
        if (result.updatedCharacter) setCurrentCharacter(result.updatedCharacter);
        if (result.updatedVault) loadVault();
        setSelectedItem(null);
        setPrice('');
        setQuantity(1);
      } else {
        setMessage(result.message);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to list item');
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Source Toggle + Item Grid */}
      <div className="lg:col-span-7">
        <PixelPanel title="SELECT ITEM TO SELL" color="amber">
          {/* Source Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setItemSource('bag'); setSelectedItem(null); }}
              className={`flex-1 py-2 text-[8px] border-2 transition-colors ${
                itemSource === 'bag' ? 'border-amber-500 text-amber-400' : 'border-gray-800 text-gray-500 hover:border-gray-700'
              }`}
            >
              BAG ({bagItems.length})
            </button>
            <button
              onClick={() => { setItemSource('vault'); setSelectedItem(null); }}
              className={`flex-1 py-2 text-[8px] border-2 transition-colors ${
                itemSource === 'vault' ? 'border-cyan-500 text-cyan-400' : 'border-gray-800 text-gray-500 hover:border-gray-700'
              }`}
            >
              VAULT ({vaultItems.length})
            </button>
          </div>

          {/* Item Grid */}
          <div className="max-h-[500px] overflow-y-auto pr-1">
            {sourceItems.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-[8px]">NO ITEMS</div>
            ) : (
              <div className={`grid ${itemSource === 'bag' ? 'grid-cols-8' : 'grid-cols-10'} gap-2`}>
                {sourceItems.map((entry: any) => {
                  const item: Item = entry.item;
                  const qty: number = entry.quantity;
                  const isSelected = itemSource === 'bag'
                    ? selectedItem?.invItem?.id === entry.id
                    : selectedItem?.vaultItem?.id === entry.id;

                  const rarityBorder = item.rarity === 'PRESTIGE'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-900/30';

                  return (
                    <div
                      key={entry.id}
                      onClick={() => {
                        if (itemSource === 'bag') {
                          setSelectedItem({ invItem: entry });
                        } else {
                          setSelectedItem({ vaultItem: entry });
                        }
                        setQuantity(1);
                        setPrice('');
                      }}
                      className={`relative aspect-square cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-amber-500 ring-1 ring-amber-500'
                          : `${rarityBorder} hover:border-amber-600`
                      }`}
                      title={`${item.name}${qty > 1 ? ` x${qty}` : ''}${(item.enhancementLevel || 0) > 0 ? ` +${item.enhancementLevel}` : ''}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={item.icon || getItemIcon(item.name)} alt={item.name} className="w-full h-full object-contain p-1" />

                        {/* Quantity badge */}
                        {qty > 1 && (
                          <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[7px] px-1">
                            {qty}
                          </div>
                        )}

                        {/* Enhancement level */}
                        {(item.enhancementLevel || 0) > 0 && (
                          <div className="absolute top-0 left-0 bg-purple-600 text-white text-[6px] px-0.5">
                            +{item.enhancementLevel}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PixelPanel>
      </div>

      {/* Listing Form */}
      <div className="lg:col-span-5">
        <PixelPanel title="CREATE LISTING" color="green">
          {selectedItemData ? (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="flex items-center gap-3 p-3 border-2 border-gray-800">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src={selectedItemData.icon || getItemIcon(selectedItemData.name)} alt={selectedItemData.name} className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <div className={`text-[9px] ${selectedItemData.rarity === 'PRESTIGE' ? 'text-purple-400' : 'text-amber-400'}`}>
                    {selectedItemData.name.toUpperCase()}
                    {(selectedItemData.enhancementLevel || 0) > 0 && (
                      <span className="text-yellow-400"> +{selectedItemData.enhancementLevel}</span>
                    )}
                  </div>
                  <div className="text-[7px] text-gray-600">
                    {selectedItemData.type} • {selectedItemData.rarity} • LV {selectedItemData.requiredLevel}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              {selectedItemData.stackable && selectedMaxQty > 1 && (
                <div>
                  <label className="block text-gray-500 text-[8px] mb-1">QUANTITY (MAX {selectedMaxQty})</label>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={selectedMaxQty}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(selectedMaxQty, parseInt(e.target.value) || 1)))}
                    className="w-full bg-black border-2 border-gray-800 px-3 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-green-600 font-pixel"
                  />
                </div>
              )}

              {/* Currency Toggle */}
              <div>
                <label className="block text-gray-500 text-[8px] mb-1">CURRENCY</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrency('gold')}
                    className={`flex-1 py-2 text-[8px] border-2 flex items-center justify-center gap-1.5 transition-colors ${
                      currency === 'gold' ? 'border-amber-500 text-amber-400' : 'border-gray-800 text-gray-500'
                    }`}
                  >
                    <img src="/assets/icons/gold.png" alt="" className="w-3.5 h-3.5" /> GOLD
                  </button>
                  <button
                    onClick={() => setCurrency('arcanite')}
                    className={`flex-1 py-2 text-[8px] border-2 flex items-center justify-center gap-1.5 transition-colors ${
                      currency === 'arcanite' ? 'border-cyan-500 text-cyan-400' : 'border-gray-800 text-gray-500'
                    }`}
                  >
                    <img src="/assets/icons/arcanite.png" alt="" className="w-3.5 h-3.5" /> ARCANITE
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-500 text-[8px] mb-1">LISTING PRICE</label>
                <input
                  type="number"
                  value={price}
                  min={1}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price..."
                  className="w-full bg-black border-2 border-gray-800 px-3 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-green-600 font-pixel"
                />
              </div>

              {/* Fee Preview */}
              <div className="border-2 border-gray-800 p-3 space-y-2">
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">LISTING PRICE:</span>
                  <span className="text-white">{price ? parseInt(price).toLocaleString() : '0'} {currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-red-400">5% FEE:</span>
                  <span className="text-red-400">-{fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[8px] pt-2 border-t border-gray-800">
                  <span className="text-green-400">YOU RECEIVE:</span>
                  <span className="text-green-400">{youReceive > 0 ? youReceive.toLocaleString() : '0'} {currency.toUpperCase()}</span>
                </div>
              </div>

              {/* List Button */}
              <button
                onClick={handleList}
                disabled={!price || parseInt(price) <= 0 || isListing}
                className="relative w-full group disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110 transition-all"></div>
                <div className="absolute inset-[2px] bg-black"></div>
                <div className="relative py-3 text-[10px] text-green-400 group-hover:text-green-300 transition-colors">
                  {isListing ? 'LISTING...' : 'LIST ITEM'}
                </div>
              </button>

              {message && (
                <div className={`text-[8px] text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 text-[8px]">
              SELECT AN ITEM TO SELL
            </div>
          )}
        </PixelPanel>
      </div>
    </div>
  );
};

export default SellTab;
