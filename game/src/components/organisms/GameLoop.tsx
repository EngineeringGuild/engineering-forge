import React, { useEffect, useRef } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';

export interface GameLoopProps {
  onFixedUpdate?: (deltaTime: number, currentStep: number) => void;
  onRenderUpdate?: (alpha: number) => void;
  children?: React.ReactNode;
}

/**
 * Organism GameLoop:
 * Drives game simulation timing using requestAnimationFrame.
 * Implements a fixed-timestep accumulator pattern to ensure deterministic
 * physics integration decoupled from visual frame rendering rates.
 */
export const GameLoop: React.FC<GameLoopProps> = ({
  onFixedUpdate,
  onRenderUpdate,
  children,
}) => {
  const isSimulating = usePhysicsStore((s) => s.isSimulating);
  const isPaused = usePhysicsStore((s) => s.isPaused);
  const timeStep = usePhysicsStore((s) => s.timeStep);
  const timeScale = usePhysicsStore((s) => s.timeScale);
  const stepSimulationOnce = usePhysicsStore((s) => s.stepSimulationOnce);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    const loop = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      const frameDeltaSeconds = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      if (isSimulating && !isPaused) {
        accumulatorRef.current += frameDeltaSeconds * timeScale;

        // Fixed timestep integration loop
        while (accumulatorRef.current >= timeStep) {
          stepSimulationOnce();
          const currentStep = usePhysicsStore.getState().currentStepIndex;
          onFixedUpdate?.(timeStep, currentStep);
          accumulatorRef.current -= timeStep;
        }

        // Interpolation alpha for smooth rendering between physics steps: [0.0, 1.0]
        const alpha = accumulatorRef.current / timeStep;
        onRenderUpdate?.(alpha);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
    };
  }, [isSimulating, isPaused, timeStep, timeScale, stepSimulationOnce, onFixedUpdate, onRenderUpdate]);

  return <>{children}</>;
};
