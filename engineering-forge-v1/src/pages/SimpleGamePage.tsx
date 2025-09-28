import { Pause, Play, RotateCcw, Settings, Zap } from 'lucide-react';
import React, { useState } from 'react';

const SimpleGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(100);
  const [level, setLevel] = useState(2);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'test' | 'performance' | 'achievements'>(
    'build'
  );

  const handlePlayPause = () => {
    console.log('Play/Pause clicked!');
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    console.log('Reset clicked!');
    setScore(0);
    setLevel(1);
    setIsPlaying(false);
  };

  const handleSettings = () => {
    console.log('Settings clicked!');
    setShowSettings(!showSettings);
  };

  const handleTabSwitch = (tab: 'build' | 'test' | 'performance' | 'achievements') => {
    console.log('Tab switched to:', tab);
    setActiveTab(tab);
  };

  const handleLevelUp = () => {
    console.log('Level up clicked!');
    setLevel(prev => prev + 1);
    setScore(prev => prev + 100);
  };

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
              onClick={handleSettings}
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
            <div className="flex space-x-4">
              <button
                onClick={handleLevelUp}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Level Up
              </button>
              <button
                onClick={() => setScore(prev => prev + 50)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                Add Score
              </button>
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
                  <div className="bg-gray-700 rounded-lg p-3 flex items-center">
                    <span className="text-2xl mr-3">🔧</span>
                    <div>
                      <div className="font-medium">Basic Engine</div>
                      <div className="text-sm text-gray-400">Level 1</div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 flex items-center">
                    <span className="text-2xl mr-3">⚙️</span>
                    <div>
                      <div className="font-medium">Chassis</div>
                      <div className="text-sm text-gray-400">Level 1</div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 flex items-center">
                    <span className="text-2xl mr-3">🛞</span>
                    <div>
                      <div className="font-medium">Wheels</div>
                      <div className="text-sm text-gray-400">Level 1</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Actions</h4>
                  <button
                    onClick={handleLevelUp}
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
                        <div className="text-sm text-gray-400">3 components</div>
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
                        <div className="flex justify-between">
                          <span className="text-gray-300">Speed:</span>
                          <span className="text-green-400 font-medium">85 km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Power:</span>
                          <span className="text-blue-400 font-medium">150 HP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Handling:</span>
                          <span className="text-yellow-400 font-medium">72%</span>
                        </div>
                      </div>
                    </div>

                    {/* Build Area */}
                    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🚗</div>
                        <p className="text-gray-400">Drag components here to build</p>
                      </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Components:</span>
                          <span className="text-white font-medium">3</span>
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
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-2xl font-semibold mb-4">Test Tab</h2>
              <p className="text-gray-400 mb-6">Testing functionality goes here</p>
              <button
                onClick={() => setScore(prev => prev + 25)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Run Test
              </button>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold mb-4">Performance Tab</h2>
              <p className="text-gray-400 mb-6">Performance metrics go here</p>
              <button
                onClick={() => setScore(prev => prev + 15)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Analyze Performance
              </button>
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
            <span className="text-gray-400">Last saved: Never</span>
            <button
              onClick={() => console.log('Save clicked!')}
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

export default SimpleGamePage;
