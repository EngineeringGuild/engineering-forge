/**
 * Format elapsed seconds to MM:SS string.
 */
export function formatChallengeTime(totalSeconds: number): string {
  const rounded = Math.floor(Math.max(0, totalSeconds));
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format elapsed seconds to MM:SS.s with tenths of second.
 */
export function formatChallengeTimeWithDecimals(totalSeconds: number): string {
  const nonNegative = Math.max(0, totalSeconds);
  const minutes = Math.floor(nonNegative / 60);
  const seconds = Math.floor(nonNegative % 60);
  const tenths = Math.floor((nonNegative % 1) * 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}
