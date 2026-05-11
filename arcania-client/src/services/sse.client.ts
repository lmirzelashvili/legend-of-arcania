import { useCharacterStore } from '@/store/useCharacterStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { BASE_URL } from '@/services/api/client';

let eventSource: EventSource | null = null;

export function connectSSE() {
  if (eventSource) return; // Already connected

  // Use the API base URL. Cookies handle auth for same-origin requests.
  eventSource = new EventSource(`${BASE_URL}/sse/connect`);

  eventSource.addEventListener('connected', () => {
    console.info('SSE connected');
  });

  // Character events
  eventSource.addEventListener('character.levelup', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    const { currentCharacter } = useCharacterStore.getState();
    if (currentCharacter?.id === data.characterId) {
      useCharacterStore.getState().setLastFetched(null); // Mark stale
    }
  });

  eventSource.addEventListener('equipment.changed', (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    const { currentCharacter } = useCharacterStore.getState();
    if (currentCharacter?.id === data.characterId) {
      useCharacterStore.getState().setLastFetched(null);
    }
  });

  // Notification events — trigger badge refresh
  eventSource.addEventListener('trade.completed', () => {
    useNotificationStore.getState().setLastFetched(null);
  });

  eventSource.addEventListener('booster.activated', () => {
    useNotificationStore.getState().setLastFetched(null);
  });

  eventSource.onerror = () => {
    // EventSource auto-reconnects — just log
    console.warn('SSE connection error, will auto-reconnect');
  };
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
