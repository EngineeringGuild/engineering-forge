import {
  Pause,
  Play,
  RotateCcw,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getUnlockedComponents } from "../data/components";
import { MemoryOptimizationService } from "../domains/gaming/application/services/MemoryOptimizationService";
import { PerformanceOptimizationService } from "../domains/gaming/application/services/PerformanceOptimizationService";
import { Achievement } from "../domains/gaming/domain/entities/Achievement";
import {
  Component,
  ComponentCategory,
} from "../domains/gaming/domain/entities/Component";
import { GameSaveData } from "../domains/gaming/domain/entities/GameSave";
import { SimulationResult } from "../domains/gaming/domain/entities/SimulationResult";
import { TestResult } from "../domains/gaming/domain/entities/TestResult";
import {
  AchievementService,
  GameEvent,
} from "../domains/gaming/domain/services/AchievementService";
import { CarSimulationService } from "../domains/gaming/domain/services/CarSimulationService";
import {
  ProgressService,
  ProgressUpdate,
} from "../domains/gaming/domain/services/ProgressService";
import { SaveService } from "../domains/gaming/domain/services/SaveService";
import { ComponentProperties } from "../domains/gaming/domain/value-objects/ComponentProperties";
import { PerformanceMetrics } from "../domains/gaming/domain/value-objects/PerformanceMetrics";
import { PositionVO } from "../domains/gaming/domain/value-objects/Position";
import { useGameSounds, useUISounds } from "../hooks/useAudio";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { AchievementNotification } from "../presentation/components/game/achievements/AchievementNotification";
import { AchievementPanel } from "../presentation/components/game/achievements/AchievementPanel";
import { AudioControls } from "../presentation/components/game/audio/AudioControls";
import { CarSimulation } from "../presentation/components/game/CarSimulation";
import { GameHeader } from "../presentation/components/game/GameHeader";
import { PerformanceDisplay } from "../presentation/components/game/performance/PerformanceDisplay";
import { PerformanceTestPanel } from "../presentation/components/game/performance/PerformanceTestPanel";
import { TabNavigation } from "../presentation/components/game/TabNavigation";
import { ComponentPalette } from "../presentation/components/game/workspace/ComponentPalette";
import { ConstructionWorkspace } from "../presentation/components/game/workspace/ConstructionWorkspace";
import { LevelUpNotification } from "../presentation/components/Progress/LevelUpNotification";
import { ProgressPanel } from "../presentation/components/Progress/ProgressPanel";
import { SaveLoadPanel } from "../presentation/components/SaveLoad/SaveLoadPanel";
import { AnimatedButton } from "../presentation/components/ui/AnimatedButton";
import { GlassCard } from "../presentation/components/ui/GlassCard";

const GamePage: React.FC = () => {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<ComponentCategory>("mechanical");
  const [workspaceComponents, setWorkspaceComponents] = useState<Component[]>(
    []
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [currentPerformance, setCurrentPerformance] =
    useState<PerformanceMetrics | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showSaveLoadPanel, setShowSaveLoadPanel] = useState(false);
  const [showAchievementNotification, setShowAchievementNotification] =
    useState(false);
  const [activeTab, setActiveTab] = useState<
    "build" | "test" | "performance" | "achievements" | "simulation"
  >("build");

  // Settings state
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Progress tracking state
  const [progressService] = useState(() => new ProgressService());
  const [userId] = useState("user-001"); // TODO: Get from auth system
  const [levelUpNotification, setLevelUpNotification] =
    useState<ProgressUpdate | null>(null);

  // Save/load state
  const [saveService] = useState(
    () =>
      new SaveService({
        maxSaveSlots: 10,
        autoSaveInterval: 5,
        enableCloudSync: false,
        enableAutoBackup: true,
      })
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving] = useState(false);
  const [autoSaveError] = useState(false);

  // Achievement state
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<
    Achievement[]
  >([]);

  // Simulation state

  // Initialize services (memoized to prevent recreation)
  const physicsService = useMemo(() => new CarSimulationService(), []);
  const achievementService = useMemo(() => new AchievementService(), []);
  const performanceService = useMemo(
    () => PerformanceOptimizationService.getInstance(),
    []
  );
  const memoryService = useMemo(
    () => MemoryOptimizationService.getInstance(),
    []
  );

  // Audio hooks
  const { playTestComplete, playAchievement, playBackgroundMusic } =
    useGameSounds();
  const { playTabSwitch, playSave } = useUISounds();

  // Performance monitoring
  const { metrics: performanceMetrics, isLowPerformance } =
    usePerformanceMonitor({
      enabled: true,
      sampleRate: 1000,
      onPerformanceUpdate: (metrics) => {
        if (metrics.fps < 30) {
          console.warn(`Low FPS detected: ${metrics.fps}fps`);
        }
      },
    });

  // Initialize progress tracking
  useEffect(() => {
    console.log("Initializing progress service...");
    try {
      progressService.initializeProgress(userId);
      console.log("Progress service initialized successfully");
    } catch (error) {
      console.error("Error initializing progress service:", error);
    }
  }, [userId, progressService]);

  // Initialize save service
  useEffect(() => {
    console.log("Initializing save service...");
    const initSaveService = async () => {
      try {
        await saveService.initialize(userId);
        console.log("Save service initialized successfully");
      } catch (error) {
        console.error("Error initializing save service:", error);
      }
    };
    initSaveService();
  }, [userId, saveService]);

  // Initialize performance optimizations
  useEffect(() => {
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
  }, [performanceService, memoryService]);

  // Get available components for current user level (memoized)
  const availableComponents = useMemo(
    () => getUnlockedComponents(level),
    [level]
  );

  // Memoized car completion check
  const carCompletionStatus = useMemo(() => {
    const hasChassis = workspaceComponents.some((c) => c.type === "chassis");
    const hasEngine = workspaceComponents.some((c) => c.type === "engine");
    const hasWheels = workspaceComponents.some((c) => c.type === "wheels");

    return {
      isComplete: hasChassis && hasEngine && hasWheels,
      hasChassis,
      hasEngine,
      hasWheels,
      missingComponents: [
        !hasChassis && "chassis",
        !hasEngine && "engine",
        !hasWheels && "wheels",
      ].filter(Boolean) as string[],
    };
  }, [workspaceComponents]);

  // Load achievements on component mount
  useEffect(() => {
    setAchievements(achievementService.getAllAchievements());

    // Start background music
    playBackgroundMusic("bg-music-main");
  }, [achievementService, playBackgroundMusic]);

  const handlePlayPause = useCallback(() => {
    // Validate car is complete before allowing play
    if (!carCompletionStatus.isComplete) {
      alert(
        `Complete your car first! Missing components: ${carCompletionStatus.missingComponents.join(
          ", "
        )}`
      );
      return;
    }

    if (!isPlaying) {
      // Switch to simulation tab and start simulation
      setActiveTab("simulation");
      setIsPlaying(true);
    } else {
      // Stop simulation
      setIsPlaying(false);
    }
  }, [isPlaying, carCompletionStatus]);

  const handleReset = useCallback(() => {
    console.log("Reset clicked!");
    setIsPlaying(false);
    setScore(0);
    setLevel(1);
    setAchievements([]);
    setWorkspaceComponents([]);
    setSelectedComponentId(null);
  }, []);

  const handleComponentMove = useCallback(
    (componentId: string, position: PositionVO) => {
      setWorkspaceComponents((prev) =>
        prev.map((comp) => {
          if (comp.id === componentId) {
            // Create new component with updated position
            return new Component(comp.id, {
              name: comp.name,
              type: comp.type,
              category: comp.category,
              properties: comp.properties,
              position: position,
              size: comp.size,
              rotation: comp.rotation,
              isUnlocked: comp.isUnlocked,
              rarity: comp.rarity,
              icon: comp.icon,
              description: comp.description,
              level: comp.level,
            });
          }
          return comp;
        })
      );
    },
    []
  );

  const handleComponentSelectInWorkspace = useCallback(
    (componentId: string | null) => {
      setSelectedComponentId(componentId);
    },
    []
  );

  const handleComponentRemove = useCallback((componentId: string) => {
    setWorkspaceComponents((prev) =>
      prev.filter((comp) => comp.id !== componentId)
    );
    setSelectedComponentId(null);
  }, []);

  // Calculate performance when components change (debounced for performance)
  const debouncedPerformanceCalculation = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (components: Component[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (components.length > 0) {
          // Use the performance calculator for initial performance calculation
          const performanceCalculator =
            physicsService.getPerformanceCalculator();
          const performance =
            performanceCalculator.calculateInitialPerformance(components);
          setCurrentPerformance(performance);
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
      // Convert PerformanceTestResults to TestResult format
      const performance = new PerformanceMetrics({
        acceleration: 0,
        topSpeed: 0,
        handling: 0,
        fuelEfficiency: 0,
        weight: 0,
        power: 0,
        torque: 0,
        overall: results.score,
      });

      const result = new TestResult(`test_${Date.now()}`, {
        testType: "comprehensive",
        status: results.score >= 70 ? "completed" : "failed",
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
          trackCondition: "dry",
        },
      });
      setTestResults((prev) => [...prev, result]);

      // Award XP and credits based on test result
      if (result.passed) {
        setScore((prev) => prev + 25);
        playTestComplete();
        // Check for level up
        if (score > 0 && score % 50 === 0) {
          setLevel((prev) => prev + 1);
          // Note: Achievement objects will be handled by the achievement service
        }
      }

      // Track test completion in progress system
      const progressUpdate = progressService.processEvent({
        type: "test_completed",
        data: {
          userId,
          score: result.score,
          playTime: 1, // TODO: Track actual test time
        },
        timestamp: new Date(),
      });

      // Show level up notification if leveled up
      if (progressUpdate?.leveledUp) {
        setLevelUpNotification(progressUpdate);
      }

      // Process achievement events
      const gameEvent: GameEvent = {
        type: "test_completed",
        data: {
          passed: result.passed,
          score: result.score,
          performance: result.performance,
        },
        timestamp: new Date(),
      };

      const newlyUnlocked = achievementService.processGameEvent(gameEvent);
      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
        setShowAchievementNotification(true);
        setAchievements(achievementService.getAllAchievements());
        playAchievement();
      }
    },
    [
      score,
      achievementService,
      userId,
      progressService,
      playTestComplete,
      playAchievement,
    ]
  );

  const handleAchievementNotificationClose = useCallback(() => {
    setShowAchievementNotification(false);
    if (newlyUnlockedAchievements.length > 0) {
      setNewlyUnlockedAchievements((prev) => prev.slice(1));
      if (newlyUnlockedAchievements.length > 1) {
        setShowAchievementNotification(true);
      }
    }
  }, [newlyUnlockedAchievements]);

  // Memoized tab switch handlers
  const handleTabSwitch = useCallback(
    (tab: "build" | "test" | "performance" | "achievements" | "simulation") => {
      setActiveTab(tab);
      playTabSwitch();
    },
    [playTabSwitch]
  );

  // Simulation handlers
  const handleSimulationComplete = useCallback(
    (result: SimulationResult) => {
      console.log("🎉 Simulation completed:", result);

      // Award XP and credits based on simulation result
      if (result.passed) {
        const xpGained = Math.floor(result.score / 10); // 1-10 XP based on score
        setScore((prev) => prev + xpGained);

        // Check for level up
        if (score > 0 && score % 50 === 0) {
          setLevel((prev) => prev + 1);
        }

        // Process achievement events
        const gameEvent: GameEvent = {
          type: "simulation_completed",
          data: {
            passed: result.passed,
            score: result.score,
            performance: result.finalPerformance,
            distance: result.distance,
            maxSpeed: result.maxSpeed,
          },
          timestamp: new Date(),
        };

        const newlyUnlocked = achievementService.processGameEvent(gameEvent);
        if (newlyUnlocked.length > 0) {
          setNewlyUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
          setShowAchievementNotification(true);
          setAchievements(achievementService.getAllAchievements());
          playAchievement();
        }
      }

      setIsPlaying(false);
    },
    [score, achievementService, playAchievement]
  );

  const handleSimulationStart = useCallback(() => {
    console.log("Simulation started");
  }, []);

  const handleSimulationStop = useCallback(() => {
    setIsPlaying(false); // Also reset the play button state
    console.log("🛑 GamePage: Simulation stopped");
  }, []);

  // Reset simulation state when switching away from simulation tab
  useEffect(() => {
    if (activeTab !== "simulation") {
      setIsPlaying(false);
    }
  }, [activeTab]);

  // Save/Load functions
  const handleSave = useCallback(
    async (saveData: GameSaveData) => {
      setLastSaved(new Date());
      playSave();
      console.log("Game saved:", saveData.saveName);
    },
    [playSave]
  );

  const handleLoad = useCallback(
    async (saveData: GameSaveData) => {
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
          console.log("Progress restored:", progressData);
        }
      } catch (error) {
        console.error("Error restoring progress:", error);
      }

      setLastSaved(new Date());
      console.log("Game loaded:", saveData.saveName);
    },
    [userId, saveService]
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
            <h3 className="text-lg font-semibold mb-6 text-white">
              Game Settings
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workspace Settings */}
              <GlassCard variant="subtle" className="p-4">
                <h4 className="text-md font-semibold mb-4 text-white">
                  Workspace Settings
                </h4>
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
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="snapToGrid"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="snapToGrid"
                      className="text-sm text-gray-300"
                    >
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
              ⚠️ Low performance detected: {performanceMetrics.fps}fps -
              Consider reducing visual effects
            </div>
          )}

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabSwitch={handleTabSwitch} />

          {/* Tab Content */}
          {activeTab === "build" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
              {/* Component Palette */}
              <div className="lg:col-span-1">
                <ComponentPalette
                  components={availableComponents}
                  onComponentSelect={(component: Component) => {
                    console.log("Component selected:", component.name);

                    // Check if component type already exists
                    const existingComponent = workspaceComponents.find(
                      (c) => c.type === component.type
                    );
                    if (existingComponent) {
                      alert(
                        `You already have a ${component.type} component! Remove it first to add a different one.`
                      );
                      return;
                    }

                    // Add component to workspace
                    const newComponent = new Component(
                      `component_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
                      {
                        name: component.name,
                        type: component.type,
                        category: component.category,
                        properties: ComponentProperties.create(
                          component.properties
                        ),
                        position: new PositionVO(
                          Math.random() * 200 + 50, // Random position between 50-250
                          Math.random() * 200 + 50
                        ),
                        size: component.size,
                        rotation: component.rotation,
                        isUnlocked: component.isUnlocked,
                        rarity: component.rarity,
                        icon: component.icon,
                        description: component.description,
                        level: component.level,
                      }
                    );

                    setWorkspaceComponents((prev) => [...prev, newComponent]);
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

                        {/* Car completion indicator */}
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              carCompletionStatus.hasChassis
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                            title="Chassis"
                          />
                          <div
                            className={`w-3 h-3 rounded-full ${
                              carCompletionStatus.hasEngine
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                            title="Engine"
                          />
                          <div
                            className={`w-3 h-3 rounded-full ${
                              carCompletionStatus.hasWheels
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                            title="Wheels"
                          />
                          {carCompletionStatus.isComplete && (
                            <span className="text-green-400 text-sm font-medium">
                              🚗 Complete!
                            </span>
                          )}
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
                      onComponentRemove={handleComponentRemove}
                      selectedComponentId={selectedComponentId || undefined}
                      gridSize={gridSize}
                      snapToGrid={snapToGrid}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "test" && (
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
                      <div className="text-sm">
                        Run some tests to see results here
                      </div>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? "bg-green-900/20 border-green-500/30"
                            : "bg-red-900/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            Test #{index + 1}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              result.passed ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {result.passed ? "PASSED" : "FAILED"}
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

          {activeTab === "performance" && (
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No Components Added
                    </h3>
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
                      <div className="text-sm">
                        Run tests to build performance history
                      </div>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={result.id}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            Test #{index + 1}
                          </span>
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

          {activeTab === "simulation" && (
            <div className="h-full">
              <CarSimulation
                components={workspaceComponents}
                onSimulationComplete={handleSimulationComplete}
                onSimulationStart={handleSimulationStart}
                onSimulationStop={handleSimulationStop}
                trackLength={1000}
                maxSimulationTime={60}
                enablePhysics={true}
                showControls={true}
                autoStart={isPlaying}
              />
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="h-full">
              <AchievementPanel
                achievements={achievements}
                onAchievementClick={(achievement) => {
                  console.log("Achievement clicked:", achievement.title);
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
              <div
                key={index}
                className="flex items-center text-yellow-300 text-sm"
              >
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

export default GamePage;
