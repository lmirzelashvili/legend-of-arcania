import { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { isStale, CACHE_TTL } from '@/utils/cache';
import { characterAPI } from '@/services/api/character.api';

interface DataLoaderResult {
  isLoading: boolean;
  error: string | null;
}

export function useCharacterData(): DataLoaderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { characters, lastFetched, setCharacters, setLastFetched } = useCharacterStore.getState();

    if (characters.length > 0 && !isStale(lastFetched, CACHE_TTL.default)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    characterAPI.getAll()
      .then((fetched) => {
        setCharacters(fetched);
        setLastFetched(Date.now());
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load characters');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { isLoading, error };
}
