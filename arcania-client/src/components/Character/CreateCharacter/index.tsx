import React, { useState } from 'react';
import { characterAPI } from '@/services/api.service';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import RaceStep from './RaceStep';
import ClassStep from './ClassStep';
import CustomizeStep from './CustomizeStep';
import ConfirmStep from './ConfirmStep';
import { Step, WizardState } from './types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_LABELS = ['RACE', 'CLASS', 'CUSTOMIZE', 'CONFIRM'] as const;
const STEP_ORDER: Step[] = ['race', 'class', 'customize', 'confirm'];

const CreateCharacterModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('race');
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedRace: null,
    selectedClass: null,
    selectedGender: 'male',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { playClick, playSelect, playNavigate, playSuccess, playError, playClose } = useSoundEffects();

  const stepNumber = STEP_ORDER.indexOf(step) + 1;
  const sounds = { playClick, playSelect };

  const onUpdateState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  const handleCreate = async () => {
    const { name, selectedRace, selectedClass } = wizardState;
    if (!name || !selectedRace || !selectedClass) return;

    setLoading(true);
    setError('');
    playClick();

    try {
      await characterAPI.create(name, selectedRace, selectedClass, wizardState.selectedGender);
      playSuccess();
      onSuccess();
    } catch (err: any) {
      playError();
      setError(err.response?.data?.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  const canAdvance =
    (step === 'race' && wizardState.selectedRace) ||
    (step === 'class' && wizardState.selectedClass) ||
    (step === 'customize' && wizardState.name.length >= 3);

  const goBack = () => {
    playNavigate();
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const goNext = () => {
    if (!canAdvance) return;
    playNavigate();
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1]);
  };

  const stepProps = { state: wizardState, onUpdateState, sounds };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 font-pixel"
    >
      {/* Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Main Modal */}
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden z-10">
        <div className="absolute inset-0 border border-gray-600/20" />
        <div className="absolute inset-[1px] bg-black" />

        <div className="relative flex flex-col h-full max-h-[95vh]">
          {/* Header */}
          <div className="p-6 border-b-2 border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-amber-500 text-xl mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                  CREATE YOUR HERO
                </h2>
                <div className="flex gap-4">
                  {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-[8px] font-bold ${
                          i + 1 <= stepNumber ? 'bg-white text-black' : 'bg-gray-800/50 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[8px] ${i + 1 <= stepNumber ? 'text-amber-500' : 'text-gray-600'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { playClose(); onClose(); }}
                className="text-gray-600 hover:text-amber-500 transition-colors text-xl"
              >
                X
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 relative">
              <div className="absolute inset-0 border-2 border-red-700" />
              <div className="absolute inset-[2px] bg-red-950" />
              <div className="relative px-4 py-2 text-red-400 text-[8px]">{error}</div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'race' && <RaceStep {...stepProps} />}
            {step === 'class' && <ClassStep {...stepProps} />}
            {step === 'customize' && <CustomizeStep {...stepProps} />}
            {step === 'confirm' && <ConfirmStep {...stepProps} />}
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t-2 border-gray-800">
            <div className="flex gap-4">
              {step !== 'race' && (
                <button onClick={goBack} className="relative flex-1 group">
                  <div className="absolute inset-0 border-2 border-gray-600 group-hover:border-gray-500 transition-all" />
                  <div className="absolute inset-[2px] bg-gray-900/40" />
                  <div className="relative py-3 text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors text-center">
                    ← BACK
                  </div>
                </button>
              )}

              {step !== 'confirm' ? (
                <button
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="relative flex-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 border-2 border-amber-600 group-hover:border-amber-500 transition-colors" />
                  <div className="absolute inset-[2px] bg-gradient-to-b from-amber-950 to-black" />
                  <div className="relative py-3 text-[10px] text-amber-400 group-hover:text-amber-300 transition-colors text-center">
                    NEXT →
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading || wizardState.name.length < 3}
                  className="relative flex-1 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 border-2 border-green-600 group-hover:border-green-500 transition-colors" />
                  <div className="absolute inset-[2px] bg-gradient-to-b from-green-950 to-black" />
                  <div className="relative py-3 text-[10px] text-green-400 group-hover:text-green-300 transition-colors text-center">
                    {loading ? 'CREATING...' : '► CREATE HERO'}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterModal;
