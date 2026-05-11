import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useVaultStore } from '@/store/useVaultStore';
import { characterAPI } from '@/services/api.service';
import { Character } from '@/types/game.types';
import CreateCharacterModal from '../Character/CreateCharacterModal';
import EquipmentPreview from '../Equipment/EquipmentPreview';
import { RACE_INFO, CLASS_INFO } from '@/constants/game.constants';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { mergeEquipmentSpriteInfo } from '@/config/item-sprite-mapping';
import { SpinnerModal } from './SpinnerModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentCharacter, setCharacters } = useCharacterStore();
  const { accountWallet, loadWalletFromServer } = useWalletStore();
  const { loadVault, vault } = useVaultStore();

  const [characters, setCharacterList] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    loadCharacters();
    loadWalletFromServer();
    loadVault();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await characterAPI.getAll();
      setCharacterList(chars);
      setCharacters(chars);
    } catch (err) {
      console.error('Failed to load characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = async (character: Character) => {
    setSelectedChar(character.id);
    try {
      const fullCharacter = await characterAPI.getById(character.id);
      setCurrentCharacter(fullCharacter);
      navigate('/character-management');
    } catch (err) {
      console.error('Failed to load character:', err);
      setSelectedChar(null);
    }
  };

  const handleNewHero = () => {
    if (characters.length >= 5) return; // Max 5 heroes
    if (accountWallet.creationTokens > 0) {
      setShowCreate(true);
    } else {
      setShowSpinner(true);
    }
  };

  const handleCharacterCreated = async () => {
    // Server already deducts creation token in createCharacter — just sync wallet
    await loadWalletFromServer();
    setShowCreate(false);
    loadCharacters();
  };

  const getDeleteConfirmPhrase = (name: string) => `Delete ${name}`;

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== getDeleteConfirmPhrase(deleteTarget.name)) return;

    try {
      await characterAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      loadCharacters();
    } catch (err) {
      console.error('Failed to delete character:', err);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteConfirmText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-pixel">
        <div className="animate-pulse text-purple-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black p-6 relative overflow-hidden flex flex-col justify-center font-pixel"
    >
      {/* Top Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/80 border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Left */}
          <div className="text-amber-500 text-[15px]">ARCANIA</div>

          {/* Wallet - Centered */}
          <div className="flex items-center gap-5 text-[10px]">
            {/* Gold */}
            <div className="relative group flex items-center gap-1.5 cursor-help">
              <img src="/assets/icons/gold.png" alt="Gold" className="w-[22px] h-[22px]" />
              <span className="text-gray-300">{(vault?.gold ?? 0).toLocaleString()}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                <div className="text-amber-400 text-[8px] mb-1">GOLD</div>
                <div className="text-gray-500 text-[7px]">In-game currency for items & upgrades</div>
              </div>
            </div>
            {/* Arcanite */}
            <div className="relative group flex items-center gap-1.5 cursor-help">
              <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-[22px] h-[22px]" />
              <span className="text-gray-300">{(vault?.arcanite ?? 0).toLocaleString()}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                <div className="text-cyan-400 text-[8px] mb-1">ARCANITE</div>
                <div className="text-gray-500 text-[7px]">Premium currency for rare items</div>
              </div>
            </div>
            {/* Creation Token */}
            <div className="relative group flex items-center gap-1.5 cursor-help">
              <img src="/assets/icons/creation-token.png" alt="Creation Token" className="w-[22px] h-[22px]" />
              <span className="text-gray-300">{accountWallet.creationTokens}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                <div className="text-purple-400 text-[8px] mb-1">CREATION TOKEN</div>
                <div className="text-gray-500 text-[7px]">Required to create new characters</div>
              </div>
            </div>
          </div>

          {/* Daily Spin Button - Right */}
          <button
            onClick={() => setShowSpinner(true)}
            className="relative border border-amber-700 hover:border-amber-500 bg-amber-900/20 hover:bg-amber-900/40 px-4 py-2 text-amber-400 text-[9px] transition-colors"
          >
            DAILY SPIN
            {accountWallet.spinsRemaining > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-black text-[7px] w-4 h-4 flex items-center justify-center">
                {accountWallet.spinsRemaining}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full pt-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-amber-500 text-lg mb-3 tracking-wider">SELECT YOUR HERO</div>
          <div className="text-gray-600 text-[10px]">{characters.length} / 5 SLOTS</div>
        </div>

        {/* 5 Character Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
          {Array.from({ length: 5 }).map((_, index) => {
            const char = characters[index];
            if (char) {
              return (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={selectedChar === char.id}
                  onSelect={() => handleSelectCharacter(char)}
                  onDelete={() => setDeleteTarget(char)}
                />
              );
            }
            // Empty slot
            return (
              <div
                key={`slot-${index}`}
                onClick={characters.length < 5 ? handleNewHero : undefined}
                className={`relative border-2 border-dashed border-gray-800 bg-black flex flex-col items-center justify-center min-h-[240px] ${
                  characters.length < 5
                    ? 'cursor-pointer hover:border-amber-600 hover:bg-amber-900/10 transition-all'
                    : 'opacity-50'
                }`}
              >
                <div className="text-4xl text-gray-700 mb-2">+</div>
                <div className="text-gray-600 text-[8px]">SLOT {index + 1}</div>
                {characters.length < 5 && accountWallet.creationTokens === 0 && (
                  <div className="absolute bottom-3 flex items-center gap-1">
                    <img src="/assets/icons/creation-token.png" alt="Creation Token" className="w-[20px] h-[20px]" />
                    <span className="text-gray-400 text-[7px]">CREATION TOKEN REQUIRED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Back Button - Fixed Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => navigate('/')}
          className="border border-gray-800 hover:border-gray-600 bg-black px-6 py-3 text-gray-500 hover:text-gray-300 text-[9px] transition-colors"
        >
          ← BACK
        </button>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateCharacterModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleCharacterCreated}
        />
      )}

      {showSpinner && (
        <SpinnerModal onClose={() => { setShowSpinner(false); loadVault(); }} />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/90" onClick={handleCloseDeleteModal} />
          <div className="relative bg-black border border-red-900/50 p-6 max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-red-400 text-[12px]">DELETE CHARACTER</div>
              <button onClick={handleCloseDeleteModal} aria-label="Close" className="text-gray-600 hover:text-gray-400 text-[14px]">✕</button>
            </div>

            {/* Character Info */}
            <div className="border border-gray-800 bg-gray-900/30 p-4 mb-4">
              <div className="text-amber-400 text-[11px] mb-1">{deleteTarget.name}</div>
              <div className="text-gray-500 text-[8px]">
                LV.{deleteTarget.level} {RACE_INFO[deleteTarget.race]?.name} • {CLASS_INFO[deleteTarget.class]?.name}
              </div>
            </div>

            {/* Warning */}
            <div className="border border-gray-800 bg-gray-900/30 p-4 mb-4">
              <div className="text-red-400 text-[8px] mb-2">CHARACTER PROGRESS WILL BE LOST</div>
              <ul className="text-gray-500 text-[7px] space-y-1.5 leading-relaxed">
                <li>• Character level, stats, and abilities will be erased</li>
                <li>• This action cannot be undone</li>
              </ul>
              <div className="border-t border-gray-800 mt-3 pt-3">
                <div className="text-amber-400 text-[8px] mb-2">ITEMS WILL BE SAVED</div>
                <ul className="text-gray-500 text-[7px] space-y-1.5 leading-relaxed">
                  <li>• All equipped items will be moved to your account vault</li>
                  <li>• All inventory items will be moved to your account vault</li>
                </ul>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <div className="text-gray-500 text-[7px] mb-2">
                Type <span className="text-red-400">Delete {deleteTarget.name}</span> to confirm:
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Delete ${deleteTarget.name}`}
                className="w-full bg-black border border-gray-800 focus:border-red-800 px-3 py-2 text-gray-300 text-[9px] outline-none transition-colors font-pixel"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 border border-gray-700 hover:border-gray-600 py-2.5 text-gray-400 text-[8px] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== getDeleteConfirmPhrase(deleteTarget.name)}
                className={`flex-1 border py-2.5 text-[8px] transition-colors ${
                  deleteConfirmText === getDeleteConfirmPhrase(deleteTarget.name)
                    ? 'border-red-700 hover:border-red-500 bg-red-900/20 text-red-400'
                    : 'border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                DELETE FOREVER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Character Card
const CharacterCard: React.FC<{
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ character, isSelected, onSelect, onDelete }) => {
  const { playClick } = useSoundEffects();
  const gender = character.gender || 'male';

  const equipment = character.equipment || {} as any;
  const spriteInfo = mergeEquipmentSpriteInfo(
    equipment.head, equipment.chest, equipment.legs,
    equipment.gloves, equipment.boots, undefined,
    equipment.cape, equipment.wings, equipment.weapon, equipment.offHand
  );

  const currentHp = character.resources?.currentHp || 100;
  const maxHp = character.resources?.maxHp || 100;
  const currentMp = character.resources?.currentMana || 50;
  const maxMp = character.resources?.maxMana || 50;

  return (
    <div
      onClick={() => { playClick(); onSelect(); }}
      aria-label={`Select ${character.name}`}
      className={`relative cursor-pointer border-2 min-h-[240px] ${
        isSelected ? 'border-amber-500' : 'border-gray-800 hover:border-gray-600'
      } bg-black transition-all p-3`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); playClick(); onDelete(); }}
        aria-label={`Delete ${character.name}`}
        className="absolute top-2 right-2 text-gray-700 hover:text-red-400 text-[10px] z-10"
      >
        X
      </button>

      <div className="text-center mb-2">
        <div className="text-amber-400 text-[10px]">{character.name}</div>
        <div className="text-gray-600 text-[7px]">
          LV.{character.level} {RACE_INFO[character.race]?.name} • {CLASS_INFO[character.class]?.name}
        </div>
      </div>

      <div className="flex justify-center -my-4">
        <EquipmentPreview
          race={character.race}
          characterClass={character.class}
          gender={gender}
          scale={2.5}
          showControls={false}
          autoPlay={true}
          hideBackground={true}
          spriteInfo={spriteInfo}
        />
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-[6px] text-gray-500 w-4">HP</span>
          <div className="flex-1 h-1.5 bg-gray-900 border border-gray-800">
            <div className="h-full bg-red-600" style={{ width: `${(currentHp / maxHp) * 100}%` }} />
          </div>
          <span className="text-[6px] text-red-400 w-6 text-right">{currentHp}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[6px] text-gray-500 w-4">MP</span>
          <div className="flex-1 h-1.5 bg-gray-900 border border-gray-800">
            <div className="h-full bg-blue-600" style={{ width: `${(currentMp / maxMp) * 100}%` }} />
          </div>
          <span className="text-[6px] text-blue-400 w-6 text-right">{currentMp}</span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); playClick(); onSelect(); }}
        className="w-full mt-3 border border-amber-800 bg-amber-900/20 hover:bg-amber-900/40 py-1.5 text-amber-400 text-[8px]"
      >
        ENTER
      </button>
    </div>
  );
};

export default Dashboard;
