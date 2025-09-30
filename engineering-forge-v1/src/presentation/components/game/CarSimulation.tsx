// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/CarSimulation.tsx

import { Pause, Play, RotateCcw, TrendingUp, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Component } from '../../../domains/gaming/domain/entities/Component';
import { SimulationResult } from '../../../domains/gaming/domain/entities/SimulationResult';
import {
  CarSimulationResult,
  CarSimulationService
} from '../../../domains/gaming/domain/services/CarSimulationService';
import {
  AnimationFrame,
  AnimationService
} from '../../../domains/gaming/services/AnimationService';
import { AnimatedButton } from '../ui/AnimatedButton';
import { GlassCard } from '../ui/GlassCard';

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
}

/**
 * Animation State Interface
 * State for animation rendering
 */
interface AnimationState {
  isAnimating: boolean;
  currentFrame: AnimationFrame | null;
  progress: number;
  speed: number;
  distance: number;
  maxSpeed: number;
  effects: any[];
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
  className = '',
  trackLength = 1000,
  maxSimulationTime = 60,
  enablePhysics = true,
  showControls = true,
  autoStart = false
}) => {
  // Services
  const [simulationService] = useState(() => new CarSimulationService());
  const [animationService] = useState(() => new AnimationService());

  // State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<CarSimulationResult | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentFrame: null,
    progress: 0,
    speed: 0,
    distance: 0,
    maxSpeed: 0,
    effects: []
  });
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulationRef = useRef<CarSimulationResult | null>(null);

  // Auto-start simulation if enabled
  useEffect(() => {
    if (autoStart && components.length > 0 && !isSimulating) {
      startSimulation();
    }
  }, [autoStart, components.length, isSimulating]);

  /**
   * Start car simulation
   */
  const startSimulation = useCallback(async () => {
    try {
      console.log('🚀 Starting simulation with components:', components);
      setError(null);
      setIsSimulating(true);
      onSimulationStart?.();

      // Run simulation
      const result = await simulationService.runSimulation(components, {
        trackLength,
        maxSimulationTime,
        enablePhysics
      });

      console.log('✅ Simulation completed:', result);
      simulationRef.current = result;
      setSimulationResult(result);

      // Start animation
      await startAnimation(result.simulationSteps);
    } catch (err) {
      console.error('❌ Simulation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Simulation failed';
      setError(errorMessage);
      setIsSimulating(false);
      onSimulationStop?.();
    }
  }, [
    components,
    trackLength,
    maxSimulationTime,
    enablePhysics,
    simulationService,
    onSimulationStart,
    onSimulationStop
  ]);

  /**
   * Start animation from simulation steps
   */
  const startAnimation = useCallback(
    async (simulationSteps: any[]) => {
      try {
        console.log('🎬 Starting animation with steps:', simulationSteps.length);
        setAnimationState(prev => ({ ...prev, isAnimating: true }));

        // Add animation event listeners
        animationService.addEventListener('frame', event => {
          if (event.data) {
            setAnimationState(prev => ({
              ...prev,
              currentFrame: event.data,
              progress: event.data.position.x / trackLength,
              speed: event.data.speed,
              distance: event.data.position.x,
              effects: event.data.effects || []
            }));
          }
        });

        animationService.addEventListener('complete', () => {
          setAnimationState(prev => ({ ...prev, isAnimating: false }));
          setIsSimulating(false);
          setShowResults(true);
          onSimulationStop?.();

          // Convert to SimulationResult entity and notify parent
          if (simulationRef.current) {
            const simulationResult = new SimulationResult(simulationRef.current.id, {
              startTime: simulationRef.current.startTime,
              endTime: simulationRef.current.endTime,
              duration: simulationRef.current.duration,
              distance: simulationRef.current.distance,
              maxSpeed: simulationRef.current.maxSpeed,
              averageSpeed: simulationRef.current.averageSpeed,
              finalPerformance: simulationRef.current.finalPerformance,
              score: simulationRef.current.score,
              passed: simulationRef.current.passed,
              simulationSteps: simulationSteps.map(step => ({
                timestamp: step.timestamp,
                position: step.position,
                speed: step.speed,
                acceleration: step.acceleration,
                performance: step.performance
              })),
              userId: 'user-001' // TODO: Get from auth context
            });

            onSimulationComplete(simulationResult);
          }
        });

        // Start animation
        await animationService.startAnimation(simulationSteps, {
          duration: 5000, // 5 seconds animation
          frameRate: 60,
          easing: 'easeInOut',
          enableParticles: true,
          enableTrail: true,
          enableSpeedLines: true
        });
      } catch (err) {
        console.error('Animation error:', err);
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
        setIsSimulating(false);
      }
    },
    [animationService, trackLength, onSimulationComplete, onSimulationStop]
  );

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    animationService.stopAnimation();
    setIsSimulating(false);
    setAnimationState(prev => ({ ...prev, isAnimating: false }));
    onSimulationStop?.();
  }, [animationService, onSimulationStop]);

  /**
   * Reset simulation
   */
  const resetSimulation = useCallback(() => {
    stopSimulation();
    setSimulationResult(null);
    setAnimationState({
      isAnimating: false,
      currentFrame: null,
      progress: 0,
      speed: 0,
      distance: 0,
      maxSpeed: 0,
      effects: []
    });
    setShowResults(false);
    setError(null);
  }, [stopSimulation]);

  /**
   * Render car on canvas
   */
  const renderCar = useCallback(
    (ctx: CanvasRenderingContext2D, frame: AnimationFrame) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const centerX = canvas.width / 2;
      const carX =
        centerX + (frame.position.x / trackLength) * (canvas.width * 0.8) - canvas.width * 0.4;
      const carY = canvas.height / 2;

      // Save context
      ctx.save();

      // Apply transformations
      ctx.translate(carX, carY);
      ctx.scale(frame.scale, frame.scale);
      ctx.rotate(frame.rotation);
      ctx.globalAlpha = frame.opacity;

      // Draw car body
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-30, -15, 60, 30);

      // Draw wheels
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-25, -20, 8, 10);
      ctx.fillRect(17, -20, 8, 10);
      ctx.fillRect(-25, 10, 8, 10);
      ctx.fillRect(17, 10, 8, 10);

      // Draw speed indicator
      if (frame.speed > 0) {
        ctx.fillStyle = '#10B981';
        ctx.font = '12px Arial';
        ctx.fillText(`${Math.round(frame.speed)} km/h`, -20, -25);
      }

      // Restore context
      ctx.restore();
    },
    [trackLength]
  );

  /**
   * Render track on canvas
   */
  const renderTrack = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const trackY = canvas.height / 2;

      // Draw track background
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, trackY - 50, canvas.width, 100);

      // Draw track lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, trackY);
      ctx.lineTo(canvas.width, trackY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw track borders
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, trackY - 50);
      ctx.lineTo(canvas.width, trackY - 50);
      ctx.moveTo(0, trackY + 50);
      ctx.lineTo(canvas.width, trackY + 50);
      ctx.stroke();

      // Draw distance markers
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px Arial';
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        const distance = (i / 10) * trackLength;
        ctx.fillText(`${Math.round(distance)}m`, x, trackY - 60);
      }
    },
    [trackLength]
  );

  /**
   * Render effects on canvas
   */
  const renderEffects = useCallback((ctx: CanvasRenderingContext2D, effects: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    effects.forEach(effect => {
      ctx.save();
      ctx.globalAlpha = effect.intensity;

      switch (effect.type) {
        case 'particle':
          ctx.fillStyle = effect.color;
          ctx.beginPath();
          ctx.arc(effect.position.x, effect.position.y, 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'trail':
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(effect.position.x, effect.position.y - 5);
          ctx.lineTo(effect.position.x, effect.position.y + 5);
          ctx.stroke();
          break;

        case 'speedLine':
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(effect.position.x - 20, effect.position.y);
          ctx.lineTo(effect.position.x + 20, effect.position.y);
          ctx.stroke();
          break;

        case 'dust':
          ctx.fillStyle = effect.color;
          ctx.beginPath();
          ctx.arc(effect.position.x, effect.position.y, 1, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    });
  }, []);

  /**
   * Render canvas
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render track
    renderTrack(ctx);

    // Render effects
    if (animationState.currentFrame) {
      renderEffects(ctx, animationState.effects);
      renderCar(ctx, animationState.currentFrame);
    }

    // Render progress bar
    if (animationState.isAnimating) {
      ctx.fillStyle = '#10B981';
      ctx.fillRect(0, canvas.height - 4, canvas.width * animationState.progress, 4);
    }
  }, [animationState, renderTrack, renderEffects, renderCar]);

  // Render canvas on animation frame
  useEffect(() => {
    if (animationState.isAnimating) {
      animationFrameRef.current = requestAnimationFrame(() => {
        renderCanvas();
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationState.isAnimating, renderCanvas]);

  // Update canvas size on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, []);

  return (
    <div className={`car-simulation ${className}`}>
      {/* Canvas for animation */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{ background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)' }}
        />

        {/* Speed display overlay */}
        {animationState.isAnimating && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm">
              <div className="flex items-center mb-1">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                <span className="font-medium">{Math.round(animationState.speed)} km/h</span>
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
            variant={isSimulating ? 'danger' : 'primary'}
            size="lg"
            onClick={isSimulating ? stopSimulation : startSimulation}
            disabled={components.length === 0}
            icon={isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          >
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
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
        <GlassCard variant="danger" className="p-4 mb-4">
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
              <div className="text-2xl font-bold text-white">{simulationResult.score}/100</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div
                className={`text-2xl font-bold ${
                  simulationResult.passed ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {simulationResult.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg text-gray-300 mb-2">
              Performance Grade:{' '}
              <span className="font-bold text-white">
                {simulationResult.score >= 90
                  ? 'A'
                  : simulationResult.score >= 80
                    ? 'B'
                    : simulationResult.score >= 70
                      ? 'C'
                      : simulationResult.score >= 60
                        ? 'D'
                        : 'F'}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Duration: {simulationResult.duration.toFixed(1)}s | Average Speed:{' '}
              {Math.round(simulationResult.averageSpeed)} km/h
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
