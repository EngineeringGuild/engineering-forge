import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive, Zap } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';
import { MemoryOptimizationService } from '../../../services/MemoryOptimizationService';
// import { PerformanceOptimizationService } from '../../../services/PerformanceOptimizationService'; // TODO: Use in future implementation
import { GlassCard } from '../ui/GlassCard';

interface PerformanceTestPanelProps {
  onTestComplete?: (results: PerformanceTestResults) => void;
}

interface PerformanceTestResults {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export const PerformanceTestPanel = memo<PerformanceTestPanelProps>(({ onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PerformanceTestResults | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  const { metrics } = usePerformanceMonitor({
    enabled: isRunning,
    sampleRate: 100,
    onPerformanceUpdate: (metrics: { fps: number; memoryUsage: number; renderTime: number }) => {
      console.log('Performance update:', metrics);
    }
  });

  // const performanceService = PerformanceOptimizationService.getInstance(); // TODO: Use in future implementation
  const memoryService = MemoryOptimizationService.getInstance();

  const runPerformanceTest = useCallback(async() => {
    setIsRunning(true);
    setTestProgress(0);
    setResults(null);

    const startTime = performance.now();
    const testResults: Partial<PerformanceTestResults> = {
      recommendations: []
    };

    try {
      // Test 1: FPS Test
      setCurrentTest('Testing FPS...');
      setTestProgress(20);
      await new Promise(resolve => setTimeout(resolve, 2000));

      testResults.fps = metrics.fps || 60;
      if (testResults.fps < 30) {
        testResults.recommendations?.push('Low FPS detected - consider reducing visual effects');
      }

      // Test 2: Memory Test
      setCurrentTest('Testing Memory Usage...');
      setTestProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const memoryStats = memoryService.getMemoryStats();
      testResults.memoryUsage = memoryStats ? memoryStats.usedJSHeapSize / 1024 / 1024 : 0;
      if (testResults.memoryUsage > 100) {
        testResults.recommendations?.push('High memory usage - consider refreshing the page');
      }

      // Test 3: Load Time Test
      setCurrentTest('Testing Load Time...');
      setTestProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      testResults.loadTime = performance.now() - startTime;
      if (testResults.loadTime > 3000) {
        testResults.recommendations?.push('Slow load time - consider optimizing assets');
      }

      // Test 4: Render Time Test
      setCurrentTest('Testing Render Performance...');
      setTestProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const renderStart = performance.now();
      // Simulate heavy rendering
      for (let i = 0; i < 1000; i++) {
        document.createElement('div');
      }
      testResults.renderTime = performance.now() - renderStart;
      if (testResults.renderTime > 16) {
        testResults.recommendations?.push('Slow render time - consider optimizing DOM operations');
      }

      // Calculate Score
      setCurrentTest('Calculating Score...');
      setTestProgress(90);

      let score = 100;
      if (testResults.fps < 60) {
score -= 20;
}
      if (testResults.fps < 30) {
score -= 30;
}
      if (testResults.memoryUsage > 50) {
score -= 15;
}
      if (testResults.memoryUsage > 100) {
score -= 25;
}
      if (testResults.loadTime > 2000) {
score -= 10;
}
      if (testResults.renderTime > 16) {
score -= 20;
}

      testResults.score = Math.max(0, score);

      // Determine Grade
      if (testResults.score >= 90) {
testResults.grade = 'A';
} else if (testResults.score >= 80) {
testResults.grade = 'B';
} else if (testResults.score >= 70) {
testResults.grade = 'C';
} else if (testResults.score >= 60) {
testResults.grade = 'D';
} else {
testResults.grade = 'F';
}

      setTestProgress(100);
      setCurrentTest('Test Complete!');

      const finalResults = testResults as PerformanceTestResults;
      setResults(finalResults);
      onTestComplete?.(finalResults);
    } catch (error) {
      console.error('Performance test failed:', error);
      setCurrentTest('Test Failed');
    } finally {
      setIsRunning(false);
    }
  }, [metrics.fps, memoryService, onTestComplete]);

  const getScoreColor = (score: number) => {
    if (score >= 90) {
return 'text-green-400';
}
    if (score >= 80) {
return 'text-blue-400';
}
    if (score >= 70) {
return 'text-yellow-400';
}
    if (score >= 60) {
return 'text-orange-400';
}
    return 'text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'B':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'C':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'D':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'F':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-400" />
          Performance Test
        </h3>
        {results && (
          <div className={`px-3 py-1 rounded-full border ${getGradeColor(results.grade)}`}>
            Grade: {results.grade}
          </div>
        )}
      </div>

      {!isRunning && !results && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🚀</div>
          <h4 className="text-lg font-semibold text-white mb-2">Ready to Test Performance</h4>
          <p className="text-gray-400 mb-6">
            Run a comprehensive performance test to check FPS, memory usage, and rendering speed.
          </p>
          <button
            onClick={runPerformanceTest}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center mx-auto"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Performance Test
          </button>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚡</div>
          <h4 className="text-lg font-semibold text-white mb-2">{currentTest}</h4>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${testProgress}%` }}
            />
          </div>
          <p className="text-gray-400">{testProgress}% Complete</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
              {results.score.toFixed(0)}
            </div>
            <div className="text-gray-400">Overall Performance Score</div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="subtle" className="p-4">
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">FPS</span>
              </div>
              <div className="text-2xl font-bold text-white">{results.fps.toFixed(0)}</div>
              <div className="text-xs text-gray-400">
                {results.fps >= 60 ? 'Excellent' : results.fps >= 30 ? 'Good' : 'Poor'}
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4">
              <div className="flex items-center mb-2">
                <HardDrive className="w-5 h-5 mr-2 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Memory</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {results.memoryUsage.toFixed(1)}MB
              </div>
              <div className="text-xs text-gray-400">
                {results.memoryUsage < 50 ? 'Low' : results.memoryUsage < 100 ? 'Moderate' : 'High'}
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Load Time</span>
              </div>
              <div className="text-2xl font-bold text-white">{results.loadTime.toFixed(0)}ms</div>
              <div className="text-xs text-gray-400">
                {results.loadTime < 1000 ? 'Fast' : results.loadTime < 3000 ? 'Moderate' : 'Slow'}
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4">
              <div className="flex items-center mb-2">
                <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Render Time</span>
              </div>
              <div className="text-2xl font-bold text-white">{results.renderTime.toFixed(1)}ms</div>
              <div className="text-xs text-gray-400">
                {results.renderTime < 16
                  ? 'Smooth'
                  : results.renderTime < 33
                    ? 'Acceptable'
                    : 'Slow'}
              </div>
            </GlassCard>
          </div>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {results.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-300 text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retest Button */}
          <div className="text-center">
            <button
              onClick={runPerformanceTest}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center mx-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              Run Test Again
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
});

PerformanceTestPanel.displayName = 'PerformanceTestPanel';
