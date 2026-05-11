import React, { useState, useEffect, useMemo } from 'react';
import { forgeAPI, ForgeRecipe, ForgeRecipeMaterial } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';

const CATEGORY_THEMES: Record<string, { active: string; text: string; icon: string }> = {
  wings: { active: 'border-cyan-600 text-cyan-400 bg-cyan-900/20', text: 'text-cyan-400', icon: '◇' },
  capes: { active: 'border-purple-600 text-purple-400 bg-purple-900/20', text: 'text-purple-400', icon: '◆' },
  armor: { active: 'border-amber-600 text-amber-400 bg-amber-900/20', text: 'text-amber-400', icon: '▣' },
  weapon: { active: 'border-green-600 text-green-400 bg-green-900/20', text: 'text-green-400', icon: '⚔' },
};

const ForgePanel: React.FC = () => {
  const { setCurrentCharacter } = useCharacterStore();
  const character = useCharacterStore(s => s.currentCharacter);
  if (!character) return null;
  const [recipes, setRecipes] = useState<ForgeRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<ForgeRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [forging, setForging] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; itemName?: string } | null>(null);
  const [spiritBoost, setSpiritBoost] = useState(0);
  const [dominionBoost, setDominionBoost] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await forgeAPI.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const inventory = character.inventory?.items || [];

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (r.allowedClasses.length > 0 && !r.allowedClasses.includes(character.class)) return false;
      return true;
    });
  }, [recipes, activeCategory, character.class]);

  const getMaterialCount = (mat: ForgeRecipeMaterial): number => {
    return inventory
      .filter(inv => inv.item.name === mat.name)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const canForge = useMemo(() => {
    if (!selectedRecipe) return false;
    return selectedRecipe.materials.every(mat => getMaterialCount(mat) >= mat.quantity);
  }, [selectedRecipe, inventory]);

  const boostedRate = useMemo(() => {
    if (!selectedRecipe) return 0;
    const base = selectedRecipe.baseSuccessRate * 100;
    const bonus = (spiritBoost * 0.5) + (dominionBoost * 1);
    return Math.min(100, base + bonus);
  }, [selectedRecipe, spiritBoost, dominionBoost]);

  const handleForge = async () => {
    if (!selectedRecipe || !canForge || forging) return;
    setForging(true);
    setResult(null);

    try {
      const res = await forgeAPI.forge(
        character.id,
        selectedRecipe.id,
        { spiritCount: spiritBoost, dominionCount: dominionBoost }
      );

      if (res.updatedCharacter) {
        setCurrentCharacter(res.updatedCharacter);
      }

      setResult({
        success: res.success,
        message: res.message,
        itemName: res.forgedItem?.name,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error?.response?.data?.message || 'Forging failed',
      });
    } finally {
      setForging(false);
    }
  };

  if (loading) {
    return (
      <div className="font-pixel text-center text-gray-500 py-20 text-[10px]">
        Loading forge recipes...
      </div>
    );
  }

  return (
    <div className="font-pixel">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-amber-400 text-[14px] mb-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          FORGEMASTER ANVIL
        </div>
        <div className="text-gray-600 text-[7px]">Combine materials and crystals to forge legendary equipment</div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-6" role="tablist" aria-label="Forge categories">
        <button
          role="tab"
          aria-selected={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          className={`flex-1 py-2 text-[8px] tracking-wider border-2 transition-colors ${
            activeCategory === 'all'
              ? 'border-amber-600 text-amber-400 bg-amber-900/20'
              : 'border-gray-800 text-gray-600 hover:border-gray-700'
          }`}
        >
          ALL
        </button>
        {Object.entries(CATEGORY_THEMES).map(([cat, theme]) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 text-[8px] tracking-wider border-2 transition-colors ${
              activeCategory === cat
                ? theme.active
                : 'border-gray-800 text-gray-600 hover:border-gray-700'
            }`}
          >
            {theme.icon} {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recipe List */}
        <div className="lg:col-span-5">
          <PixelPanel title="RECIPES" color="amber">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredRecipes.length === 0 ? (
                <div className="text-gray-700 text-[8px] text-center py-8">
                  No recipes available for your class
                </div>
              ) : (
                filteredRecipes.map(recipe => {
                  const theme = CATEGORY_THEMES[recipe.category] || CATEGORY_THEMES.armor;
                  const isSelected = selectedRecipe?.id === recipe.id;

                  return (
                    <button
                      key={recipe.id}
                      onClick={() => { setSelectedRecipe(recipe); setResult(null); setSpiritBoost(0); setDominionBoost(0); }}
                      className={`w-full text-left p-3 border-2 transition-all ${
                        isSelected
                          ? theme.active
                          : 'border-gray-800 hover:border-gray-700 bg-black'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-[9px] ${isSelected ? theme.text : 'text-gray-300'}`}>
                            {theme.icon} {recipe.name}
                          </div>
                          <div className="text-gray-600 text-[6px] mt-1">{recipe.description}</div>
                        </div>
                        <div className="text-[7px] text-gray-500">
                          T{recipe.tier}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[6px] text-green-500">{Math.round(recipe.baseSuccessRate * 100)}% BASE</span>
                        <span className="text-[6px] text-gray-700">•</span>
                        <span className="text-[6px] text-purple-500">PRESTIGE</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </PixelPanel>
        </div>

        {/* Forge Details */}
        <div className="lg:col-span-7">
          {selectedRecipe ? (
            <div className="space-y-4">
              {/* Materials Required */}
              <PixelPanel title="MATERIALS REQUIRED" color="purple">
                <div className="space-y-2">
                  {selectedRecipe.materials.map((mat, i) => {
                    const have = getMaterialCount(mat);
                    const enough = have >= mat.quantity;
                    return (
                      <div key={i} className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-400">{mat.name}</span>
                        <span className={enough ? 'text-green-400' : 'text-red-400'}>
                          {have} / {mat.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </PixelPanel>

              {/* Crystal Boost */}
              <PixelPanel title="CRYSTAL BOOST (OPTIONAL)" color="cyan">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-gray-400">Crystal of Spirit (+0.5% each)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSpiritBoost(Math.max(0, spiritBoost - 1))}
                        className="text-gray-500 hover:text-gray-300 px-1"
                        aria-label="Decrease spirit crystals"
                      >-</button>
                      <span className="text-cyan-400 w-6 text-center">{spiritBoost}</span>
                      <button
                        onClick={() => setSpiritBoost(Math.min(30, spiritBoost + 1))}
                        className="text-gray-500 hover:text-gray-300 px-1"
                        aria-label="Increase spirit crystals"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-gray-400">Crystal of Dominion (+1% each)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDominionBoost(Math.max(0, dominionBoost - 1))}
                        className="text-gray-500 hover:text-gray-300 px-1"
                        aria-label="Decrease dominion crystals"
                      >-</button>
                      <span className="text-cyan-400 w-6 text-center">{dominionBoost}</span>
                      <button
                        onClick={() => setDominionBoost(Math.min(20, dominionBoost + 1))}
                        className="text-gray-500 hover:text-gray-300 px-1"
                        aria-label="Increase dominion crystals"
                      >+</button>
                    </div>
                  </div>

                  {/* Success Rate Bar */}
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-[7px] mb-1">
                      <span className="text-gray-500">SUCCESS RATE</span>
                      <span className={boostedRate >= 50 ? 'text-green-400' : boostedRate >= 25 ? 'text-amber-400' : 'text-red-400'}>
                        {boostedRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-900 border border-gray-800">
                      <div
                        className={`h-full transition-all ${
                          boostedRate >= 50 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                          boostedRate >= 25 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                          'bg-gradient-to-r from-red-600 to-red-500'
                        }`}
                        style={{ width: `${boostedRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </PixelPanel>

              {/* Result */}
              {result && (
                <div className={`border-2 p-4 text-center ${
                  result.success
                    ? 'border-green-700 bg-green-900/20'
                    : 'border-red-700 bg-red-900/20'
                }`}>
                  <div className={`text-[10px] mb-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? 'FORGE SUCCESSFUL' : 'FORGE FAILED'}
                  </div>
                  <div className="text-gray-400 text-[8px]">{result.message}</div>
                  {result.itemName && (
                    <div className="text-purple-400 text-[9px] mt-2">
                      Crafted: {result.itemName}
                    </div>
                  )}
                </div>
              )}

              {/* Forge Button */}
              <PixelButton
                onClick={handleForge}
                variant={canForge ? 'primary' : 'disabled'}
                fullWidth
                size="lg"
              >
                {forging ? 'FORGING...' : canForge ? `FORGE • ${boostedRate.toFixed(0)}% CHANCE` : 'INSUFFICIENT MATERIALS'}
              </PixelButton>
            </div>
          ) : (
            <PixelPanel color="gray">
              <div className="text-center text-gray-700 text-[9px] py-16">
                SELECT A RECIPE TO BEGIN FORGING
              </div>
            </PixelPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgePanel;
