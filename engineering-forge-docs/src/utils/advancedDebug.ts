// File: src/utils/advancedDebug.ts
// Advanced debugging system to identify infinite loops

interface DebugInfo {
  component: string;
  timestamp: number;
  renderCount: number;
  props: unknown;
  state: unknown;
  stack: string;
}

class AdvancedDebugger {
  private renderCounts = new Map<string, number>();
  private renderHistory: DebugInfo[] = [];
  private maxHistory = 50;
  private isEnabled = process.env.NODE_ENV === 'development';

  logRender(componentName: string, props?: unknown, state?: unknown) {
    if (!this.isEnabled) {
return;
}

    const count = (this.renderCounts.get(componentName) || 0) + 1;
    this.renderCounts.set(componentName, count);

    const debugInfo: DebugInfo = {
      component: componentName,
      timestamp: Date.now(),
      renderCount: count,
      props: props ? JSON.stringify(props) : 'N/A',
      state: state ? JSON.stringify(state) : 'N/A',
      stack: new Error().stack || 'No stack'
    };

    this.renderHistory.push(debugInfo);

    // Keep only recent history
    if (this.renderHistory.length > this.maxHistory) {
      this.renderHistory = this.renderHistory.slice(-this.maxHistory);
    }

    // Check for potential infinite loop
    this.checkForInfiniteLoop(componentName, count);

    console.log(`🔄 [${count}] ${componentName}`, {
      timestamp: debugInfo.timestamp,
      props: debugInfo.props,
      state: debugInfo.state
    });
  }

  private checkForInfiniteLoop(componentName: string, count: number) {
    const recentRenders = this.renderHistory
      .filter(info => info.component === componentName)
      .slice(-10);

    if (recentRenders.length >= 10) {
      const timeSpan = recentRenders[recentRenders.length - 1].timestamp - recentRenders[0].timestamp;

      if (timeSpan < 1000) { // 10 renders in less than 1 second
        console.error('🚨 INFINITE LOOP DETECTED!', {
          component: componentName,
          rendersInLastSecond: recentRenders.length,
          totalRenders: count,
          recentHistory: recentRenders.map(r => ({
            time: r.timestamp,
            props: r.props,
            state: r.state
          }))
        });

        // Log the stack trace of the most recent render
        console.error('🔍 Stack trace:', recentRenders[recentRenders.length - 1].stack);
      }
    }
  }

  getRenderStats() {
    return {
      renderCounts: Object.fromEntries(this.renderCounts),
      recentHistory: this.renderHistory.slice(-10)
    };
  }

  reset() {
    this.renderCounts.clear();
    this.renderHistory = [];
  }
}

export const advancedDebugger = new AdvancedDebugger();

// Hook to use in components - NUCLEAR FIX: Disabled to prevent infinite loops
export const useAdvancedDebug = (componentName: string) => {
  // Disabled to prevent infinite loops - only log in development mode
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
    console.log(`[DEBUG] ${componentName} rendered`);
  }
};
