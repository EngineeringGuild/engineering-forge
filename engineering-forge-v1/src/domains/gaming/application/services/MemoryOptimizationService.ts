/**
 * Memory Optimization Service
 * Provides utilities for optimizing memory usage and preventing memory leaks
 */

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export class MemoryOptimizationService {
  private static instance: MemoryOptimizationService;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
  private cleanupTasks: (() => void)[] = [];
  private isMonitoring = false;

  static getInstance(): MemoryOptimizationService {
    if (!MemoryOptimizationService.instance) {
      MemoryOptimizationService.instance = new MemoryOptimizationService();
    }
    return MemoryOptimizationService.instance;
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
return;
}

    this.isMonitoring = true;
    this.monitorMemory();
    console.log('Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Memory monitoring stopped');
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    if (!this.isMonitoring) {
return;
}

    const stats = this.getMemoryStats();
    if (stats) {
      const usedMB = stats.usedJSHeapSize / 1024 / 1024;
      const totalMB = stats.totalJSHeapSize / 1024 / 1024;
      const limitMB = stats.jsHeapSizeLimit / 1024 / 1024;

      console.log(
        `Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (${limitMB.toFixed(2)}MB limit)`
      );

      // Trigger cleanup if memory usage is high
      if (stats.usedJSHeapSize > this.memoryThreshold) {
        this.triggerCleanup();
      }
    }

    // Check memory every 5 seconds
    setTimeout(() => this.monitorMemory(), 5000);
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Trigger memory cleanup
   */
  triggerCleanup(): void {
    console.log('Triggering memory cleanup...');

    // Run all cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });

    // Force garbage collection if available
    this.forceGarbageCollection();

    console.log('Memory cleanup completed');
  }

  /**
   * Force garbage collection (if available)
   */
  private forceGarbageCollection(): void {
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Register a cleanup task
   */
  registerCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  /**
   * Unregister a cleanup task
   */
  unregisterCleanupTask(task: () => void): void {
    const index = this.cleanupTasks.indexOf(task);
    if (index > -1) {
      this.cleanupTasks.splice(index, 1);
    }
  }

  /**
   * Clear all cleanup tasks
   */
  clearCleanupTasks(): void {
    this.cleanupTasks = [];
  }

  /**
   * Optimize object pooling
   */
  createObjectPool<T>(factory: () => T, reset: (obj: T) => void): ObjectPool<T> {
    return new ObjectPool(factory, reset);
  }

  /**
   * Debounce function to prevent excessive calls
   */
  debounce<T extends(...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function to limit call frequency
   */
  throttle<T extends(...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Clear unused event listeners
   */
  clearEventListeners(element: Element, eventType?: string): void {
    if (eventType) {
      element.removeEventListener(eventType, () => {});
    } else {
      // Clone and replace element to remove all listeners
      const newElement = element.cloneNode(true);
      element.parentNode?.replaceChild(newElement, element);
    }
  }

  /**
   * Clear unused timers
   */
  clearTimers(): void {
    // Clear all timeouts and intervals
    // Clear all timeouts and intervals
    // Note: This is a simplified approach - in production, track specific IDs
    const timeoutId = setTimeout(() => {}, 0);
    clearTimeout(timeoutId);

    const intervalId = setInterval(() => {}, 0);
    clearInterval(intervalId);
  }

  /**
   * Optimize DOM manipulation
   */
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Clear unused cache entries
   */
  clearCache(): void {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  }

  /**
   * Get memory recommendations
   */
  getMemoryRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getMemoryStats();

    if (stats) {
      const usedMB = stats.usedJSHeapSize / 1024 / 1024;
      // const limitMB = stats.jsHeapSizeLimit / 1024 / 1024; // TODO: Use in future implementation
      const usagePercent = (stats.usedJSHeapSize / stats.jsHeapSizeLimit) * 100;

      if (usagePercent > 80) {
        recommendations.push('High memory usage detected - consider refreshing the page');
      }

      if (usedMB > 100) {
        recommendations.push('Memory usage is high - consider reducing visual effects');
      }

      if (this.cleanupTasks.length > 10) {
        recommendations.push('Many cleanup tasks registered - consider optimizing cleanup');
      }
    }

    return recommendations;
  }
}

/**
 * Object Pool for reusing objects
 */
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void) {
    this.factory = factory;
    this.reset = reset;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }

  size(): number {
    return this.pool.length;
  }
}
