// Mock implementation of performance monitor
export function usePerformanceMonitor(_options: {
  enabled: boolean;
  sampleRate: number;
  onPerformanceUpdate: (metrics: any) => void;
}) {
  const metrics = {
    fps: 60,
    memoryUsage: 50,
    renderTime: 16
  };

  const isLowPerformance = false;

  return {
    metrics,
    isLowPerformance
  };
}
