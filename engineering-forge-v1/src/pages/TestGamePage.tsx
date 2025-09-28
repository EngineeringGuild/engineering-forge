import { Pause, Play, RotateCcw, Settings, Trophy, Zap } from 'lucide-react';
import React, { useState } from 'react';

const TestGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setScore(prev => prev + 10);
    }
  };

  const handleReset = () => {
    setScore(0);
    setLevel(1);
    setIsPlaying(false);
  };

  const handleLevelUp = () => {
    setLevel(prev => prev + 1);
    setScore(prev => prev + 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Engineering Forge
              </h1>
              <span className="text-sm text-gray-300">Level {level}</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Score: {score}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Components</h2>

          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔧</div>
                <div>
                  <h3 className="font-medium">Basic Engine</h3>
                  <p className="text-sm text-gray-400">Level 1</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h3 className="font-medium">Chassis</h3>
                  <p className="text-sm text-gray-400">Level 1</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🛞</div>
                <div>
                  <h3 className="font-medium">Wheels</h3>
                  <p className="text-sm text-gray-400">Level 1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Actions</h3>
            <button
              onClick={handleLevelUp}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Zap size={16} />
              <span>Level Up</span>
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 p-6">
          <div className="h-full bg-gray-800/30 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Construction Workspace</h2>

            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Performance Display */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Trophy className="mr-2" />
                  Performance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Speed:</span>
                    <span className="text-green-400">85 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Power:</span>
                    <span className="text-blue-400">150 HP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Handling:</span>
                    <span className="text-yellow-400">72%</span>
                  </div>
                </div>
              </div>

              {/* Construction Area */}
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚗</div>
                  <p className="text-gray-300">Drag components here to build</p>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Components:</span>
                    <span className="text-white">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Weight:</span>
                    <span className="text-white">1,200 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cost:</span>
                    <span className="text-white">$5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Volume</label>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Graphics Quality
                </label>
                <select className="w-full bg-gray-700 text-white rounded-lg p-2">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGamePage;
