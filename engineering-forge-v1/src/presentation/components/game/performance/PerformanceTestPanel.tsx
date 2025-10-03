// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/performance/PerformanceTestPanel.tsx

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Zap,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
// import { MemoryOptimizationService } from "../../../../domains/gaming/application/services/MemoryOptimizationService";
import { PerformanceTestService } from "../../../../domains/gaming/domain/services/PerformanceTestServiceV2";
import { PerformanceTestResult } from "../../../../domains/gaming/domain/value-objects/PerformanceTestResult";
import { usePerformanceMonitor } from "../../../../hooks/usePerformanceMonitor";
import { GlassCard } from "../../ui/GlassCard";

interface PerformanceTestPanelProps {
  onTestComplete?: (results: PerformanceTestResult) => void;
}

export const PerformanceTestPanel = memo<PerformanceTestPanelProps>(
  ({ onTestComplete }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<PerformanceTestResult | null>(null);
    const [testProgress, setTestProgress] = useState(0);
    const [currentTest, setCurrentTest] = useState("");

    const { metrics } = usePerformanceMonitor({
      enabled: isRunning,
      sampleRate: 100,
      onPerformanceUpdate: (metrics: {
        fps: number;
        memoryUsage: number;
        renderTime: number;
      }) => {
        console.log("Performance update:", metrics);
      },
    });

    // const memoryService = MemoryOptimizationService.getInstance();
    const [performanceService] = useState(
      () =>
        new PerformanceTestService({
          sampleRate: 100,
          testDuration: 2000,
          enableMemoryTest: true,
          enableRenderTest: true,
          enableLoadTest: true,
        })
    );

    const runPerformanceTest = useCallback(async () => {
      setIsRunning(true);
      setTestProgress(0);
      setResults(null);

      try {
        // Test 1: FPS Test
        setCurrentTest("Testing FPS...");
        setTestProgress(10);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Test 2: Memory Test
        setCurrentTest("Testing Memory Usage...");
        setTestProgress(30);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Test 3: Load Time Test
        setCurrentTest("Testing Load Time...");
        setTestProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Test 4: Render Time Test
        setCurrentTest("Testing Render Performance...");
        setTestProgress(70);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Run comprehensive test
        setCurrentTest("Running Comprehensive Test...");
        setTestProgress(90);

        const testResult = await performanceService.runPerformanceTest();

        setResults(testResult);
        setTestProgress(100);
        setCurrentTest("Test Complete!");

        onTestComplete?.(testResult);
      } catch (error) {
        console.error("Performance test failed:", error);
        setCurrentTest("Test Failed");
      } finally {
        setIsRunning(false);
      }
    }, [performanceService, onTestComplete]);

    const getGradeColor = (grade: string) => {
      switch (grade) {
        case "A":
          return "text-green-400";
        case "B":
          return "text-blue-400";
        case "C":
          return "text-yellow-400";
        case "D":
          return "text-orange-400";
        case "F":
          return "text-red-400";
        default:
          return "text-gray-400";
      }
    };

    const getScoreColor = (score: number) => {
      if (score >= 90) return "text-green-400";
      if (score >= 80) return "text-blue-400";
      if (score >= 70) return "text-yellow-400";
      if (score >= 60) return "text-orange-400";
      return "text-red-400";
    };

    return (
      <div className="space-y-4">
        {/* Test Controls */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-400" />
              Performance Test
            </h3>
            <button
              onClick={runPerformanceTest}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isRunning ? "Running..." : "Run Test"}
            </button>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span>{currentTest}</span>
                <span>{testProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Current Metrics */}
          {metrics && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  <span className="text-sm text-gray-400">FPS</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {metrics.fps}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <HardDrive className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm text-gray-400">Memory</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {metrics.memoryUsage.toFixed(1)}MB
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Cpu className="w-4 h-4 mr-2 text-green-400" />
                  <span className="text-sm text-gray-400">Render</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {metrics.renderTime.toFixed(1)}ms
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Test Results */}
        {results && (
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
              Test Results
            </h3>

            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">
                <span className={getScoreColor(results.score)}>
                  {results.score}
                </span>
                <span className="text-gray-400">/100</span>
              </div>
              <div
                className={`text-2xl font-bold ${getGradeColor(results.grade)}`}
              >
                Grade: {results.grade}
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="font-medium text-white">FPS</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.fps}
                </div>
                <div className="text-sm text-gray-400">Frames per second</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <HardDrive className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-medium text-white">Memory</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.memoryUsage}MB
                </div>
                <div className="text-sm text-gray-400">Memory usage</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2 text-green-400" />
                  <span className="font-medium text-white">Load Time</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.loadTime}ms
                </div>
                <div className="text-sm text-gray-400">Load time</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                  <span className="font-medium text-white">Render</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.renderTime}ms
                </div>
                <div className="text-sm text-gray-400">Render time</div>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {results.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="text-gray-300 text-sm flex items-start"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    );
  }
);
