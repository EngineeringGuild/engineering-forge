import { TrendingUp } from 'lucide-react';
import React from 'react';
import { GameActions } from '../../../../domains/gaming/application/services/GameActions';
import { GameState } from '../../../../domains/gaming/domain/value-objects/GameState';
import { PerformanceDisplay } from '../PerformanceDisplay';

interface PerformanceTabProps {
  gameState: GameState;
  gameActions: GameActions;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ gameState }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Current Performance */}
      <div>
        {gameState.currentPerformance ? (
          <PerformanceDisplay
            performance={gameState.currentPerformance}
            title="Current Performance"
            showDetails={true}
          />
        ) : (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Components Added</h3>
            <p className="text-gray-400">
              Add components to your project to see performance metrics
            </p>
          </div>
        )}
      </div>

      {/* Performance History */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Performance History
        </h3>
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {gameState.testResults.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📈</div>
              <div>No performance data yet</div>
              <div className="text-sm">Run tests to build performance history</div>
            </div>
          ) : (
            gameState.testResults.map((result, index) => (
              <div key={result.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Test #{index + 1}</span>
                  <span className="text-sm text-gray-400">
                    {result.startTime.toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Overall</div>
                    <div className="text-white font-medium">
                      {result.performance.overall.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Score</div>
                    <div className="text-white font-medium">{result.score.toFixed(1)}/100</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
