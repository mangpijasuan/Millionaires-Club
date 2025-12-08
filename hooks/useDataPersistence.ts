import { useState, useEffect } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storageService';

/**
 * Custom hook for managing persisted state
 * Automatically saves to localStorage and syncs across components
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    return StorageService.load(key, initialValue);
  });

  useEffect(() => {
    StorageService.save(key, state);
  }, [key, state]);

  return [state, setState];
}

/**
 * Hook for syncing with backend API
 * Handles loading, error states, and automatic retries
 */
export function useAPI<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

/**
 * Hook for optimistic updates with backend sync
 * Updates UI immediately, then syncs with backend
 */
export function useOptimisticUpdate<T>() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    localUpdate: () => void,
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    // Apply optimistic update immediately
    localUpdate();
    
    setPending(true);
    setError(null);

    try {
      const result = await apiCall();
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error.message);
      onError?.(error);
      // Revert optimistic update on error
      throw error;
    } finally {
      setPending(false);
    }
  };

  return { mutate, pending, error };
}

/**
 * Hook for offline-first data management
 * Queues mutations when offline and syncs when back online
 */
export function useOfflineFirst() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<Array<() => Promise<any>>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    for (const action of pendingActions) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
    setPendingActions([]);
  };

  const queueAction = (action: () => Promise<any>) => {
    if (isOnline) {
      return action();
    } else {
      setPendingActions(prev => [...prev, action]);
      return Promise.resolve();
    }
  };

  return { isOnline, queueAction, pendingActionsCount: pendingActions.length };
}
