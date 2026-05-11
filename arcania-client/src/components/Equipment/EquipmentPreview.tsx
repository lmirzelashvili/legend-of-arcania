import React, { useEffect, useRef } from 'react';
import { Race, Class, AnimationType as AnimationTypeEnum } from '@/types/game.types';
import { buildSpritePaths, SpritePaths } from '@/utils/sprite-path-builder';
import { useSpriteLayers } from '@/hooks/useSpriteLayers';
import { useSpriteAnimation, AnimationType } from '@/hooks/useSpriteAnimation';
import type { EquipmentSpriteResult } from '@/config/item-sprite-mapping';

interface Props {
  race: Race;
  characterClass: Class;
  gender?: 'male' | 'female';
  scale?: number;
  showControls?: boolean;
  animation?: AnimationTypeEnum;
  autoPlay?: boolean;
  hideBackground?: boolean;
  /** Pass the output of mergeEquipmentSpriteInfo() directly instead of individual equipment props */
  spriteInfo?: EquipmentSpriteResult;
  // Equipment props (used as fallback when spriteInfo is not provided)
  weapon?: string;
  weaponColor?: string;
  weaponPath?: string;
  shield?: string;
  shieldColor?: string;
  shieldPath?: string;
  helmet?: string;
  helmetMaterial?: string;
  torso?: string;
  torsoMaterial?: string;
  legs?: string;
  legsMaterial?: string;
  arms?: string;
  armsMaterial?: string;
  boots?: string;
  bootsMaterial?: string;
  shoulders?: string;
  shouldersMaterial?: string;
  bracers?: string;
  bracersMaterial?: string;
  cape?: string;
  capeColor?: string;
  wings?: string;
  wingsColor?: string;
  offHandWeapon?: string;
  offHandWeaponColor?: string;
}

const FRAME_SIZE = 64;

const EquipmentPreview: React.FC<Props> = ({
  race,
  characterClass,
  gender = 'male',
  scale = 2,
  showControls = true,
  animation,
  autoPlay = false,
  hideBackground = false,
  spriteInfo,
  weapon: weaponProp = '',
  weaponColor: weaponColorProp = 'iron',
  weaponPath: weaponPathProp,
  shield: shieldProp = '',
  shieldColor: shieldColorProp = '',
  shieldPath: shieldPathProp,
  helmet: helmetProp = '',
  helmetMaterial: helmetMaterialProp = 'steel',
  torso: torsoProp = '',
  torsoMaterial: torsoMaterialProp = 'steel',
  legs: legsProp = '',
  legsMaterial: legsMaterialProp = 'steel',
  arms: armsProp = '',
  armsMaterial: armsMaterialProp = 'steel',
  boots: bootsProp = '',
  bootsMaterial: bootsMaterialProp = 'steel',
  shoulders: shouldersProp = '',
  shouldersMaterial: shouldersMaterialProp = 'steel',
  bracers: bracersProp = '',
  bracersMaterial: bracersMaterialProp = 'steel',
  cape: capeProp = '',
  capeColor: capeColorProp = 'black',
  wings: wingsProp = '',
  wingsColor: wingsColorProp = 'white',
  offHandWeapon: offHandWeaponProp = '',
  offHandWeaponColor: offHandWeaponColorProp = ''
}) => {
  // Resolve equipment values: spriteInfo takes priority, then individual props
  const weapon = spriteInfo?.weaponType ?? weaponProp;
  const weaponColor = spriteInfo?.weaponColor ?? weaponColorProp;
  const weaponPath = weaponPathProp;
  const shield = spriteInfo?.shieldType ?? shieldProp;
  const shieldColor = spriteInfo?.shieldVariant ?? shieldColorProp;
  const shieldPath = shieldPathProp;
  const helmet = spriteInfo?.helmetType ?? helmetProp;
  const helmetMaterial = spriteInfo?.helmetMaterial ?? helmetMaterialProp;
  const torso = spriteInfo?.torsoType ?? torsoProp;
  const torsoMaterial = spriteInfo?.torsoMaterial ?? torsoMaterialProp;
  const legs = spriteInfo?.legsType ?? legsProp;
  const legsMaterial = spriteInfo?.legsMaterial ?? legsMaterialProp;
  const arms = spriteInfo?.armsType ?? armsProp;
  const armsMaterial = spriteInfo?.armsMaterial ?? armsMaterialProp;
  const boots = spriteInfo?.bootsType ?? bootsProp;
  const bootsMaterial = spriteInfo?.bootsMaterial ?? bootsMaterialProp;
  const shoulders = spriteInfo?.shouldersType ?? shouldersProp;
  const shouldersMaterial = spriteInfo?.shouldersMaterial ?? shouldersMaterialProp;
  const bracers = spriteInfo?.bracersType ?? bracersProp;
  const bracersMaterial = spriteInfo?.bracersMaterial ?? bracersMaterialProp;
  const cape = spriteInfo?.capeType ?? capeProp;
  const capeColor = spriteInfo?.capeColor ?? capeColorProp;
  const wings = spriteInfo?.wingsType ?? wingsProp;
  const wingsColor = spriteInfo?.wingsColor ?? wingsColorProp;
  const offHandWeapon = spriteInfo?.offHandWeaponType ?? offHandWeaponProp;
  const offHandWeaponColor = spriteInfo?.offHandWeaponColor ?? offHandWeaponColorProp;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation state management
  const { state: animState, rotate, setHovered } = useSpriteAnimation({
    initialAnimation: (animation as AnimationType) || 'walk',
    autoPlay,
  });

  // Sprite layer management (image loading + tracking)
  const layers = useSpriteLayers();

  // Build sprite paths and load images whenever props or animation changes
  useEffect(() => {
    const paths = buildSpritePaths(race, characterClass, gender, {
      weapon, weaponColor, weaponPath, shield, shieldColor, shieldPath,
      helmet, helmetMaterial, torso, torsoMaterial,
      legs, legsMaterial, arms, armsMaterial,
      boots, bootsMaterial, shoulders, shouldersMaterial,
      bracers, bracersMaterial, cape, capeColor,
      wings, wingsColor, offHandWeapon, offHandWeaponColor,
    }, animState.currentAnimation);

    return layers.loadAllLayers(paths);
  }, [race, characterClass, gender, weapon, weaponColor, weaponPath, offHandWeapon, offHandWeaponColor,
      shield, shieldColor, shieldPath, helmet, helmetMaterial, torso, torsoMaterial,
      legs, legsMaterial, arms, armsMaterial, boots, bootsMaterial,
      shoulders, shouldersMaterial, bracers, bracersMaterial,
      cape, capeColor, wings, wingsColor, animState.currentAnimation]);

  // Draw all layers onto canvas
  useEffect(() => {
    if (!layers.allLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { currentFrame, row, universalRow } = animState;
    const fw = FRAME_SIZE;
    const fh = FRAME_SIZE;
    const sw = fw * scale;
    const sh = fh * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Helper to draw a single layer
    const draw = (name: keyof SpritePaths, useRow?: number) => {
      const img = layers.getImage(name);
      if (!img) return;
      const r = useRow !== undefined ? useRow : (layers.isUniversal(name) ? universalRow : row);
      const fs = layers.getFrameSize(name);
      if (fs !== fw) {
        // Oversize frame (e.g. 192×192 slash sprites) — draw centered on the 64×64 canvas
        const offset = ((fs - fw) / 2) * scale;
        ctx.drawImage(img, currentFrame * fs, r * fs, fs, fs, -offset, -offset, fs * scale, fs * scale);
      } else {
        ctx.drawImage(img, currentFrame * fw, r * fh, fw, fh, 0, 0, sw, sh);
      }
    };

    // Layer rendering order (back to front):
    draw('tailBg');
    draw('shieldBg');
    draw('shieldTrimBg', row); // Trim always per-animation
    draw('weaponBg');
    draw('offHandWeaponBg');
    draw('wingsBg');
    draw('capeBg');
    draw('body');
    draw('basePants');
    draw('baseShirt');
    draw('boots');
    draw('legs');
    draw('torso');
    draw('bracers');
    draw('shoulders');
    draw('arms');
    draw('capeFg');
    draw('head');
    draw('nose');
    draw('eyes');
    draw('eyebrows');
    draw('ear');
    draw('horn');
    draw('hair');
    draw('beard');
    draw('helmet');
    draw('shieldFg');
    draw('shieldTrimFg', row); // Trim always per-animation
    draw('weapon');
    draw('offHandWeapon');
    draw('tailFg');
    draw('wingsFg');
  }, [animState.currentFrame, animState.currentAnimation, animState.currentDirection,
      layers.allLoaded, scale]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative p-4 ${hideBackground ? '' : 'bg-black'}`}
        onMouseEnter={autoPlay === false ? undefined : () => setHovered(true)}
        onMouseLeave={autoPlay === false ? undefined : () => setHovered(false)}
      >
        <canvas
          ref={canvasRef}
          width={FRAME_SIZE * scale}
          height={FRAME_SIZE * scale}
          className="relative z-10"
          style={{ imageRendering: 'pixelated' }}
        />

        {!layers.allLoaded && !layers.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg z-20">
            <div className="text-gray-400">Loading sprite...</div>
          </div>
        )}

        {layers.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 rounded-lg z-20">
            <div className="text-red-400 text-sm text-center px-4">{layers.error}</div>
          </div>
        )}
      </div>

      {showControls && (
        <div className="flex justify-center mt-2">
          <button
            onClick={rotate}
            className="relative group font-pixel"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-amber-600 group-hover:to-amber-500 transition-all" />
            <div className="absolute inset-[2px] bg-black" />
            <div className="relative px-4 py-2 text-[8px] text-gray-400 group-hover:text-amber-400 transition-colors">
              ROTATE
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default EquipmentPreview;
