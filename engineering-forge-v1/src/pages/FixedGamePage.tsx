import { Pause, Play, RotateCcw, Settings, Trophy, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Simplified interfaces
interface Component {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface PerformanceMetrics {
  speed: number;
  power: number;
  handling: number;
  overall: number;
}

const FixedGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(100);
  const [level, setLevel] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('mechanical');
  const [workspaceComponents, setWorkspaceComponents] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentPerformance, setCurrentPerformance] = useState<PerformanceMetrics | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'test' | 'performance' | 'achievements'>(
    'build'
  );
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showSaveLoadPanel, setShowSaveLoadPanel] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Mock components data
  const availableComponents: Component[] = [
    { id: 'engine-1', name: 'Basic Engine', category: 'mechanical', level: 1 },
    { id: 'chassis-1', name: 'Chassis', category: 'mechanical', level: 1 },
    { id: 'wheels-1', name: 'Wheels', category: 'mechanical', level: 1 }
  ];

  const handlePlayPause = useCallback(() => {
    console.log('Play/Pause clicked!');
    setIsPlaying(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    console.log('Reset clicked!');
    setIsPlaying(false);
    setScore(0);
    setLevel(1);
    setAchievements([]);
    setWorkspaceComponents([]);
    setSelectedComponentId(null);
  }, []);

  const handleComponentSelect = useCallback((component: Component) => {
    console.log('Component selected:', component.name);
    // Add component to workspace
    setWorkspaceComponents(prev => [
      ...prev,
      { ...component, id: `${component.id}-${Date.now()}` }
    ]);
  }, []);

  const handleTabSwitch = useCallback((tab: 'build' | 'test' | 'performance' | 'achievements') => {
    console.log('Tab switched to:', tab);
    setActiveTab(tab);
  }, []);

  const handleTestComplete = useCallback(
    (results: any) => {
      console.log('Test completed:', results);
      setTestResults(prev => [...prev, { ...results, id: Date.now() }]);

      if (results.score >= 70) {
        setScore(prev => prev + 25);
        // Check for level up
        if (score > 0 && score % 50 === 0) {
          setLevel(prev => prev + 1);
        }
      }
    },
    [score]
  );

  const handleSave = useCallback(() => {
    console.log('Save clicked!');
    setLastSaved(new Date());
  }, []);

  const handleLoad = useCallback(() => {
    console.log('Load clicked!');
    setLastSaved(new Date());
  }, []);

  // Calculate performance when components change
  useEffect(() => {
    if (workspaceComponents.length > 0) {
      const performance: PerformanceMetrics = {
        speed: 85,
        power: 150,
        handling: 72,
        overall: 75
      };
      setCurrentPerformance(performance);
    } else {
      setCurrentPerformance(null);
    }
  }, [workspaceComponents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Engineering Forge Level {level}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">Score: {score}</div>
            <button
              onClick={handlePlayPause}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-white">Game Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workspace Settings */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-md font-semibold mb-4 text-white">Workspace Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Grid Size: {gridSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={gridSize}
                      onChange={e => setGridSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="snapToGrid"
                      checked={snapToGrid}
                      onChange={e => setSnapToGrid(e.target.checked)}
                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="snapToGrid" className="text-sm text-gray-300">
                      Snap to Grid
                    </label>
                  </div>
                  <div>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Workspace
                    </button>
                  </div>
                </div>
              </div>

              {/* Save/Load */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-md font-semibold mb-4 text-white">Save & Load</h4>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Game
                  </button>
                  <button
                    onClick={handleLoad}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Load Game
                  </button>
                  <div className="text-sm text-gray-400">
                    Last saved: {lastSaved ? lastSaved.toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4">
            {[
              { id: 'build', label: 'Build', icon: '🔨' },
              { id: 'test', label: 'Test', icon: '🧪' },
              { id: 'performance', label: 'Performance', icon: '📊' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'build' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
              {/* Component Palette */}
              <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-semibold mb-4">Components</h3>
                <div className="space-y-3">
                  {availableComponents.map(component => (
                    <div
                      key={component.id}
                      onClick={() => handleComponentSelect(component)}
                      className="bg-gray-700 rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-2xl mr-3">
                        {component.category === 'mechanical' ? '🔧' : '⚙️'}
                      </span>
                      <div>
                        <div className="font-medium">{component.name}</div>
                        <div className="text-sm text-gray-400">Level {component.level}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Actions</h4>
                  <button
                    onClick={() => setLevel(prev => prev + 1)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Level Up
                  </button>
                </div>
              </div>

              {/* Construction Workspace */}
              <div className="lg:col-span-3">
                <div className="h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-blue-400" />
                        Construction Workspace
                      </h2>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">
                          {workspaceComponents.length} components
                        </div>
                        <button
                          onClick={handlePlayPause}
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-[calc(100%-80px)] p-4 grid grid-cols-3 gap-4">
                    {/* Performance Panel */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-green-400">Performance</h3>
                      <div className="space-y-3">
                        {currentPerformance ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Speed:</span>
                              <span className="text-green-400 font-medium">
                                {currentPerformance.speed} km/h
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Power:</span>
                              <span className="text-blue-400 font-medium">
                                {currentPerformance.power} HP
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Handling:</span>
                              <span className="text-yellow-400 font-medium">
                                {currentPerformance.handling}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            Add components to see performance
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Build Area */}
                    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🚗</div>
                        <p className="text-gray-400">Drag components here to build</p>
                        {workspaceComponents.length > 0 && (
                          <div className="mt-4 text-sm text-green-400">
                            {workspaceComponents.length} components added
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Components:</span>
                          <span className="text-white font-medium">
                            {workspaceComponents.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Weight:</span>
                          <span className="text-white font-medium">1,200 kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Cost:</span>
                          <span className="text-white font-medium">$5,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Test Panel */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Performance Test
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Run tests to evaluate your engineering project's performance.
                  </p>
                  <button
                    onClick={() =>
                      handleTestComplete({
                        score: Math.floor(Math.random() * 40) + 60,
                        grade: 'B+',
                        duration: 2.5
                      })
                    }
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Run Test
                  </button>
                </div>
              </div>

              {/* Test Results */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Test Results
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <div>No test results yet</div>
                      <div className="text-sm">Run some tests to see results here</div>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg border ${
                          result.score >= 70
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-red-900/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Test #{index + 1}</span>
                          <span
                            className={`text-xs font-bold ${
                              result.score >= 70 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {result.score >= 70 ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300">
                          <div>Score: {result.score}/100</div>
                          <div>Grade: {result.grade}</div>
                          <div>Duration: {result.duration}s</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold mb-4">Performance Tab</h2>
              <p className="text-gray-400 mb-6">Performance metrics go here</p>
              {currentPerformance && (
                <div className="bg-gray-700 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Current Performance</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Speed: {currentPerformance.speed} km/h</div>
                    <div>Power: {currentPerformance.power} HP</div>
                    <div>Handling: {currentPerformance.handling}%</div>
                    <div>Overall: {currentPerformance.overall}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-semibold mb-4">Achievements Tab</h2>
              <p className="text-gray-400 mb-6">Achievements go here</p>
              <button
                onClick={() => setScore(prev => prev + 50)}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                Claim Achievement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white/5 backdrop-blur-md border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span>Level: {level}</span>
            <span>Score: {score}</span>
            <span>Status: {isPlaying ? 'Playing' : 'Paused'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              Last saved: {lastSaved ? lastSaved.toLocaleString() : 'Never'}
            </span>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedGamePage;
