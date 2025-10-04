/**
 * Performance Optimization Service
 * Provides utilities for optimizing game performance
 */

export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private isOptimized = false;

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance =
        new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  /**
   * Enable performance optimizations
   */
  enableOptimizations(): void {
    if (this.isOptimized) {
      return;
    }

    // Reduce motion for users who prefer it
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.enableReducedMotion();
    }

    // Enable hardware acceleration hints
    this.enableHardwareAcceleration();

    // Optimize image loading
    this.optimizeImageLoading();

    // Enable service worker for caching
    this.enableServiceWorker();

    this.isOptimized = true;
    console.log("Performance optimizations enabled");
  }

  /**
   * Disable performance optimizations
   */
  disableOptimizations(): void {
    this.isOptimized = false;
    console.log("Performance optimizations disabled");
  }

  /**
   * Enable reduced motion for accessibility
   */
  private enableReducedMotion(): void {
    const style = document.createElement("style");
    style.textContent = `
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Enable hardware acceleration hints
   */
  private enableHardwareAcceleration(): void {
    const style = document.createElement("style");
    style.textContent = `
      .game-container, .workspace, .component {
        transform: translateZ(0);
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize image loading
   */
  private optimizeImageLoading(): void {
    // Add loading="lazy" to all images
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
    });

    // Add intersection observer for lazy loading
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      images.forEach((img) => {
        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      });
    }
  }

  /**
   * Enable service worker for caching
   */
  private enableServiceWorker(): void {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }

  /**
   * Batch DOM updates
   */
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  }

  /**
   * Optimize canvas rendering
   */
  optimizeCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Set pixel ratio for high DPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    }
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources: string[]): Promise<void[]> {
    const promises = resources.map((resource) => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = resource;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload ${resource}`));
        document.head.appendChild(link);
      });
    });

    return Promise.all(promises);
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      recommendations.push(
        "Consider reducing visual effects for better performance"
      );
    }

    // Check for slow connection
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        recommendations.push("Consider enabling data saver mode");
      }
    }

    // Check for high memory usage
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      if (usedMB > 100) {
        recommendations.push(
          "High memory usage detected - consider refreshing the page"
        );
      }
    }

    return recommendations;
  }
}
