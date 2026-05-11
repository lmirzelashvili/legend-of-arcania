import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useWalletStore } from '@/store/useWalletStore';
import { characterAPI } from '@/services/api.service';
import { Character } from '@/types/game.types';
import CreateCharacterModal from '../Character/CreateCharacterModal';
import EquipmentPreview from '../Equipment/EquipmentPreview';
import { RACE_INFO, CLASS_INFO } from '@/constants/game.constants';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface HeroesTabProps {
  onSwitchToSpin: () => void;
}

export const HeroesTab: React.FC<HeroesTabProps> = ({ onSwitchToSpin }) => {
  const navigate = useNavigate();
  const { setCurrentCharacter, setCharacters } = useCharacterStore();
  const { accountWallet, loadWalletFromServer } = useWalletStore();

  const [characters, setCharacterList] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [showTokenWarning, setShowTokenWarning] = useState(false);

  useEffect(() => {
    loadCharacters();
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

  const handleDeleteCharacter = (character: Character) => {
    setDeleteTarget(character);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await characterAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadCharacters();
    } catch (err) {
      console.error('Failed to delete character:', err);
    }
  };

  const handleNewHero = () => {
    if (accountWallet.creationTokens > 0) {
      setShowCreate(true);
    } else {
      setShowTokenWarning(true);
    }
  };

  const handleCharacterCreated = async () => {
    // Server already deducts creation token in createCharacter — just sync wallet
    await loadWalletFromServer();
    setShowCreate(false);
    loadCharacters();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-xl text-center">
          <div className="animate-pulse text-purple-400">Loading Heroes...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {characters.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            isSelected={selectedChar === char.id}
            onSelect={() => handleSelectCharacter(char)}
            onDelete={() => handleDeleteCharacter(char)}
          />
        ))}

        {/* Create New Character Card */}
        <div
          onClick={handleNewHero}
          className="cursor-pointer border-2 border-dashed border-gray-800 hover:border-amber-600 bg-black hover:bg-amber-900/10 transition-all flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="text-4xl text-gray-700 hover:text-amber-500 mb-3 transition-colors">+</div>
          <div className="text-gray-600 text-[9px]">NEW HERO</div>
          {accountWallet.creationTokens === 0 && (
            <div className="text-red-500 text-[7px] mt-2">NEED TOKEN</div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateCharacterModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleCharacterCreated}
        />
      )}

      {/* Token Warning Modal */}
      {showTokenWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowTokenWarning(false)}
          />
          <div className="relative bg-black border border-gray-700 p-6 max-w-sm mx-4">
            <div className="text-center mb-5">
              <div className="text-amber-400 text-[11px] tracking-wider mb-3">CREATION TOKEN REQUIRED</div>
              <p className="text-gray-500 text-[8px] leading-relaxed">
                You need a Creation Token to create a new hero. Earn one from the Daily Spin or purchase from the Store.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTokenWarning(false)}
                className="flex-1 border border-gray-700 hover:border-gray-600 py-2 text-gray-400 hover:text-gray-300 text-[8px] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowTokenWarning(false);
                  onSwitchToSpin();
                }}
                className="flex-1 border border-amber-700 hover:border-amber-600 py-2 text-amber-400 hover:text-amber-300 text-[8px] transition-colors"
              >
                DAILY SPIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-black border border-gray-700 p-6 max-w-sm mx-4">
            <div className="text-center mb-5">
              <div className="text-gray-400 text-[10px] tracking-wider mb-3">DELETE CHARACTER?</div>
              <div className="text-amber-400 text-[13px]">{deleteTarget.name}</div>
              <div className="text-gray-600 text-[7px] mt-1">
                LV.{deleteTarget.level} {RACE_INFO[deleteTarget.race]?.name} - {CLASS_INFO[deleteTarget.class]?.name}
              </div>
            </div>
            <p className="text-gray-500 text-[8px] leading-relaxed text-center mb-6">
              All progress and items will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-700 hover:border-gray-600 py-2 text-gray-400 hover:text-gray-300 text-[8px] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 border border-gray-700 hover:border-red-700 py-2 text-gray-400 hover:text-red-400 text-[8px] transition-colors"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Character Card Component
const CharacterCard: React.FC<{
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ character, isSelected, onSelect, onDelete }) => {
  const { playClick } = useSoundEffects();
  const gender = character.gender || 'male';

  const currentHp = character.resources?.currentHp || (character as any).currentHp || 100;
  const maxHp = character.resources?.maxHp || (character as any).maxHp || 100;
  const currentMp = character.resources?.currentMana || (character as any).currentMana || 50;
  const maxMp = character.resources?.maxMana || (character as any).maxMana || 50;

  return (
    <div
      onClick={() => {
        playClick();
        onSelect();
      }}
      className={`relative cursor-pointer group border-2 ${
        isSelected ? 'border-amber-500' : 'border-gray-800 hover:border-gray-600'
      } bg-black transition-all p-3`}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          playClick();
          onDelete();
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-[10px] transition-colors z-10"
      >
        X
      </button>

      {/* Name & Info */}
      <div className="text-center relative z-10 -mb-6">
        <div className="text-amber-400 text-[11px] mb-1">{character.name}</div>
        <div className="text-gray-500 text-[8px]">
          LV.{character.level} {RACE_INFO[character.race]?.name} - {CLASS_INFO[character.class]?.name}
        </div>
      </div>

      {/* Character Sprite */}
      <div className="flex justify-center" style={{ transform: 'translateY(-12px)' }}>
        <EquipmentPreview
          race={character.race}
          characterClass={character.class}
          gender={gender}
          scale={3}
          showControls={false}
          autoPlay={true}
          hideBackground={true}
        />
      </div>

      {/* HP/MP Bars */}
      <div className="space-y-1.5 mb-3 relative z-10 -mt-6">
        <div className="flex items-center gap-2">
          <span className="text-[7px] text-gray-500 w-6">HP</span>
          <div className="flex-1 h-2 bg-gray-900 border border-gray-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${(currentHp / maxHp) * 100}%` }}
            />
          </div>
          <span className="text-[7px] text-red-400 w-10 text-right">{currentHp}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] text-gray-500 w-6">MP</span>
          <div className="flex-1 h-2 bg-gray-900 border border-gray-800">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(currentMp / maxMp) * 100}%` }}
            />
          </div>
          <span className="text-[7px] text-blue-400 w-10 text-right">{currentMp}</span>
        </div>
      </div>

      {/* Enter Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          playClick();
          onSelect();
        }}
        className="w-full border border-amber-700 bg-amber-900/30 hover:bg-amber-800/50 py-1.5 text-amber-400 text-[8px] transition-colors flex items-center justify-center gap-1"
      >
        <span>ENTER</span>
      </button>
    </div>
  );
};

export default HeroesTab;
