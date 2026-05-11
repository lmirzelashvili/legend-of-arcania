import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'hover'
  | 'select'
  | 'success'
  | 'error'
  | 'navigate'
  | 'open'
  | 'close'
  | 'equip'
  | 'levelUp';

// Sound paths mapping (using Kenney.nl CC0 licensed sounds)
const SOUND_PATHS: Record<SoundEffect, string> = {
  click: '/assets/sounds/click.wav',
  hover: '/assets/sounds/hover.wav',
  select: '/assets/sounds/select.wav',
  success: '/assets/sounds/success.wav',
  error: '/assets/sounds/error.wav',
  navigate: '/assets/sounds/navigate.wav',
  open: '/assets/sounds/open.wav',
  close: '/assets/sounds/close.wav',
  equip: '/assets/sounds/equip.wav',
  levelUp: '/assets/sounds/levelup.wav',
};

// Background music path (CC0 by RandomMind - "The Old Tower Inn")
const MUSIC_PATH = '/assets/sounds/ambient_tavern.mp3';

// Sound settings store (persisted)
interface SoundSettingsState {
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  musicEnabled: boolean;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  toggleMute: () => void;
  toggleMusic: () => void;
}

export const useSoundSettings = create<SoundSettingsState>()(
  persist(
    (set) => ({
      sfxVolume: 0.5,
      musicVolume: 0.15, // Lower default for ambient music
      muted: true,
      musicEnabled: false,
      setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
      setMuted: (muted) => set({ muted }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
    }),
    {
      name: 'arcania-sound-settings',
    }
  )
);

// Background music singleton
let backgroundMusic: HTMLAudioElement | null = null;
let musicInitialized = false;

const initBackgroundMusic = () => {
  if (musicInitialized) return;
  backgroundMusic = new Audio(MUSIC_PATH);
  backgroundMusic.loop = true;
  backgroundMusic.preload = 'auto';
  musicInitialized = true;
};

export const startBackgroundMusic = () => {
  const { musicVolume, muted, musicEnabled } = useSoundSettings.getState();

  if (!musicEnabled || muted) return;

  initBackgroundMusic();
  if (backgroundMusic) {
    backgroundMusic.volume = musicVolume;
    backgroundMusic.play().catch(() => {
      // Autoplay blocked - will start on user interaction
    });
  }
};

export const stopBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
};

export const updateMusicVolume = (volume: number) => {
  if (backgroundMusic) {
    backgroundMusic.volume = volume;
  }
};

export const pauseBackgroundMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
};

export const resumeBackgroundMusic = () => {
  const { muted, musicEnabled } = useSoundSettings.getState();
  if (backgroundMusic && musicEnabled && !muted) {
    backgroundMusic.play().catch(() => {});
  }
};

// Audio cache for preloaded sounds
const audioCache: Map<SoundEffect, HTMLAudioElement> = new Map();

// Preload a single sound
const preloadSound = (effect: SoundEffect): Promise<void> => {
  return new Promise((resolve, _reject) => {
    if (audioCache.has(effect)) {
      resolve();
      return;
    }

    const audio = new Audio(SOUND_PATHS[effect]);
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => {
      audioCache.set(effect, audio);
      resolve();
    }, { once: true });

    audio.addEventListener('error', () => {
      console.warn(`Failed to load sound: ${effect}`);
      resolve(); // Don't reject, just warn
    }, { once: true });

    // Start loading
    audio.load();
  });
};

// Preload all sounds
export const preloadAllSounds = async (): Promise<void> => {
  const effects = Object.keys(SOUND_PATHS) as SoundEffect[];
  await Promise.all(effects.map(preloadSound));
};

// Main hook for playing sounds
export const useSoundEffects = () => {
  const { sfxVolume, muted } = useSoundSettings();
  const lastPlayTime = useRef<Map<SoundEffect, number>>(new Map());

  // Preload sounds on mount (skip if muted to avoid console warnings for missing files)
  useEffect(() => {
    if (!muted) {
      preloadAllSounds();
    }
  }, [muted]);

  const play = useCallback(
    (effect: SoundEffect, options?: { volume?: number; debounce?: number }) => {
      if (muted) return;

      // Debounce rapid plays of the same sound
      const debounceMs = options?.debounce ?? 50;
      const now = Date.now();
      const lastTime = lastPlayTime.current.get(effect) || 0;

      if (now - lastTime < debounceMs) return;
      lastPlayTime.current.set(effect, now);

      // Get cached audio or create new
      const cachedAudio = audioCache.get(effect);

      if (cachedAudio) {
        // Clone the audio for overlapping sounds
        const audio = cachedAudio.cloneNode() as HTMLAudioElement;
        audio.volume = (options?.volume ?? 1) * sfxVolume;
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
      } else {
        // Fallback: create and play immediately
        const audio = new Audio(SOUND_PATHS[effect]);
        audio.volume = (options?.volume ?? 1) * sfxVolume;
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    },
    [sfxVolume, muted]
  );

  // Convenience methods
  const playClick = useCallback(() => play('click'), [play]);
  const playHover = useCallback(() => play('hover', { volume: 0.3, debounce: 100 }), [play]);
  const playSelect = useCallback(() => play('select'), [play]);
  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playNavigate = useCallback(() => play('navigate'), [play]);
  const playOpen = useCallback(() => play('open'), [play]);
  const playClose = useCallback(() => play('close'), [play]);

  return {
    play,
    playClick,
    playHover,
    playSelect,
    playSuccess,
    playError,
    playNavigate,
    playOpen,
    playClose,
  };
};

// Hook for background music management
export const useBackgroundMusic = () => {
  const { musicVolume, muted, musicEnabled, toggleMusic, setMusicVolume } = useSoundSettings();

  // Update music volume when settings change
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.volume = muted ? 0 : musicVolume;
    }
  }, [musicVolume, muted]);

  // Handle music enabled/disabled
  useEffect(() => {
    if (musicEnabled && !muted) {
      resumeBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
  }, [musicEnabled, muted]);

  const startMusic = useCallback(() => {
    startBackgroundMusic();
  }, []);

  const stopMusic = useCallback(() => {
    stopBackgroundMusic();
  }, []);

  return {
    isPlaying: musicEnabled && !muted,
    musicVolume,
    setMusicVolume,
    toggleMusic,
    startMusic,
    stopMusic,
  };
};

export default useSoundEffects;
