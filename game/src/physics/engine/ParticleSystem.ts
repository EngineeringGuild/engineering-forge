/**
 * Engineering Forge - Physics Simulation Particle System
 * High-performance 2D canvas particle engine for visual simulation feedback:
 * - Electrical arc sparks (short-circuits, blown components, contact arcs)
 * - Structural fracture debris & stress dust (truss member snaps, high tension)
 * - Kinetic friction smoke & tire sparks (wheel slip, high torque)
 */

export type ParticleType = 'spark' | 'fracture' | 'dust' | 'smoke';

export interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  alpha: number;
  decay: number; // alpha loss per second
  life: number;  // 0 to 1
  rotation: number;
  rotationSpeed: number;
  gravity: number; // px/s^2
  drag: number;    // air resistance factor
}

export interface SparkOptions {
  color?: string;
  speed?: number;
  count?: number;
  spreadAngle?: number;
}

const SPARK_PALETTE = ['#ffffff', '#fff275', '#ff9f1c', '#00f0ff', '#ffe600'];
const DUST_PALETTE = ['#a0aab2', '#788393', '#c5d1db'];

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId = 0;
  private maxParticles = 600;

  /**
   * Spawns high-voltage electrical arc sparks radiating from a point (e.g., short-circuit or blown fuse).
   */
  public emitSparks(
    x: number,
    y: number,
    count: number = 18,
    options: SparkOptions = {},
  ): void {
    const baseSpeed = options.speed ?? 180;
    const color = options.color;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = options.spreadAngle !== undefined
        ? options.spreadAngle + (Math.random() - 0.5) * 1.2
        : Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.4 + Math.random() * 0.9);

      this.particles.push({
        id: this.nextId++,
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.5,
        maxSize: 3,
        color: color ?? SPARK_PALETTE[Math.floor(Math.random() * SPARK_PALETTE.length)],
        alpha: 1.0,
        decay: Math.random() * 2.5 + 1.8,
        life: 1.0,
        rotation: angle,
        rotationSpeed: 0,
        gravity: 120, // downward pull on hot sparks
        drag: 0.92,
      });
    }
  }

  /**
   * Spawns physical structural fracture debris along a ruptured member line.
   */
  public emitFracture(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    materialColor: string = '#ef4444',
    count: number = 24,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      // Position particle randomly along the beam axis
      const t = Math.random();
      const px = x1 + dx * t;
      const py = y1 + dy * t;

      // Burst velocity primarily perpendicular to beam line plus scatter
      const burstSpeed = Math.random() * 160 + 60;
      const side = Math.random() > 0.5 ? 1 : -1;
      const vx = normalX * burstSpeed * side + (Math.random() - 0.5) * 60;
      const vy = normalY * burstSpeed * side + (Math.random() - 0.5) * 60 - 40; // slight upward bias

      this.particles.push({
        id: this.nextId++,
        type: 'fracture',
        x: px,
        y: py,
        vx,
        vy,
        size: Math.random() * 4 + 2,
        maxSize: 6,
        color: Math.random() > 0.3 ? materialColor : '#e2e8f0',
        alpha: 1.0,
        decay: Math.random() * 1.0 + 0.6,
        life: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 280, // realistic structural gravity acceleration
        drag: 0.96,
      });
    }
  }

  /**
   * Spawns stress dust puffs when a joint or beam is under extreme utilization (>85%).
   */
  public emitStressPuff(x: number, y: number, intensity: number = 1): void {
    const count = Math.min(8, Math.max(2, Math.round(intensity * 4)));
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 25 + 10) * intensity;

      this.particles.push({
        id: this.nextId++,
        type: 'dust',
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15, // rises gently
        size: Math.random() * 3 + 2,
        maxSize: 7,
        color: DUST_PALETTE[Math.floor(Math.random() * DUST_PALETTE.length)],
        alpha: 0.7,
        decay: Math.random() * 1.5 + 1.0,
        life: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        gravity: -10, // thermal buoyancy
        drag: 0.90,
      });
    }
  }

  /**
   * Spawns friction smoke and contact sparks at tire/surface interface during wheel slip.
   */
  public emitTireSmoke(x: number, y: number, slipRatio: number = 0.5): void {
    const smokeCount = Math.min(5, Math.max(1, Math.round(slipRatio * 4)));
    for (let i = 0; i < smokeCount; i++) {
      if (this.particles.length >= this.maxParticles) break;

      this.particles.push({
        id: this.nextId++,
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 8,
        y: y + Math.random() * 4,
        vx: -(Math.random() * 30 + 15),
        vy: -(Math.random() * 25 + 10),
        size: Math.random() * 4 + 3,
        maxSize: 14,
        color: 'rgba(200, 210, 220, 0.6)',
        alpha: 0.65,
        decay: Math.random() * 0.9 + 0.6,
        life: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3,
        gravity: -15, // buoyant smoke rises
        drag: 0.94,
      });
    }

    // Occasional hot tire spark during heavy slip
    if (slipRatio > 0.6 && Math.random() > 0.4) {
      this.emitSparks(x, y, 3, { color: '#ff9900', speed: 90 });
    }
  }

  /**
   * Advances all particles by delta time dt (in seconds).
   */
  public update(dt: number): void {
    const clampedDt = Math.min(0.1, Math.max(0.001, dt));

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics integration
      p.vy += p.gravity * clampedDt;
      p.vx *= Math.pow(p.drag, clampedDt * 60);
      p.vy *= Math.pow(p.drag, clampedDt * 60);

      p.x += p.vx * clampedDt;
      p.y += p.vy * clampedDt;
      p.rotation += p.rotationSpeed * clampedDt;

      // Expand smoke / dust
      if (p.type === 'smoke' || p.type === 'dust') {
        p.size = Math.min(p.maxSize, p.size + clampedDt * 6);
      }

      // Life decay
      p.alpha -= p.decay * clampedDt;
      p.life = Math.max(0, p.alpha);

      if (p.alpha <= 0.01) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Renders active particles onto HTML5 canvas context.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'spark') {
        // High-energy glowing spark with elongated streak
        const speed = Math.hypot(p.vx, p.vy);
        const streakLength = Math.min(12, Math.max(p.size, speed * 0.035));

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.ellipse(0, 0, streakLength, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'fracture') {
        // Jagged physical debris shard
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 3;

        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.5);
        ctx.lineTo(p.size * 0.8, -p.size * 0.8);
        ctx.lineTo(p.size * 0.4, p.size);
        ctx.lineTo(-p.size * 0.7, p.size * 0.6);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'dust' || p.type === 'smoke') {
        // Soft diffuse particulate cloud
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public clear(): void {
    this.particles = [];
  }
}
