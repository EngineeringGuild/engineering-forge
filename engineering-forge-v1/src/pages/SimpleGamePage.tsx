import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Star, Trophy, Zap } from 'lucide-react';

const SimpleGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'build' | 'test' | 'performance' | 'achievements'>('build');
  const [components, setComponents] = useState([
    { id: '1', name: 'Engine', type: 'mechanical', level: 1, unlocked: true },
    { id: '2', name: 'Wheel', type: 'mechanical', level: 1, unlocked: true },
    { id: '3', name: 'Battery', type: 'electrical', level: 2, unlocked: false },
    { id: '4', name: 'Sensor', type: 'electrical', level: 3, unlocked: false },
  ]);
  const [workspaceComponents, setWorkspaceComponents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState([
    { id: '1', name: 'First Build', description: 'Build your first component', unlocked: true },
    { id: '2', name: 'Speed Demon', description: 'Reach 100 km/h', unlocked: false },
    { id: '3', name: 'Efficiency Expert', description: 'Achieve 90% efficiency', unlocked: false },
  ]);

  useEffect(() => {
    console.log('🎮 SimpleGamePage loaded');
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setScore(prev => prev + 10);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setScore(0);
    setWorkspaceComponents([]);
  };

  const handleComponentSelect = (component: any) => {
    if (component.unlocked) {
      const newComponent = {
        ...component,
        id: `${component.id}-${Date.now()}`,
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      };
      setWorkspaceComponents(prev => [...prev, newComponent]);
    }
  };

  const handleComponentMove = (componentId: string, position: { x: number; y: number }) => {
    setWorkspaceComponents(prev =>
      prev.map(comp =>
        comp.id === componentId ? { ...comp, position } : comp
      )
    );
  };

  const tabs = [
    { id: 'build', label: 'Build', icon: '🔨' },
    { id: 'test', label: 'Test', icon: '🧪' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎮 Engineering Forge V1.0
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Score:</span>
              <span className="ml-2 font-semibold text-yellow-400">{score}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Level:</span>
              <span className="ml-2 font-semibold text-green-400">{level}</span>
            </div>
            <button
              onClick={handlePlayPause}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
          </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedTab === 'build' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Component Palette */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Components
                </h3>
                <div className="space-y-3">
                  {components.map(component => (
                  <button
                      key={component.id}
                      onClick={() => handleComponentSelect(component)}
                      disabled={!component.unlocked}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                        component.unlocked
                          ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                          : 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed'
                      }`}
                    >
                    <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{component.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{component.type}</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-orange-400 font-medium">Lv.{component.level}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                        </div>
                      </div>
                    </div>

            {/* Construction Workspace */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 h-96">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-400" />
                  Workspace
                </h3>
                <div className="relative w-full h-full bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600">
                  {workspaceComponents.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔧</div>
                        <div>Drag components here to build</div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {workspaceComponents.map(component => (
                        <div
                          key={component.id}
                          className="absolute bg-blue-600 text-white p-2 rounded-lg cursor-move shadow-lg"
                          style={{
                            left: component.position.x,
                            top: component.position.y,
                          }}
                          draggable
                          onDragEnd={(e) => {
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (rect) {
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              handleComponentMove(component.id, { x, y });
                            }
                          }}
                        >
                          {component.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          )}

        {selectedTab === 'test' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Testing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-400 font-semibold">Acceleration Test</div>
                <div className="text-green-300 text-sm">0-100 km/h in 5.2s</div>
              </div>
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 font-semibold">Top Speed</div>
                <div className="text-blue-300 text-sm">180 km/h</div>
              </div>
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 font-semibold">Efficiency</div>
                <div className="text-purple-300 text-sm">85%</div>
              </div>
            </div>
            </div>
          )}

        {selectedTab === 'performance' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4">
                <div className="text-white font-semibold">Power</div>
                <div className="text-green-100 text-2xl font-bold">250 HP</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4">
                <div className="text-white font-semibold">Torque</div>
                <div className="text-blue-100 text-2xl font-bold">320 Nm</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4">
                <div className="text-white font-semibold">Weight</div>
                <div className="text-purple-100 text-2xl font-bold">1,200 kg</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4">
                <div className="text-white font-semibold">Overall</div>
                <div className="text-yellow-100 text-2xl font-bold">A+</div>
              </div>
            </div>
            </div>
          )}

        {selectedTab === 'achievements' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-yellow-600/20 border-yellow-500/30'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className={`font-semibold ${
                    achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {achievement.unlocked ? '🏆' : '🔒'} {achievement.name}
            </div>
                  <div className={`text-sm ${
                    achievement.unlocked ? 'text-yellow-300' : 'text-gray-600'
                  }`}>
                    {achievement.description}
        </div>
      </div>
              ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleGamePage;
