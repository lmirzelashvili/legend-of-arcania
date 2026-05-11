import React, { useState, useEffect } from 'react';
import { Character, Vault } from '@/types/game.types';
import { useVaultStore } from '@/store/useVaultStore';

interface VaultBankProps {
  vault: Vault;
  characters: Character[];
}

const VaultBank: React.FC<VaultBankProps> = ({ vault, characters }) => {
  const { withdrawCurrency, depositCurrency } = useVaultStore();

  const defaultCharacter = characters[0];
  const [bankCharacterId, setBankCharacterId] = useState<string>(defaultCharacter?.id || '');
  const [showBankCharacterDropdown, setShowBankCharacterDropdown] = useState(false);
  const [isWithdrawingCurrency, setIsWithdrawingCurrency] = useState(false);
  const [isDepositingCurrency, setIsDepositingCurrency] = useState(false);
  const [goldAmount, setGoldAmount] = useState('');
  const [arcaniteAmount, setArcaniteAmount] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Keep bankCharacterId in sync if characters change
  useEffect(() => {
    if (defaultCharacter && !characters.find(c => c.id === bankCharacterId)) {
      setBankCharacterId(defaultCharacter.id);
    }
  }, [characters, defaultCharacter, bankCharacterId]);

  const bankCharacter = characters.find(c => c.id === bankCharacterId) || defaultCharacter;

  const handleWithdrawCurrency = async (currency: 'gold' | 'arcanite') => {
    if (!vault || isWithdrawingCurrency) return;
    const inputAmount = currency === 'gold' ? goldAmount : arcaniteAmount;
    const parsed = parseInt(inputAmount);
    const vaultBalance = currency === 'gold' ? vault.gold : vault.arcanite;
    const amount = parsed > 0 ? Math.min(parsed, vaultBalance) : vaultBalance;
    if (amount <= 0) return;

    setIsWithdrawingCurrency(true);
    setMessage(null);

    try {
      const success = await withdrawCurrency(bankCharacterId, currency, amount);
      if (success) {
        setMessage({
          text: `Withdrew ${amount.toLocaleString()} ${currency} to ${bankCharacter.name}`,
          type: 'success',
        });
        if (currency === 'gold') setGoldAmount(''); else setArcaniteAmount('');
      } else {
        setMessage({ text: `Failed to withdraw ${currency}. Check console for details.`, type: 'error' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || `Failed to withdraw ${currency}`;
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsWithdrawingCurrency(false);
    }
  };

  const handleDepositCurrency = async (currency: 'gold' | 'arcanite') => {
    if (!vault || isDepositingCurrency) return;
    const inputAmount = currency === 'gold' ? goldAmount : arcaniteAmount;
    const parsed = parseInt(inputAmount);
    const charBalance = currency === 'gold'
      ? (bankCharacter.resources?.gold || 0)
      : (bankCharacter.resources?.arcanite || 0);
    const amount = parsed > 0 ? Math.min(parsed, charBalance) : charBalance;
    if (amount <= 0) return;

    setIsDepositingCurrency(true);
    setMessage(null);

    try {
      const success = await depositCurrency(bankCharacterId, currency, amount);
      if (success) {
        setMessage({
          text: `Deposited ${amount.toLocaleString()} ${currency} from ${bankCharacter.name}`,
          type: 'success',
        });
        if (currency === 'gold') setGoldAmount(''); else setArcaniteAmount('');
      } else {
        setMessage({ text: `Failed to deposit ${currency}. Check console for details.`, type: 'error' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || `Failed to deposit ${currency}`;
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsDepositingCurrency(false);
    }
  };

  if (!bankCharacter) return null;

  return (
    <div className="border border-gray-800 bg-gray-900/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-[10px]">BANK</div>

        {/* Character selector */}
        {characters.length > 1 && (
          <div className="relative">
            <div
              onClick={() => setShowBankCharacterDropdown(!showBankCharacterDropdown)}
              className="flex items-center justify-between min-w-[240px] bg-black border border-gray-700 hover:border-amber-600 px-3 py-1.5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-[9px]">{bankCharacter.name}</span>
                <span className="text-gray-600 text-[8px]">Lv.{bankCharacter.level} {bankCharacter.class}</span>
              </div>
              <span className={`text-gray-500 text-[8px] transition-transform ${showBankCharacterDropdown ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {showBankCharacterDropdown && (
              <div className="absolute z-20 top-full right-0 mt-1 bg-black border border-gray-700 min-w-[240px] max-h-40 overflow-y-auto">
                {[...characters].sort((a, b) => a.id === bankCharacterId ? -1 : b.id === bankCharacterId ? 1 : 0).map((char) => (
                  <div
                    key={char.id}
                    onClick={() => {
                      setBankCharacterId(char.id);
                      setShowBankCharacterDropdown(false);
                    }}
                    className={`px-3 py-2 cursor-pointer text-[9px] flex items-center justify-between transition-colors ${
                      char.id === bankCharacterId
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
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-2 mb-4 text-[9px] border ${
          message.type === 'success'
            ? 'border-green-800 bg-green-900/20 text-green-400'
            : 'border-red-800 bg-red-900/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Gold Panel */}
        <div className="border border-gray-700 bg-black/40 p-4 space-y-3">
          <div className="text-amber-400 text-[11px] font-bold pb-2 border-b border-gray-800">GOLD</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-[8px] mb-1">{bankCharacter.name.toUpperCase()}</div>
              <div className="flex items-center gap-1.5">
                <img src="/assets/icons/gold.png" alt="Gold" className="w-4 h-4" />
                <span className="text-amber-300 text-[12px]">{(bankCharacter.resources?.gold || 0).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-[8px] mb-1">VAULT</div>
              <div className="flex items-center gap-1.5">
                <img src="/assets/icons/gold.png" alt="Gold" className="w-4 h-4" />
                <span className="text-amber-300 text-[12px]">{vault.gold.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={goldAmount}
            onChange={(e) => setGoldAmount(e.target.value)}
            className="w-full bg-black border border-gray-700 focus:border-amber-600 text-gray-300 text-[10px] px-3 py-2 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDepositCurrency('gold')}
              disabled={isDepositingCurrency || (bankCharacter.resources?.gold || 0) <= 0}
              className="border border-gray-600 hover:border-amber-500 bg-gray-900/40 py-2 text-gray-300 hover:text-amber-400 text-[9px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDepositingCurrency ? '...' : 'DEPOSIT'}
            </button>
            <button
              onClick={() => handleWithdrawCurrency('gold')}
              disabled={isWithdrawingCurrency || vault.gold <= 0}
              className="border border-amber-700 hover:border-amber-500 bg-amber-900/20 py-2 text-amber-400 text-[9px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isWithdrawingCurrency ? '...' : 'WITHDRAW'}
            </button>
          </div>
        </div>

        {/* Arcanite Panel */}
        <div className="border border-gray-700 bg-black/40 p-4 space-y-3">
          <div className="text-cyan-400 text-[11px] font-bold pb-2 border-b border-gray-800">ARCANITE</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-[8px] mb-1">{bankCharacter.name.toUpperCase()}</div>
              <div className="flex items-center gap-1.5">
                <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-4 h-4" />
                <span className="text-cyan-300 text-[12px]">{(bankCharacter.resources?.arcanite || 0).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-[8px] mb-1">VAULT</div>
              <div className="flex items-center gap-1.5">
                <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-4 h-4" />
                <span className="text-cyan-300 text-[12px]">{vault.arcanite.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={arcaniteAmount}
            onChange={(e) => setArcaniteAmount(e.target.value)}
            className="w-full bg-black border border-gray-700 focus:border-cyan-600 text-gray-300 text-[10px] px-3 py-2 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDepositCurrency('arcanite')}
              disabled={isDepositingCurrency || (bankCharacter.resources?.arcanite || 0) <= 0}
              className="border border-green-700 hover:border-green-500 bg-green-900/20 py-2 text-green-400 text-[9px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDepositingCurrency ? '...' : 'DEPOSIT'}
            </button>
            <button
              onClick={() => handleWithdrawCurrency('arcanite')}
              disabled={isWithdrawingCurrency || vault.arcanite <= 0}
              className="border border-green-700 hover:border-green-500 bg-green-900/20 py-2 text-green-400 text-[9px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isWithdrawingCurrency ? '...' : 'WITHDRAW'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultBank;
