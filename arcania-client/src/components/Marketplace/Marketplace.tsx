import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character, InventoryItem } from '@/types/game.types';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { tradeAPI, Trade, TradeOfferItem } from '@/services/api.service';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';
import BrowseTab from './BrowseTab';
import SellTab from './SellTab';
import MyListingsTab from './MyListingsTab';

interface Props {
  character: Character;
}

type MarketTab = 'browse' | 'sell' | 'my_listings' | 'direct_trade';

const Marketplace: React.FC<Props> = ({ character }) => {
  const { vault, loadVault } = useVaultStore();
  const [activeTab, setActiveTab] = useState<MarketTab>('browse');

  useEffect(() => {
    loadVault();
  }, []);

  const tabs: { id: MarketTab; label: string }[] = [
    { id: 'browse', label: 'AUCTION HOUSE' },
    { id: 'sell', label: 'SELL ITEMS' },
    { id: 'my_listings', label: 'MY LISTINGS' },
    { id: 'direct_trade', label: 'DIRECT TRADE' },
  ];

  return (
    <div className="font-pixel">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-[9px] tracking-wider border-2 transition-colors ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && <BrowseTab character={character} />}
      {activeTab === 'sell' && <SellTab character={character} vault={vault} />}
      {activeTab === 'my_listings' && <MyListingsTab character={character} />}
      {activeTab === 'direct_trade' && <DirectTradeTab character={character} />}
    </div>
  );
};

// ==================== DIRECT TRADE TAB ====================

const STATUS_BADGES: Record<string, { border: string; text: string; bg: string }> = {
  PENDING: { border: 'border-amber-700', text: 'text-amber-400', bg: 'bg-amber-900/20' },
  ACTIVE: { border: 'border-green-700', text: 'text-green-400', bg: 'bg-green-900/20' },
  LOCKED: { border: 'border-purple-700', text: 'text-purple-400', bg: 'bg-purple-900/20' },
  COMPLETED: { border: 'border-cyan-700', text: 'text-cyan-400', bg: 'bg-cyan-900/20' },
  CANCELLED: { border: 'border-gray-700', text: 'text-gray-400', bg: 'bg-gray-900/20' },
  EXPIRED: { border: 'border-red-700', text: 'text-red-400', bg: 'bg-red-900/20' },
};

const DirectTradeTab: React.FC<{ character: Character }> = ({ character }) => {
  const { user } = useAuthStore();
  const { setCurrentCharacter } = useCharacterStore();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Offer editing state
  const [offerItems, setOfferItems] = useState<TradeOfferItem[]>([]);
  const [offerGold, setOfferGold] = useState(0);
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showMsg = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const loadTrades = useCallback(async () => {
    try {
      const data = await tradeAPI.getActiveTrades();
      setTrades(data);
      // Refresh selected trade if still open
      if (selectedTrade) {
        const updated = data.find((t) => t.id === selectedTrade.id);
        if (updated) {
          setSelectedTrade(updated);
        } else {
          // Trade no longer active, try to fetch it anyway
          try {
            const fetched = await tradeAPI.getTrade(selectedTrade.id);
            setSelectedTrade(fetched);
          } catch {
            setSelectedTrade(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTrade]);

  // Initial load + polling
  useEffect(() => {
    loadTrades();
    pollRef.current = setInterval(loadTrades, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // When selectedTrade changes, re-initialize offer state
  useEffect(() => {
    if (!selectedTrade || !user) {
      setOfferItems([]);
      setOfferGold(0);
      return;
    }
    const myOffer = selectedTrade.offers.find((o) => o.userId === user.id);
    if (myOffer) {
      setOfferItems(myOffer.items);
      setOfferGold(myOffer.goldAmount);
    } else {
      setOfferItems([]);
      setOfferGold(0);
    }
  }, [selectedTrade?.id, user]);

  const handleCreateTrade = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setActionLoading('create');
    try {
      const trade = await tradeAPI.createTrade(trimmed, character.id);
      showMsg(`Trade started with ${trimmed}`, 'success');
      setUsername('');
      setSelectedTrade(trade);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create trade';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptTrade = async (trade: Trade) => {
    setActionLoading('accept');
    try {
      const updated = await tradeAPI.acceptTrade(trade.id);
      showMsg('Trade accepted', 'success');
      setSelectedTrade(updated);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to accept trade';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateOffer = async () => {
    if (!selectedTrade) return;

    setActionLoading('update');
    try {
      const updated = await tradeAPI.updateOffer(
        selectedTrade.id,
        character.id,
        offerItems,
        offerGold
      );
      showMsg('Offer updated', 'success');
      setSelectedTrade(updated);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update offer';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLockOffer = async () => {
    if (!selectedTrade) return;

    setActionLoading('lock');
    try {
      const updated = await tradeAPI.lockOffer(selectedTrade.id);
      showMsg('Offer locked', 'success');
      setSelectedTrade(updated);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to lock offer';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmTrade = async () => {
    if (!selectedTrade) return;

    setActionLoading('confirm');
    try {
      const result = await tradeAPI.confirmTrade(selectedTrade.id, character.id);
      if (result.updatedCharacter) {
        setCurrentCharacter(result.updatedCharacter);
      }
      showMsg(result.message || 'Trade completed!', 'success');
      setSelectedTrade(null);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to confirm trade';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    setActionLoading('cancel');
    try {
      await tradeAPI.cancelTrade(tradeId);
      showMsg('Trade cancelled', 'success');
      if (selectedTrade?.id === tradeId) setSelectedTrade(null);
      await loadTrades();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to cancel trade';
      showMsg(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const addItemToOffer = (invItem: InventoryItem) => {
    const existing = offerItems.find((o) => o.inventoryItemId === invItem.id);
    if (existing) {
      setOfferItems(
        offerItems.map((o) =>
          o.inventoryItemId === invItem.id
            ? { ...o, quantity: Math.min(o.quantity + 1, invItem.quantity) }
            : o
        )
      );
    } else {
      setOfferItems([...offerItems, { inventoryItemId: invItem.id, quantity: 1 }]);
    }
    setShowInventoryPicker(false);
  };

  const removeItemFromOffer = (inventoryItemId: string) => {
    setOfferItems(offerItems.filter((o) => o.inventoryItemId !== inventoryItemId));
  };

  const getCountdown = (expiresAt: string): string => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    if (diff <= 0) return 'EXPIRED';
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const getPartnerName = (trade: Trade): string => {
    if (!user) return '???';
    return trade.initiatorId === user.id
      ? trade.receiver.username
      : trade.initiator.username;
  };

  const myOffer = selectedTrade?.offers.find((o) => o.userId === user?.id);
  const theirOffer = selectedTrade?.offers.find((o) => o.userId !== user?.id);
  const myLocked = myOffer?.isLocked ?? false;
  const theirLocked = theirOffer?.isLocked ?? false;
  const bothLocked = myLocked && theirLocked;
  const isPending = selectedTrade?.status === 'PENDING';
  const isActive = selectedTrade?.status === 'ACTIVE';
  const isLocked = selectedTrade?.status === 'LOCKED';
  const isReceiver = selectedTrade && user ? selectedTrade.receiverId === user.id : false;
  const canEdit = isActive && !myLocked;

  const inventory = character.inventory?.items || [];

  // Items in inventory that match offer item IDs for display
  const getItemName = (inventoryItemId: string): string => {
    const invItem = inventory.find((i) => i.id === inventoryItemId);
    return invItem?.item.name || 'Unknown Item';
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-20 text-[10px]">Loading trades...</div>
    );
  }

  return (
    <div>
      {/* Start Trade */}
      <PixelPanel title="START TRADE" color="amber">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter username to trade with..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTrade();
            }}
            className="flex-1 bg-black border-2 border-gray-800 px-3 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
          />
          <PixelButton
            onClick={handleCreateTrade}
            variant={username.trim() && actionLoading !== 'create' ? 'primary' : 'disabled'}
            size="sm"
          >
            {actionLoading === 'create' ? 'CREATING...' : 'CREATE TRADE'}
          </PixelButton>
        </div>
      </PixelPanel>

      {/* Status Message */}
      {message && (
        <div
          className={`mt-4 border-2 p-3 text-center text-[8px] ${
            message.type === 'success'
              ? 'border-green-700 bg-green-900/20 text-green-400'
              : 'border-red-700 bg-red-900/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Active Trades List */}
        <div className="lg:col-span-4">
          <PixelPanel title={`ACTIVE TRADES (${trades.length})`} color="green">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {trades.length === 0 ? (
                <div className="text-gray-700 text-[8px] text-center py-8">
                  No active trades. Start one above!
                </div>
              ) : (
                trades.map((trade) => {
                  const badge = STATUS_BADGES[trade.status] || STATUS_BADGES.PENDING;
                  const isSelected = selectedTrade?.id === trade.id;

                  return (
                    <button
                      key={trade.id}
                      onClick={() => setSelectedTrade(trade)}
                      className={`w-full text-left p-3 border-2 transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-900/10'
                          : 'border-gray-800 hover:border-gray-700 bg-black'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-gray-300 text-[9px]">
                          {getPartnerName(trade)}
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[6px] border ${badge.border} ${badge.text} ${badge.bg}`}
                        >
                          {trade.status}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600 text-[7px]">
                          Expires: {getCountdown(trade.expiresAt)}
                        </span>
                        {trade.status === 'PENDING' && isReceiver && (
                          <span className="text-amber-500 text-[6px]">NEEDS ACCEPT</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </PixelPanel>
        </div>

        {/* Trade Window */}
        <div className="lg:col-span-8">
          {selectedTrade ? (
            <div className="space-y-4">
              {/* Trade Header */}
              <PixelPanel title="TRADE WINDOW" color="amber">
                <div className="flex justify-between items-center text-[8px]">
                  <div>
                    <span className="text-gray-500">Trading with: </span>
                    <span className="text-amber-400">{getPartnerName(selectedTrade)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className={STATUS_BADGES[selectedTrade.status]?.text || 'text-gray-400'}>
                        {selectedTrade.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires: </span>
                      <span className="text-amber-400">{getCountdown(selectedTrade.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Lock status indicators */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-[7px]">
                    <span
                      className={`w-2 h-2 ${myLocked ? 'bg-green-500' : 'bg-gray-700'}`}
                    />
                    <span className={myLocked ? 'text-green-400' : 'text-gray-500'}>
                      YOUR OFFER {myLocked ? 'LOCKED' : 'UNLOCKED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[7px]">
                    <span
                      className={`w-2 h-2 ${theirLocked ? 'bg-green-500' : 'bg-gray-700'}`}
                    />
                    <span className={theirLocked ? 'text-green-400' : 'text-gray-500'}>
                      THEIR OFFER {theirLocked ? 'LOCKED' : 'UNLOCKED'}
                    </span>
                  </div>
                </div>
              </PixelPanel>

              {/* Pending trade: needs accept from receiver */}
              {isPending && isReceiver && (
                <div className="border-2 border-amber-700 bg-amber-900/10 p-4 text-center">
                  <div className="text-amber-400 text-[9px] mb-3">
                    {selectedTrade.initiator.username} wants to trade with you
                  </div>
                  <PixelButton
                    onClick={() => handleAcceptTrade(selectedTrade)}
                    variant={actionLoading === 'accept' ? 'disabled' : 'success'}
                    size="sm"
                  >
                    {actionLoading === 'accept' ? 'ACCEPTING...' : 'ACCEPT TRADE'}
                  </PixelButton>
                </div>
              )}

              {isPending && !isReceiver && (
                <div className="border-2 border-gray-800 bg-black p-4 text-center">
                  <div className="text-gray-500 text-[9px]">
                    Waiting for {getPartnerName(selectedTrade)} to accept...
                  </div>
                </div>
              )}

              {/* Offer columns (visible when ACTIVE or LOCKED) */}
              {(isActive || isLocked) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Your Offer */}
                  <PixelPanel title="YOUR OFFER" color="green">
                    <div className="space-y-3">
                      {/* Items */}
                      <div>
                        <div className="text-gray-500 text-[7px] mb-2 tracking-widest">ITEMS</div>
                        {offerItems.length === 0 ? (
                          <div className="text-gray-700 text-[8px] text-center py-4">
                            No items added
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {offerItems.map((oi) => (
                              <div
                                key={oi.inventoryItemId}
                                className="flex items-center justify-between p-2 border border-gray-800 bg-black"
                              >
                                <div className="text-gray-300 text-[8px]">
                                  {getItemName(oi.inventoryItemId)}
                                  {oi.quantity > 1 && (
                                    <span className="text-gray-500 ml-1">x{oi.quantity}</span>
                                  )}
                                </div>
                                {canEdit && (
                                  <button
                                    onClick={() => removeItemFromOffer(oi.inventoryItemId)}
                                    className="text-red-500 hover:text-red-400 text-[8px] px-1"
                                  >
                                    X
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => setShowInventoryPicker(!showInventoryPicker)}
                            className="w-full mt-2 border-2 border-dashed border-gray-800 hover:border-gray-600 py-2 text-gray-600 hover:text-gray-400 text-[7px] transition-colors"
                          >
                            + ADD ITEM FROM INVENTORY
                          </button>
                        )}
                      </div>

                      {/* Gold */}
                      <div>
                        <div className="text-gray-500 text-[7px] mb-2 tracking-widest">GOLD</div>
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={character.resources?.gold || 0}
                            value={offerGold}
                            onChange={(e) =>
                              setOfferGold(
                                Math.max(
                                  0,
                                  Math.min(
                                    Number(e.target.value) || 0,
                                    character.resources?.gold || 0
                                  )
                                )
                              )
                            }
                            className="w-full bg-black border-2 border-gray-800 px-3 py-2 text-amber-400 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
                          />
                        ) : (
                          <div className="text-amber-400 text-[9px]">
                            {(myOffer?.goldAmount || 0).toLocaleString()} gold
                          </div>
                        )}
                      </div>
                    </div>
                  </PixelPanel>

                  {/* Their Offer */}
                  <PixelPanel title="THEIR OFFER" color="purple">
                    <div className="space-y-3">
                      {/* Items */}
                      <div>
                        <div className="text-gray-500 text-[7px] mb-2 tracking-widest">ITEMS</div>
                        {!theirOffer || theirOffer.items.length === 0 ? (
                          <div className="text-gray-700 text-[8px] text-center py-4">
                            No items offered yet
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {theirOffer.items.map((oi) => (
                              <div
                                key={oi.inventoryItemId}
                                className="flex items-center justify-between p-2 border border-gray-800 bg-black"
                              >
                                <div className="text-gray-300 text-[8px]">
                                  Item #{oi.inventoryItemId.slice(0, 8)}
                                  {oi.quantity > 1 && (
                                    <span className="text-gray-500 ml-1">x{oi.quantity}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gold */}
                      <div>
                        <div className="text-gray-500 text-[7px] mb-2 tracking-widest">GOLD</div>
                        <div className="text-amber-400 text-[9px]">
                          {(theirOffer?.goldAmount || 0).toLocaleString()} gold
                        </div>
                      </div>
                    </div>
                  </PixelPanel>
                </div>
              )}

              {/* Inventory Picker */}
              {showInventoryPicker && canEdit && (
                <PixelPanel title="SELECT ITEM FROM INVENTORY" color="cyan">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto">
                    {inventory.length === 0 ? (
                      <div className="col-span-4 text-gray-700 text-[8px] text-center py-4">
                        Inventory is empty
                      </div>
                    ) : (
                      inventory.map((invItem) => {
                        const alreadyAdded = offerItems.some(
                          (o) => o.inventoryItemId === invItem.id
                        );
                        return (
                          <button
                            key={invItem.id}
                            onClick={() => addItemToOffer(invItem)}
                            disabled={alreadyAdded}
                            className={`text-left p-2 border-2 transition-colors text-[7px] ${
                              alreadyAdded
                                ? 'border-gray-800 text-gray-700 cursor-not-allowed'
                                : 'border-gray-800 hover:border-cyan-700 text-gray-300 hover:text-cyan-300'
                            }`}
                          >
                            <div className="truncate">{invItem.item.name}</div>
                            {invItem.quantity > 1 && (
                              <div className="text-gray-600 text-[6px]">x{invItem.quantity}</div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </PixelPanel>
              )}

              {/* Action Buttons */}
              {(isActive || isLocked || isPending) && (
                <div className="flex gap-2">
                  {/* Update Offer (only when active and not locked) */}
                  {canEdit && (
                    <PixelButton
                      onClick={handleUpdateOffer}
                      variant={actionLoading === 'update' ? 'disabled' : 'primary'}
                      size="sm"
                      className="flex-1"
                    >
                      {actionLoading === 'update' ? 'UPDATING...' : 'UPDATE OFFER'}
                    </PixelButton>
                  )}

                  {/* Lock Offer */}
                  {isActive && !myLocked && (
                    <PixelButton
                      onClick={handleLockOffer}
                      variant={actionLoading === 'lock' ? 'disabled' : 'accent'}
                      size="sm"
                      className="flex-1"
                    >
                      {actionLoading === 'lock' ? 'LOCKING...' : 'LOCK OFFER'}
                    </PixelButton>
                  )}

                  {/* Confirm Trade (both locked) */}
                  {(isActive || isLocked) && bothLocked && (
                    <PixelButton
                      onClick={handleConfirmTrade}
                      variant={actionLoading === 'confirm' ? 'disabled' : 'success'}
                      size="sm"
                      className="flex-1"
                    >
                      {actionLoading === 'confirm' ? 'CONFIRMING...' : 'CONFIRM TRADE'}
                    </PixelButton>
                  )}

                  {/* Cancel */}
                  <PixelButton
                    onClick={() => handleCancelTrade(selectedTrade.id)}
                    variant={actionLoading === 'cancel' ? 'disabled' : 'danger'}
                    size="sm"
                    className="flex-1"
                  >
                    {actionLoading === 'cancel' ? 'CANCELLING...' : 'CANCEL TRADE'}
                  </PixelButton>
                </div>
              )}
            </div>
          ) : (
            <PixelPanel color="gray">
              <div className="text-center text-gray-700 text-[9px] py-16">
                SELECT A TRADE OR START A NEW ONE
              </div>
            </PixelPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
