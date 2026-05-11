import { useState, useEffect, useCallback } from 'react';

// Per-animation files: 4 rows (up/left/down/right), variable frame count
export const ANIMATIONS = {
  idle: { up: 0, left: 1, down: 2, right: 3, frames: 2 },
  walk: { up: 0, left: 1, down: 2, right: 3, frames: 9 },
  run: { up: 0, left: 1, down: 2, right: 3, frames: 8 },
  slash: { up: 0, left: 1, down: 2, right: 3, frames: 6 },
  backslash: { up: 0, left: 1, down: 2, right: 3, frames: 6 },
  halfslash: { up: 0, left: 1, down: 2, right: 3, frames: 6 },
  thrust: { up: 0, left: 1, down: 2, right: 3, frames: 8 },
  shoot: { up: 0, left: 1, down: 2, right: 3, frames: 13 },
  spellcast: { up: 0, left: 1, down: 2, right: 3, frames: 7 },
  hurt: { up: 0, left: 1, down: 2, right: 3, frames: 6 },
  sit: { up: 0, left: 1, down: 2, right: 3, frames: 1 },
  jump: { up: 0, left: 1, down: 2, right: 3, frames: 4 },
  climb: { up: 0, left: 1, down: 2, right: 3, frames: 4 },
  emote: { up: 0, left: 1, down: 2, right: 3, frames: 4 },
  combat_idle: { up: 0, left: 1, down: 2, right: 3, frames: 4 },
} as const;

// Universal spritesheet: 21+ rows with all animations in one file
export const UNIVERSAL_ANIMATIONS = {
  spellcast: { up: 0, left: 1, down: 2, right: 3, frames: 7 },
  thrust: { up: 4, left: 5, down: 6, right: 7, frames: 8 },
  walk: { up: 8, left: 9, down: 10, right: 11, frames: 9 },
  slash: { up: 12, left: 13, down: 14, right: 15, frames: 6 },
  shoot: { up: 16, left: 17, down: 18, right: 19, frames: 13 },
  hurt: { up: 20, left: 20, down: 20, right: 20, frames: 6 },
  idle: { up: 8, left: 9, down: 10, right: 11, frames: 1 },
  run: { up: 8, left: 9, down: 10, right: 11, frames: 8 },
  backslash: { up: 12, left: 13, down: 14, right: 15, frames: 6 },
  halfslash: { up: 12, left: 13, down: 14, right: 15, frames: 6 },
  sit: { up: 8, left: 9, down: 10, right: 11, frames: 1 },
  jump: { up: 8, left: 9, down: 10, right: 11, frames: 4 },
  climb: { up: 8, left: 9, down: 10, right: 11, frames: 4 },
  emote: { up: 0, left: 1, down: 2, right: 3, frames: 4 },
  combat_idle: { up: 8, left: 9, down: 10, right: 11, frames: 1 },
} as const;

export type AnimationType = keyof typeof ANIMATIONS;
export type Direction = 'up' | 'down' | 'left' | 'right';

const DIRECTIONS: Direction[] = ['down', 'left', 'up', 'right'];

interface UseSpriteAnimationOptions {
  initialAnimation?: AnimationType;
  autoPlay?: boolean;
  frameInterval?: number;
}

export interface SpriteAnimationState {
  currentAnimation: AnimationType;
  currentDirection: Direction;
  currentFrame: number;
  row: number;
  universalRow: number;
}

export interface SpriteAnimationResult {
  state: SpriteAnimationState;
  setAnimation: (anim: AnimationType) => void;
  setDirection: (dir: Direction) => void;
  rotate: () => void;
  setHovered: (hovered: boolean) => void;
}

export function useSpriteAnimation(options: UseSpriteAnimationOptions = {}): SpriteAnimationResult {
  const { initialAnimation = 'walk', autoPlay = false, frameInterval = 100 } = options;

  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(initialAnimation);
  const [currentDirection, setCurrentDirection] = useState<Direction>('down');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isHovered, setHovered] = useState(false);

  // Sync external animation prop
  useEffect(() => {
    if (initialAnimation) {
      setCurrentAnimation(initialAnimation);
      setCurrentFrame(0);
    }
  }, [initialAnimation]);

  // Animation frame loop
  useEffect(() => {
    if (!autoPlay && !isHovered) return;

    const speed = currentAnimation === 'idle' ? 250 : frameInterval;
    const interval = setInterval(() => {
      const animDef = ANIMATIONS[currentAnimation];
      setCurrentFrame((prev) => (prev + 1) % animDef.frames);
    }, speed);

    return () => clearInterval(interval);
  }, [currentAnimation, isHovered, autoPlay, frameInterval]);

  const setAnimation = useCallback((anim: AnimationType) => {
    setCurrentAnimation(anim);
    setCurrentFrame(0);
  }, []);

  const rotate = useCallback(() => {
    setCurrentDirection(prev => {
      const idx = DIRECTIONS.indexOf(prev);
      return DIRECTIONS[(idx + 1) % DIRECTIONS.length];
    });
    setCurrentFrame(0);
  }, []);

  // Compute row indices
  const anim = ANIMATIONS[currentAnimation];
  const universalAnim = UNIVERSAL_ANIMATIONS[currentAnimation];
  const row = anim[currentDirection];
  const universalRow = universalAnim[currentDirection];

  return {
    state: { currentAnimation, currentDirection, currentFrame, row, universalRow },
    setAnimation,
    setDirection: setCurrentDirection,
    rotate,
    setHovered,
  };
}
