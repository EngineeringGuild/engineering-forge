// File: src/utils/debugLoop.ts
// Debug system to identify infinite loops in React components

let renderCount = 0;
let lastRenderTime = 0;
const renderHistory: Array<{ component: string; time: number; count: number }> = [];

export const debugRender = (componentName: string) => {
  const now = Date.now();
  renderCount++;

  // Check if we're in a potential loop (more than 10 renders in 1 second)
  if (now - lastRenderTime < 1000) {
    renderHistory.push({ component: componentName, time: now, count: renderCount });

    if (renderHistory.length > 10) {
      console.error('🚨 POTENTIAL INFINITE LOOP DETECTED!');
      console.error('Component:', componentName);
      console.error('Render count in last second:', renderHistory.length);
      console.error('Render history:', renderHistory.slice(-10));

      // Reset to prevent console spam
      renderHistory.length = 0;
      renderCount = 0;
    }
  } else {
    // Reset if more than 1 second has passed
    renderHistory.length = 0;
    renderCount = 0;
  }

  lastRenderTime = now;

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Render #${renderCount}: ${componentName} at ${now}`);
  }
};

export const resetDebugCounters = () => {
  renderCount = 0;
  lastRenderTime = 0;
  renderHistory.length = 0;
};
