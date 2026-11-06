import { useState, useEffect } from 'react';
import {
  progressManager,
  type PackId,
  type PackProgressSummary,
  type GlobalProgressSummary,
} from './ProgressManager';

/**
 * React hook to reactively track progress for an individual pack.
 */
export function usePackProgress(packId: PackId): PackProgressSummary {
  const [summary, setSummary] = useState<PackProgressSummary>(() =>
    progressManager.getPackProgress(packId),
  );

  useEffect(() => {
    const update = () => setSummary(progressManager.getPackProgress(packId));
    update();
    return progressManager.subscribe(update);
  }, [packId]);

  return summary;
}

/**
 * React hook to reactively track overall global game completion across all packs.
 */
export function useGlobalProgress(): GlobalProgressSummary {
  const [summary, setSummary] = useState<GlobalProgressSummary>(() =>
    progressManager.getGlobalProgress(),
  );

  useEffect(() => {
    const update = () => setSummary(progressManager.getGlobalProgress());
    update();
    return progressManager.subscribe(update);
  }, []);

  return summary;
}
