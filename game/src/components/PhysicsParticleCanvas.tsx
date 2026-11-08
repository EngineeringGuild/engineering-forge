import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { ParticleSystem, type SparkOptions } from '../physics/engine/ParticleSystem';

export interface PhysicsParticleCanvasHandle {
  emitSparks: (x: number, y: number, count?: number, options?: SparkOptions) => void;
  emitFracture: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    materialColor?: string,
    count?: number,
  ) => void;
  emitStressPuff: (x: number, y: number, intensity?: number) => void;
  emitTireSmoke: (x: number, y: number, slipRatio?: number) => void;
  clear: () => void;
}

export interface PhysicsParticleCanvasProps {
  className?: string;
  active?: boolean;
}

export const PhysicsParticleCanvas = forwardRef<
  PhysicsParticleCanvasHandle,
  PhysicsParticleCanvasProps
>(function PhysicsParticleCanvas({ className = '', active = true }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const systemRef = useRef<ParticleSystem>(new ParticleSystem());
  const animIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      emitSparks: (x, y, count, options) => {
        if (!active) return;
        systemRef.current.emitSparks(x, y, count, options);
      },
      emitFracture: (x1, y1, x2, y2, materialColor, count) => {
        if (!active) return;
        systemRef.current.emitFracture(x1, y1, x2, y2, materialColor, count);
      },
      emitStressPuff: (x, y, intensity) => {
        if (!active) return;
        systemRef.current.emitStressPuff(x, y, intensity);
      },
      emitTireSmoke: (x, y, slipRatio) => {
        if (!active) return;
        systemRef.current.emitTireSmoke(x, y, slipRatio);
      },
      clear: () => {
        systemRef.current.clear();
      },
    }),
    [active],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const frame = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const system = systemRef.current;
      system.update(dt);

      ctx.clearRect(0, 0, width, height);
      if (system.getParticleCount() > 0) {
        system.render(ctx);
      }

      animIdRef.current = requestAnimationFrame(frame);
    };

    animIdRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-20 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
});
