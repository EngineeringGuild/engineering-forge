import { Trophy } from 'lucide-react';
import React from 'react';
import { GameActions } from '../../../../domains/gaming/application/services/GameActions';
import { GameState } from '../../../../domains/gaming/domain/entities/GameState';
import { PerformanceTestPanel } from '../PerformanceTestPanel';

interface TestTabProps {
  gameState: GameState;
  gameActions: GameActions;
}

export const TestTab: React.FC<TestTabProps> = ({ gameState, gameActions }) => {
  const handleTestComplete = (results: {
    score: number;
    loadTime: number;
    fps: number;
    memoryUsage: number;
    renderTime: number;
    grade: string;
    recommendations: string[];
  }) => {
    // TODO: Create proper TestResult entity
    console.log('Test completed:', results);
    gameActions.playTestComplete();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Performance Test Panel */}
      <div>
        <PerformanceTestPanel onTestComplete={handleTestComplete} />
      </div>

      {/* Test Results */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Test Results
        </h3>
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {gameState.testResults.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📊</div>
              <div>No test results yet</div>
              <div className="text-sm">Run some tests to see results here</div>
            </div>
          ) : (
            gameState.testResults.map((result, index) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Test #{index + 1}</span>
                  <span
                    className={`text-xs font-bold ${
                      result.passed ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  <div>Score: {result.score.toFixed(1)}/100</div>
                  <div>Grade: {result.getGrade()}</div>
                  <div>Duration: {result.duration?.toFixed(1)}s</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
