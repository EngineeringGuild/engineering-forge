import { useCallback, useEffect, useRef, useState } from 'react';
import { autosaveManager, type AutosaveRecord } from './AutosaveManager';

export interface UseAutosaveProjectOptions<T> {
  discipline: string;
  levelId: string;
  getData: () => T;
  onRestore?: (savedData: T, record: AutosaveRecord<T>) => void;
  intervalMs?: number; // default: 30000 (30 seconds)
  enabled?: boolean;
  isEmpty?: (data: T) => boolean;
}

export interface UseAutosaveProjectResult<T> {
  lastSavedTime: number | null;
  wasRestored: boolean;
  saveNow: () => AutosaveRecord<T> | null;
  clearDraft: () => void;
  dismissRestoredNotice: () => void;
  isSaving: boolean;
}

export function useAutosaveProject<T>({
  discipline,
  levelId,
  getData,
  onRestore,
  intervalMs = 30_000,
  enabled = true,
  isEmpty = () => false,
}: UseAutosaveProjectOptions<T>): UseAutosaveProjectResult<T> {
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(() =>
    autosaveManager.getLastSavedTime(discipline, levelId),
  );
  const [wasRestored, setWasRestored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Keep fresh references for callbacks and intervals outside of render
  const getDataRef = useRef(getData);
  const onRestoreRef = useRef(onRestore);
  const isEmptyRef = useRef(isEmpty);

  useEffect(() => {
    getDataRef.current = getData;
    onRestoreRef.current = onRestore;
    isEmptyRef.current = isEmpty;
  });

  const saveNow = useCallback((): AutosaveRecord<T> | null => {
    if (!enabled || !levelId) return null;
    const currentData = getDataRef.current();
    if (isEmptyRef.current(currentData)) {
      return null;
    }

    setIsSaving(true);
    const record = autosaveManager.save<T>(discipline, levelId, currentData);
    if (record) {
      setLastSavedTime(record.timestamp);
    }
    // Subtle saving state reset
    setTimeout(() => setIsSaving(false), 800);
    return record;
  }, [discipline, levelId, enabled]);

  const clearDraft = useCallback(() => {
    autosaveManager.clear(discipline, levelId);
    setLastSavedTime(null);
    setWasRestored(false);
  }, [discipline, levelId]);

  const dismissRestoredNotice = useCallback(() => {
    setWasRestored(false);
  }, []);

  // Check and restore on initial mount or levelId change
  useEffect(() => {
    if (!enabled || !levelId) return;

    const existing = autosaveManager.load<T>(discipline, levelId);
    if (existing && !isEmptyRef.current(existing.data)) {
      if (onRestoreRef.current) {
        onRestoreRef.current(existing.data, existing);
      }
      setWasRestored(true);
      setLastSavedTime(existing.timestamp);
    } else {
      setWasRestored(false);
      setLastSavedTime(null);
    }
  }, [discipline, levelId, enabled]);

  // Periodic autosave every 30 seconds (or intervalMs) and unmount save
  useEffect(() => {
    if (!enabled || !levelId) return;

    // Recurring 30s interval
    const timerId = setInterval(() => {
      saveNow();
    }, intervalMs);

    // Save on beforeunload (closing tab / reload)
    const handleBeforeUnload = () => {
      const currentData = getDataRef.current();
      if (!isEmptyRef.current(currentData)) {
        autosaveManager.save<T>(discipline, levelId, currentData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Persist on component unmount
      const currentData = getDataRef.current();
      if (!isEmptyRef.current(currentData)) {
        autosaveManager.save<T>(discipline, levelId, currentData);
      }
    };
  }, [discipline, levelId, intervalMs, enabled, saveNow]);

  return {
    lastSavedTime,
    wasRestored,
    saveNow,
    clearDraft,
    dismissRestoredNotice,
    isSaving,
  };
}
