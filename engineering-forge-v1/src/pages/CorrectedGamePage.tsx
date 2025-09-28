import { Pause, Play, RotateCcw, Star, TrendingUp, Trophy, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getUnlockedComponents } from '../data/components';
import { Achievement } from '../domains/gaming/domain/entities/Achievement';
import { Component, ComponentCategory } from '../domains/gaming/domain/entities/Component';
import { TestResult } from '../domains/gaming/domain/entities/TestResult';
import {
  AchievementService,
  GameEvent
} from '../domains/gaming/domain/services/AchievementService';
import { PhysicsSimulationService } from '../domains/gaming/domain/services/PhysicsSimulationService';
import { PerformanceMetrics } from '../domains/gaming/domain/value-objects/PerformanceMetrics';
import { Position } from '../domains/gaming/domain/value-objects/Position';
import { GameSaveData } from '../domains/gaming/entities/GameSave';
import { ProgressService, ProgressUpdate } from '../domains/gaming/services/ProgressService';
import { SaveService } from '../domains/gaming/services/SaveService';
import { useGameSounds, useUISounds } from '../hooks/useAudio';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { AchievementNotification } from '../presentation/components/game/AchievementNotification';
import { AchievementPanel } from '../presentation/components/game/AchievementPanel';
import { AudioControls } from '../presentation/components/game/AudioControls';
import { ComponentPalette } from '../presentation/components/game/ComponentPalette';
import { ConstructionWorkspace } from '../presentation/components/game/ConstructionWorkspace';
import { GameHeader } from '../presentation/components/game/GameHeader';
import { PerformanceDisplay } from '../presentation/components/game/PerformanceDisplay';
import { PerformanceTestPanel } from '../presentation/components/game/PerformanceTestPanel';
import { TabNavigation } from '../presentation/components/game/TabNavigation';
import { LevelUpNotification, ProgressPanel } from '../presentation/components/Progress';
import { SaveLoadPanel } from '../presentation/components/SaveLoad';
import { AnimatedButton } from '../presentation/components/ui/AnimatedButton';
import { GlassCard } from '../presentation/components/ui/GlassCard';
import { MemoryOptimizationService } from '../services/MemoryOptimizationService';
import { PerformanceOptimizationService } from '../services/PerformanceOptimizationService';

const CorrectedGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(100);
  const [level, setLevel] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('mechanical');
  const [workspaceComponents, setWorkspaceComponents] = useState<Component[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [currentPerformance, setCurrentPerformance] = useState<PerformanceMetrics | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Progress tracking state
  const [progressService] = useState(() => new ProgressService());
  const [userId] = useState('user-001'); // TODO: Get from auth system
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [levelUpNotification, setLevelUpNotification] = useState<ProgressUpdate | null>(null);

  // Save/load state
  const [saveService] = useState(
    () =>
      new SaveService({
        maxSaveSlots: 10,
        autoSaveInterval: 5,
        enableCloudSync: false,
        enableAutoBackup: true
      })
  );
  const [showSaveLoadPanel, setShowSaveLoadPanel] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving] = useState(false);
  const [autoSaveError] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'test' | 'performance' | 'achievements'>(
    'build'
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);

  // Initialize services
  const physicsService = useMemo(() => new PhysicsSimulationService(), []);
  const achievementService = useMemo(() => new AchievementService(), []);

  // Audio hooks
  const { playTestComplete, playAchievement, playBackgroundMusic } = useGameSounds();
  const { playTabSwitch, playSave } = useUISounds();

  // Performance monitoring
  const { metrics: performanceMetrics, isLowPerformance } = usePerformanceMonitor({
    enabled: true,
    sampleRate: 1000,
    onPerformanceUpdate: metrics => {
      if (metrics.fps < 30) {
        console.warn(`Low FPS detected: ${metrics.fps}fps`);
      }
    }
  });

  // Performance optimization service
  const performanceService = useMemo(() => PerformanceOptimizationService.getInstance(), []);
  const memoryService = useMemo(() => MemoryOptimizationService.getInstance(), []);

  // Initialize progress tracking
  useEffect(() => {
    console.log('Initializing progress service...');
    try {
      progressService.initializeProgress(userId);
      console.log('Progress service initialized successfully');
    } catch (error) {
      console.error('Error initializing progress service:', error);
    }
  }, [userId, progressService]);

  // Initialize save service
  useEffect(() => {
    console.log('Initializing save service...');
    const initSaveService = async () => {
      try {
        await saveService.initialize(userId);
        console.log('Save service initialized successfully');
      } catch (error) {
        console.error('Error initializing save service:', error);
      }
    };
    initSaveService();
  }, [userId, saveService]);

  // Initialize performance optimizations
  useEffect(() => {
    console.log('Initializing performance optimizations...');
    try {
      performanceService.enableOptimizations();
      memoryService.startMonitoring();

      // Register cleanup tasks
      const cleanupTask = () => {
        // Clear unused state
        setTestResults([]);
        setNewlyUnlockedAchievements([]);
      };
      memoryService.registerCleanupTask(cleanupTask);

      return () => {
        performanceService.disableOptimizations();
        memoryService.stopMonitoring();
        memoryService.unregisterCleanupTask(cleanupTask);
      };
    } catch (error) {
      console.error('Error initializing performance optimizations:', error);
    }
  }, [performanceService, memoryService]);

  // Get available components for current user level (memoized)
  const availableComponents = useMemo(() => {
    console.log('Getting available components for level:', level);
    try {
      return getUnlockedComponents(level);
    } catch (error) {
      console.error('Error getting available components:', error);
      return [];
    }
  }, [level]);

  // Load achievements on component mount
  useEffect(() => {
    console.log('Loading achievements...');
    try {
      setAchievements(achievementService.getAllAchievements());
      // Start background music
      playBackgroundMusic('bg-music-main');
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, [achievementService, playBackgroundMusic]);

  const handlePlayPause = useCallback(() => {
    console.log('Play/Pause clicked! Current state:', isPlaying);
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    console.log('Reset clicked!');
    setIsPlaying(false);
    setScore(0);
    setLevel(1);
    setAchievements([]);
    setWorkspaceComponents([]);
    setSelectedComponentId(null);
  }, []);

  const handleComponentMove = useCallback((componentId: string, position: Position) => {
    console.log('Component moved:', componentId, position);
    setWorkspaceComponents(prev =>
      prev.map(comp => {
        if (comp.id === componentId) {
          comp.moveTo(position);
          return comp;
        }
        return comp;
      })
    );
  }, []);

  const handleComponentSelectInWorkspace = useCallback((componentId: string | null) => {
    console.log('Component selected in workspace:', componentId);
    setSelectedComponentId(componentId);
  }, []);

  // Calculate performance when components change (debounced for performance)
  const debouncedPerformanceCalculation = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (components: Component[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Calculating performance for components:', components.length);
        if (components.length > 0) {
          try {
            const performance = physicsService.simulateProject({
              components,
              environment: {
                gravity: 9.81,
                airDensity: 1.225,
                temperature: 20,
                windSpeed: 0
              }
            });
            setCurrentPerformance(performance.performance);
            console.log('Performance calculated:', performance.performance);
          } catch (error) {
            console.error('Error calculating performance:', error);
            setCurrentPerformance(null);
          }
        } else {
          setCurrentPerformance(null);
        }
      }, 100); // Debounce by 100ms
    };
  }, [physicsService]);

  useEffect(() => {
    debouncedPerformanceCalculation(workspaceComponents);
  }, [workspaceComponents, debouncedPerformanceCalculation]);

  const handleTestComplete = useCallback(
    (results: {
      score: number;
      loadTime: number;
      fps: number;
      memoryUsage: number;
      renderTime: number;
      grade: string;
      recommendations: string[];
    }) => {
      console.log('Test completed with results:', results);

      try {
        // Convert PerformanceTestResults to TestResult format
        const performance = new PerformanceMetrics({
          acceleration: 0,
          topSpeed: 0,
          handling: 0,
          fuelEfficiency: 0,
          weight: 0,
          power: 0,
          torque: 0,
          overall: results.score
        });

        const result = new TestResult(`test_${Date.now()}`, {
          testType: 'comprehensive',
          status: results.score >= 70 ? 'completed' : 'failed',
          startTime: new Date(),
          endTime: new Date(),
          duration: results.loadTime,
          performance,
          score: results.score,
          passed: results.score >= 70,
          environment: {
            temperature: 20,
            humidity: 50,
            windSpeed: 0,
            trackCondition: 'dry'
          }
        });
        setTestResults(prev => [...prev, result]);

        // Award XP and credits based on test result
        if (result.passed) {
          setScore(prev => prev + 25);
          playTestComplete();
          // Check for level up
          if (score > 0 && score % 50 === 0) {
            setLevel(prev => prev + 1);
          }
        }

        // Track test completion in progress system
        try {
          const progressUpdate = progressService.processEvent({
            type: 'test_completed',
            data: {
              userId,
              score: result.score,
              playTime: 1 // TODO: Track actual test time
            },
            timestamp: new Date()
          });

          // Show level up notification if leveled up
          if (progressUpdate?.leveledUp) {
            setLevelUpNotification(progressUpdate);
          }
        } catch (error) {
          console.error('Error processing progress event:', error);
        }

        // Process achievement events
        try {
          const gameEvent: GameEvent = {
            type: 'test_completed',
            data: {
              passed: result.passed,
              score: result.score,
              performance: result.performance
            },
            timestamp: new Date()
          };

          const newlyUnlocked = achievementService.processGameEvent(gameEvent);
          if (newlyUnlocked.length > 0) {
            setNewlyUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
            setShowAchievementNotification(true);
            setAchievements(achievementService.getAllAchievements());
            playAchievement();
          }
        } catch (error) {
          console.error('Error processing achievement event:', error);
        }
      } catch (error) {
        console.error('Error handling test completion:', error);
      }
    },
    [score, achievementService, userId, progressService, playTestComplete, playAchievement]
  );

  const handleAchievementNotificationClose = useCallback(() => {
    console.log('Achievement notification closed');
    setShowAchievementNotification(false);
    if (newlyUnlockedAchievements.length > 0) {
      setNewlyUnlockedAchievements(prev => prev.slice(1));
      if (newlyUnlockedAchievements.length > 1) {
        setShowAchievementNotification(true);
      }
    }
  }, [newlyUnlockedAchievements]);

  // Memoized tab switch handlers
  const handleTabSwitch = useCallback(
    (tab: 'build' | 'test' | 'performance' | 'achievements') => {
      console.log('Tab switched to:', tab);
      setActiveTab(tab);
      playTabSwitch();
    },
    [playTabSwitch]
  );

  // Save/Load functions
  const handleSave = useCallback(
    async (saveData: GameSaveData) => {
      console.log('Saving game:', saveData.saveName);
      try {
        const result = await saveService.saveGame(userId, saveData);
        if (result.success) {
          setLastSaved(new Date());
          playSave();
          console.log('Game saved successfully');
        } else {
          console.error('Failed to save game:', result.error);
        }
      } catch (error) {
        console.error('Error saving game:', error);
      }
    },
    [saveService, userId, playSave]
  );

  const handleLoad = useCallback(
    async (saveData: GameSaveData) => {
      console.log('Loading game:', saveData.saveName);
      try {
        // Restore game state from save data
        setLevel(saveData.currentLevel);
        setScore(saveData.score);
        setWorkspaceComponents(saveData.workspaceComponents);
        setTestResults(saveData.testResults);
        setAchievements([]); // TODO: Restore achievements from save data

        // Restore settings
        setGridSize(saveData.settings.gridSize);
        setSnapToGrid(saveData.settings.snapToGrid);

        // Restore progress
        try {
          const progressData = await saveService.loadProgress(userId);
          if (progressData) {
            // Restore progress data if available
            console.log('Progress restored:', progressData);
          }
        } catch (error) {
          console.error('Error restoring progress:', error);
        }

        setLastSaved(new Date());
        console.log('Game loaded successfully');
      } catch (error) {
        console.error('Error loading game:', error);
      }
    },
    [userId, progressService]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Header */}
      <GameHeader
        score={score}
        level={level}
        workspaceComponentsCount={workspaceComponents.length}
        achievementsCount={achievements.length}
        lastSaved={lastSaved}
        isAutoSaving={isAutoSaving}
        autoSaveError={autoSaveError}
        onProgressClick={() => setShowProgressPanel(!showProgressPanel)}
        onSaveClick={() => setShowSaveLoadPanel(!showSaveLoadPanel)}
        onSettingsClick={() => setShowSettings(!showSettings)}
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold mb-6 text-white">Game Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workspace Settings */}
              <GlassCard variant="subtle" className="p-4">
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
                    <AnimatedButton
                      variant="danger"
                      size="sm"
                      onClick={handleReset}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Reset Workspace
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>

              {/* Audio Settings */}
              <AudioControls />
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
          {/* Performance Indicator */}
          {isLowPerformance && (
            <div className="mb-4 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
              ⚠️ Low performance detected: {performanceMetrics.fps}fps - Consider reducing visual
              effects
            </div>
          )}

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabSwitch={handleTabSwitch} />

          {/* Tab Content */}
          {activeTab === 'build' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
              {/* Component Palette */}
              <div className="lg:col-span-1">
                <ComponentPalette
                  components={availableComponents}
                  onComponentSelect={(component: Component) => {
                    console.log('Component selected:', component.name);
                  }}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  userLevel={level}
                />
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

                  <div className="h-[calc(100%-80px)] p-4">
                    <ConstructionWorkspace
                      components={workspaceComponents}
                      onComponentMove={handleComponentMove}
                      onComponentSelect={handleComponentSelectInWorkspace}
                      selectedComponentId={selectedComponentId || undefined}
                      gridSize={gridSize}
                      snapToGrid={snapToGrid}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
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
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Current Performance */}
              <div>
                {currentPerformance ? (
                  <PerformanceDisplay
                    performance={currentPerformance}
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
                  {testResults.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">📈</div>
                      <div>No performance data yet</div>
                      <div className="text-sm">Run tests to build performance history</div>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
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
                            <div className="text-white font-medium">
                              {result.score.toFixed(1)}/100
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="h-full">
              <AchievementPanel
                achievements={achievements}
                onAchievementClick={achievement => {
                  console.log('Achievement clicked:', achievement.title);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Achievement Notifications */}
      {showAchievementNotification && newlyUnlockedAchievements.length > 0 && (
        <AchievementNotification
          achievement={newlyUnlockedAchievements[0]}
          onClose={handleAchievementNotificationClose}
        />
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 max-w-sm">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Achievements
          </h3>
          <div className="space-y-1">
            {achievements.slice(-3).map((achievement, index) => (
              <div key={index} className="flex items-center text-yellow-300 text-sm">
                <Star className="w-3 h-3 mr-2" />
                {achievement.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Panel */}
      <ProgressPanel
        userId={userId}
        progressService={progressService}
        isVisible={showProgressPanel}
        onClose={() => setShowProgressPanel(false)}
      />

      {/* Level Up Notification */}
      <LevelUpNotification
        update={levelUpNotification}
        onClose={() => setLevelUpNotification(null)}
      />

      {/* Save Load Panel */}
      <SaveLoadPanel
        userId={userId}
        saveService={saveService}
        isVisible={showSaveLoadPanel}
        onClose={() => setShowSaveLoadPanel(false)}
        onSave={handleSave}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default CorrectedGamePage;
