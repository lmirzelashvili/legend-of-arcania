import { useRef, useState, useCallback } from 'react';
import { SpritePaths, SpriteLayerInfo } from '@/utils/sprite-path-builder';

type LayerName = keyof SpritePaths;

interface LayerState {
  image: HTMLImageElement | null;
  loaded: boolean;
}

const ALL_LAYERS: LayerName[] = [
  'wingsBg', 'capeBg',  // Behind character
  'body', 'head', 'nose', 'eyes', 'eyebrows', 'hair', 'beard', 'ear',
  'horn', 'tailBg', 'tailFg', 'basePants', 'baseShirt',
  'torso', 'legs', 'arms', 'boots', 'shoulders', 'bracers', 'helmet',
  'weaponBg', 'weapon', 'offHandWeaponBg', 'offHandWeapon',
  'shieldBg', 'shieldFg', 'shieldTrimBg', 'shieldTrimFg',
  'capeFg', 'wingsFg',  // In front of character
];

// Static layers that should be cached across animation changes
const STATIC_LAYERS = new Set<LayerName>(['ear', 'helmet']);

export interface SpriteLayersResult {
  getImage: (name: LayerName) => HTMLImageElement | null;
  isLayerLoaded: (name: LayerName) => boolean;
  isUniversal: (name: LayerName) => boolean;
  getFrameSize: (name: LayerName) => number;
  allLoaded: boolean;
  error: string | null;
  loadAllLayers: (paths: SpritePaths) => (() => void) | void;
}

export function useSpriteLayers(): SpriteLayersResult {
  // Store all layer states in a single ref (avoiding 30+ individual useRefs)
  const layersRef = useRef<Map<LayerName, LayerState>>(new Map());
  const universalRef = useRef<Map<LayerName, boolean>>(new Map());
  const frameSizeRef = useRef<Map<LayerName, number>>(new Map());
  const prevPathsRef = useRef<Map<LayerName, string>>(new Map());

  const [allLoaded, setAllLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Counter to trigger re-renders when layers load
  const [, setLoadCount] = useState(0);

  const getImage = useCallback((name: LayerName): HTMLImageElement | null => {
    return layersRef.current.get(name)?.image ?? null;
  }, []);

  const isLayerLoaded = useCallback((name: LayerName): boolean => {
    return layersRef.current.get(name)?.loaded ?? false;
  }, []);

  const isUniversal = useCallback((name: LayerName): boolean => {
    return universalRef.current.get(name) ?? false;
  }, []);

  const getFrameSize = useCallback((name: LayerName): number => {
    return frameSizeRef.current.get(name) ?? 64;
  }, []);

  const loadAllLayers = useCallback((paths: SpritePaths) => {
    setAllLoaded(false);
    setError(null);

    // Track which layers we expect to be loaded
    const expectedLayers = new Set<LayerName>();
    const localLoaded = new Map<LayerName, boolean>();

    // Determine which layers are active (have paths)
    for (const name of ALL_LAYERS) {
      const info = paths[name] as SpriteLayerInfo | null;
      if (info) {
        expectedLayers.add(name);
        localLoaded.set(name, false);
        universalRef.current.set(name, info.isUniversal);
        frameSizeRef.current.set(name, info.frameSize ?? 64);
      } else {
        localLoaded.set(name, true); // Not needed, counts as loaded
        // Clear image for ALL disabled layers (including static like helmet)
        layersRef.current.set(name, { image: null, loaded: false });
        prevPathsRef.current.delete(name);
        frameSizeRef.current.delete(name);
      }
    }

    const checkAllLoaded = () => {
      for (const [, loaded] of localLoaded) {
        if (!loaded) return;
      }
      setAllLoaded(true);
      setError(null);
    };

    const loadLayer = (name: LayerName, info: SpriteLayerInfo) => {
      const prevPath = prevPathsRef.current.get(name);
      const currentState = layersRef.current.get(name);

      // Skip loading if static layer has same path and is already loaded
      if (STATIC_LAYERS.has(name) && prevPath === info.path && currentState?.image) {
        localLoaded.set(name, true);
        layersRef.current.set(name, { ...currentState, loaded: true });
        setLoadCount(c => c + 1);
        checkAllLoaded();
        return;
      }

      prevPathsRef.current.set(name, info.path);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        layersRef.current.set(name, { image: img, loaded: true });
        localLoaded.set(name, true);
        setLoadCount(c => c + 1);
        checkAllLoaded();
      };
      img.onerror = () => {
        if (name === 'body') {
          setError('Failed to load body sprite');
          setAllLoaded(false);
          return;
        }
        // Non-critical layers: mark as loaded (skip) to not block rendering
        localLoaded.set(name, true);
        layersRef.current.set(name, { image: null, loaded: true });
        setLoadCount(c => c + 1);
        checkAllLoaded();
      };
      img.src = info.path;
    };

    // Load all active layers
    for (const name of ALL_LAYERS) {
      const info = paths[name] as SpriteLayerInfo | null;
      if (info) {
        loadLayer(name, info);
      }
    }

    // Return cleanup function
    return () => {
      // Clear non-static sprite refs
      for (const name of ALL_LAYERS) {
        if (!STATIC_LAYERS.has(name)) {
          layersRef.current.set(name, { image: null, loaded: false });
        }
      }
    };
  }, []);

  return { getImage, isLayerLoaded, isUniversal, getFrameSize, allLoaded, error, loadAllLayers };
}
