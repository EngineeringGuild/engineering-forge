import { useEffect, useRef } from 'react';

export interface AchievementCelebrationProps {
  /** Triggered star count (1 to 3) or pass confirmation */
  stars?: number;
  /** Duration before particle generation ceases in ms */
  durationMs?: number;
  /** Whether the celebration overlay is active */
  active?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  type: 'confetti' | 'star' | 'sparkle';
  aspectRatio: number;
}

const CELEBRATION_PALETTE = [
  '#f59e0b', // Amber / Gold
  '#3b82f6', // Electric Blue
  '#10b981', // Emerald Success
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#ffffff', // Sparkle white
];

export function AchievementCelebration({
  stars = 3,
  durationMs = 3500,
  active = true,
}: AchievementCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();
    const particles: Particle[] = [];

    // Resize canvas to full window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial starburst explosion from center-top
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.42;

    const particleCount = Math.min(180, 75 + stars * 35);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 9 + 4;
      const type: 'confetti' | 'star' | 'sparkle' =
        Math.random() > 0.4 ? 'confetti' : Math.random() > 0.5 ? 'star' : 'sparkle';

      particles.push({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.6) - 3.5, // Initial upward velocity bias
        size: type === 'confetti' ? Math.random() * 7 + 5 : Math.random() * 6 + 4,
        color: CELEBRATION_PALETTE[Math.floor(Math.random() * CELEBRATION_PALETTE.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: Math.random() * 0.006 + 0.005,
        type,
        aspectRatio: type === 'confetti' ? Math.random() * 1.5 + 0.5 : 1,
      });
    }

    // Secondary side cannons for 3-star high achievement
    if (stars >= 3) {
      for (let i = 0; i < 40; i++) {
        // Left cannon
        particles.push({
          x: 40,
          y: canvas.height * 0.8,
          vx: Math.random() * 8 + 6,
          vy: -(Math.random() * 9 + 6),
          size: Math.random() * 6 + 4,
          color: CELEBRATION_PALETTE[Math.floor(Math.random() * CELEBRATION_PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          decay: Math.random() * 0.007 + 0.005,
          type: 'confetti',
          aspectRatio: Math.random() * 1.5 + 0.5,
        });
        // Right cannon
        particles.push({
          x: canvas.width - 40,
          y: canvas.height * 0.8,
          vx: -(Math.random() * 8 + 6),
          vy: -(Math.random() * 9 + 6),
          size: Math.random() * 6 + 4,
          color: CELEBRATION_PALETTE[Math.floor(Math.random() * CELEBRATION_PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          decay: Math.random() * 0.007 + 0.005,
          type: 'confetti',
          aspectRatio: Math.random() * 1.5 + 0.5,
        });
      }
    }

    // Helper to draw a 5-pointed star
    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    };

    const render = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.01) continue;

        aliveCount++;

        // Physics: drag, gravity, rotation
        p.vx *= 0.985;
        p.vy += 0.22; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.type === 'confetti') {
          ctx.fillRect(
            -p.size / 2,
            (-p.size * p.aspectRatio) / 2,
            p.size,
            p.size * p.aspectRatio,
          );
        } else if (p.type === 'star') {
          drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
        } else {
          // Sparkle circular glint
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0 && elapsed < durationMs) {
        animIdRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current !== null) {
        cancelAnimationFrame(animIdRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [active, stars, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}
