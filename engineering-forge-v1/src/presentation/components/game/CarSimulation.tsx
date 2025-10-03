// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/CarSimulation.tsx

import { Pause, Play, RotateCcw, TrendingUp, Zap } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CarSimulationConfig,
  CarSimulationEvents,
  CarSimulationManager,
} from "../../../domains/gaming/application/services/CarSimulationManager";
import { Component } from "../../../domains/gaming/domain/entities/Component";
import { SimulationResult } from "../../../domains/gaming/domain/entities/SimulationResult";
import { AnimationState } from "../../../domains/gaming/domain/value-objects/AnimationState";
import { AnimatedButton } from "../ui/AnimatedButton";
import { GlassCard } from "../ui/GlassCard";

/**
 * Car Simulation Props Interface
 * Props for the CarSimulation component
 */
export interface CarSimulationProps {
  components: Component[];
  onSimulationComplete: (result: SimulationResult) => void;
  onSimulationStart?: () => void;
  onSimulationStop?: () => void;
  className?: string;
  trackLength?: number;
  maxSimulationTime?: number;
  enablePhysics?: boolean;
  showControls?: boolean;
  autoStart?: boolean;
  enableEffects?: boolean;
  animationDuration?: number;
  frameRate?: number;
}

/**
 * Car Simulation Component
 * Renders car simulation with visual effects and controls
 *
 * This component handles:
 * - Car simulation execution
 * - Animation rendering
 * - Performance display
 * - User controls
 * - Visual effects
 */
export const CarSimulation: React.FC<CarSimulationProps> = ({
  components,
  onSimulationComplete,
  onSimulationStart,
  onSimulationStop,
  className = "",
  trackLength = 1000,
  maxSimulationTime = 60,
  enablePhysics = true,
  showControls = true,
  autoStart = false,
  enableEffects = true,
  animationDuration = 5000,
  frameRate = 60,
}) => {
  // State
  const [isSimulating, setIsSimulating] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>(
    AnimationState.create({
      isAnimating: false,
      currentFrame: null,
      progress: 0,
      speed: 0,
      distance: 0,
      maxSpeed: 0,
      effects: [],
    })
  );
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulationManagerRef = useRef<CarSimulationManager | null>(null);
  const hasAutoStarted = useRef(false);

  // Initialize simulation manager
  useEffect(() => {
    const config: CarSimulationConfig = {
      trackLength,
      maxSimulationTime,
      enablePhysics,
      animationDuration,
      frameRate,
      enableEffects,
    };

    const events: CarSimulationEvents = {
      onSimulationStart: () => {
        setIsSimulating(true);
        setError(null);
        onSimulationStart?.();
      },
      onSimulationStop: () => {
        setIsSimulating(false);
        onSimulationStop?.();
      },
      onSimulationComplete: (result) => {
        setShowResults(true);
        onSimulationComplete(result);
      },
      onAnimationFrame: (state) => {
        setAnimationState(state);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsSimulating(false);
      },
    };

    simulationManagerRef.current = new CarSimulationManager(config, events);
  }, [
    trackLength,
    maxSimulationTime,
    enablePhysics,
    animationDuration,
    frameRate,
    enableEffects,
    onSimulationStart,
    onSimulationStop,
    onSimulationComplete,
  ]);

  /**
   * Start car simulation
   */
  const startSimulation = useCallback(async () => {
    if (!simulationManagerRef.current) {
      console.error("❌ Simulation manager not initialized");
      return;
    }

    try {
      console.log("🚀 Starting simulation with components:", components);
      console.log(
        "🚀 Component details:",
        components.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.name,
        }))
      );

      await simulationManagerRef.current.startSimulation(components);
      console.log("✅ Simulation started successfully");
    } catch (err) {
      console.error("❌ Simulation error:", err);
      console.error(
        "❌ Error stack:",
        err instanceof Error ? err.stack : "No stack"
      );
      const errorMessage =
        err instanceof Error ? err.message : "Simulation failed";
      setError(errorMessage);
    }
  }, [components]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    if (!simulationManagerRef.current) return;

    console.log("🛑 CarSimulation: Stopping simulation");
    simulationManagerRef.current.stopSimulation();
  }, []);

  /**
   * Reset simulation
   */
  const resetSimulation = useCallback(() => {
    if (!simulationManagerRef.current) return;

    simulationManagerRef.current.resetSimulation();
    setAnimationState(
      AnimationState.create({
        isAnimating: false,
        currentFrame: null,
        progress: 0,
        speed: 0,
        distance: 0,
        maxSpeed: 0,
        effects: [],
      })
    );
    setShowResults(false);
    setError(null);
    hasAutoStarted.current = false;
  }, []);

  // Auto-start simulation if enabled
  useEffect(() => {
    if (
      autoStart &&
      components.length > 0 &&
      !isSimulating &&
      !hasAutoStarted.current
    ) {
      hasAutoStarted.current = true;
      startSimulation();
    }

    if (!autoStart) {
      hasAutoStarted.current = false;
    }
  }, [autoStart, components.length, isSimulating, startSimulation]);

  /**
   * Render canvas
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationManagerRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    simulationManagerRef.current.renderCanvas(ctx);
  }, []);

  // Render canvas on animation frame
  useEffect(() => {
    if (animationState.isAnimating) {
      const animate = () => {
        renderCanvas();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      renderCanvas();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationState.isAnimating, renderCanvas]);

  // Update canvas size on mount and render initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const width = canvas.offsetWidth || 800;
      const height = canvas.offsetHeight || 256;

      canvas.width = width;
      canvas.height = height;

      console.log("🎨 Canvas initialized - Width:", width, "Height:", height);
      renderCanvas();
    }
  }, [renderCanvas]);

  // Get simulation result for display
  const simulationResult = simulationManagerRef.current?.getSimulationResult();

  return (
    <div className={`car-simulation ${className}`}>
      {/* Welcome message */}
      {!isSimulating && !simulationResult && components.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-6 mb-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🏁</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Welcome to Car Simulation!
            </h3>
            <p className="text-gray-300 mb-2">
              Build your car in the Build tab first, then come back here to test
              it!
            </p>
            <p className="text-gray-400 text-sm">
              You need: Chassis + Engine + Wheels
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isSimulating && !animationState.isAnimating && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-blue-300">Calculating simulation...</span>
          </div>
        </div>
      )}

      {/* Canvas for animation */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{
            background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
          }}
        />

        {/* Speed display overlay */}
        {animationState.isAnimating && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm">
              <div className="flex items-center mb-1">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                <span className="font-medium">
                  {Math.round(animationState.speed)} km/h
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                <span>
                  {Math.round(animationState.distance)}m / {trackLength}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        {animationState.isAnimating && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center justify-between text-white text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(animationState.progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${animationState.progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center space-x-4 mb-4">
          <AnimatedButton
            variant={isSimulating ? "danger" : "primary"}
            size="lg"
            onClick={isSimulating ? stopSimulation : startSimulation}
            disabled={components.length === 0}
            icon={
              isSimulating ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )
            }
          >
            {isSimulating ? "Stop Simulation" : "Start Simulation"}
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            size="lg"
            onClick={resetSimulation}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Reset
          </AnimatedButton>
        </div>
      )}

      {/* Error display */}
      {error && (
        <GlassCard
          variant="colored"
          className="p-4 mb-4 bg-red-900/20 border-red-500/30"
        >
          <div className="text-red-300">
            <h4 className="font-semibold mb-2">Simulation Error</h4>
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* Results display */}
      {showResults && simulationResult && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
            Simulation Results
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Distance</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(simulationResult.distance)}m
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Max Speed</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(simulationResult.maxSpeed)} km/h
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Score</div>
              <div className="text-2xl font-bold text-white">
                {simulationResult.score}/100
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div
                className={`text-2xl font-bold ${
                  simulationResult.passed ? "text-green-400" : "text-red-400"
                }`}
              >
                {simulationResult.passed ? "PASSED" : "FAILED"}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg text-gray-300 mb-2">
              Performance Grade:{" "}
              <span className="font-bold text-white">
                {simulationResult.score >= 90
                  ? "A"
                  : simulationResult.score >= 80
                  ? "B"
                  : simulationResult.score >= 70
                  ? "C"
                  : simulationResult.score >= 60
                  ? "D"
                  : "F"}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Duration: {simulationResult.duration.toFixed(1)}s | Average Speed:{" "}
              {Math.round(simulationResult.averageSpeed)} km/h
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
