import { Race, Class } from '@/types/game.types';

export type Step = 'race' | 'class' | 'customize' | 'confirm';
export type Gender = 'male' | 'female';

export interface WizardState {
  selectedRace: Race | null;
  selectedClass: Class | null;
  selectedGender: Gender;
  name: string;
}

export interface StepProps {
  state: WizardState;
  onUpdateState: (updates: Partial<WizardState>) => void;
  sounds: {
    playClick: () => void;
    playSelect: () => void;
  };
}
