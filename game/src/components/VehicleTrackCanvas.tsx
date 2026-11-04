import { useEffect, useRef, useState } from 'react';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import type { VehicleTestResult } from '../state/vehicleStore';
import { soundFx } from '../audio/soundFx';

interface Props {
  level: VehicleLevelDef;
  selectedEngineId: string;
  selectedChassisId: string;
  testResult: VehicleTestResult | null;
  isSimulating: boolean;
  onSimulationFinish?: () => void;
}

export function VehicleTrackCanvas({
  level,
  selectedEngineId: _selectedEngineId,
  selectedChassisId,
  testResult,
  isSimulating,
  onSimulationFinish,
}: Props) {
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1
  const [animSpeed, setAnimSpeed] = useState(0); // m/s
  const [wheelRotation, setWheelRotation] = useState(0); // degrees
  const soundTriggeredRef = useRef<{ rev: boolean; screech: boolean }>({ rev: false, screech: false });
  const animIdRef = useRef<number>(0);
  const startTimestampRef = useRef<number | null>(null);

  const finalSpeed = testResult?.analysis.finalSpeed ?? 0;
  const isStalled = testResult?.analysis.stalled ?? false;
  const isTractionLimited = testResult?.analysis.tractionLimited ?? false;
  const incline = level.inclineDegrees ?? 0;

  useEffect(() => {
    if (!isSimulating) {
      soundTriggeredRef.current = { rev: false, screech: false };
      startTimestampRef.current = null;
      return;
    }

    // Run dynamic test drive animation
    const duration = isStalled ? 1500 : 2600;
    startTimestampRef.current = null;

    const frame = (timestamp: number) => {
      if (startTimestampRef.current === null) startTimestampRef.current = timestamp;
      const elapsed = timestamp - startTimestampRef.current;
      const p = Math.min(1, elapsed / duration);

      if (isStalled) {
        // Stalls and rolls back or stops
        const stalledP = Math.min(0.12, p * 0.15);
        setAnimProgress(stalledP);
        setAnimSpeed(0);
      } else {
        // Quadratic acceleration motion: s(t) ~ t^2
        const accelP = Math.pow(p, 1.6);
        setAnimProgress(accelP);
        setAnimSpeed(accelP * finalSpeed);
        setWheelRotation((r) => (r + 14 * p) % 360);

        if (!soundTriggeredRef.current.rev) {
          soundFx.playEngineRev(Math.min(1, finalSpeed / (level.targetSpeed || 30)));
          soundTriggeredRef.current.rev = true;
        }

        if (isTractionLimited && !soundTriggeredRef.current.screech && p > 0.2) {
          soundFx.playTireScreech();
          soundTriggeredRef.current.screech = true;
        }
      }

      if (p < 1) {
        animIdRef.current = requestAnimationFrame(frame);
      } else {
        if (onSimulationFinish) {
          onSimulationFinish();
        }
      }
    };

    animIdRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [isSimulating, testResult, finalSpeed, isStalled, isTractionLimited, level.targetSpeed, onSimulationFinish]);

  const progress = isSimulating ? animProgress : (testResult ? 1 : 0);
  const currentSpeed = isSimulating ? animSpeed : (testResult ? finalSpeed : 0);

  // Viewbox coordinates: track runs from 0 to 600, y from 0 to 220
  const trackStartX = 60;
  const trackEndX = 540;
  const trackY = incline > 0 ? 160 - Math.tan((incline * Math.PI) / 180) * 120 : 160;
  const carX = trackStartX + progress * (trackEndX - trackStartX);
  const carY = 160 - (carX - trackStartX) * Math.tan((incline * Math.PI) / 180);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface-1 p-3">
      {/* Dynamic Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/60 border border-border/60 px-4 py-2 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-fg-muted">
            Speed:{' '}
            <strong className="text-base text-accent">
              {currentSpeed.toFixed(1)} <span className="text-xs">m/s</span>
            </strong>
          </span>
          <span className="text-fg-subtle">
            (Target: {level.targetSpeed} m/s{level.maxSpeed ? ` - ${level.maxSpeed} m/s` : ''})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isTractionLimited && (
            <span className="rounded bg-warning/20 text-warning px-2 py-0.5 border border-warning/40">
              ⚠️ Traction Slip
            </span>
          )}
          {isStalled && (
            <span className="rounded bg-danger/20 text-danger px-2 py-0.5 border border-danger/40">
              ⛔ Stalled
            </span>
          )}
          {incline > 0 && (
            <span className="text-fg-muted">
              Slope: <strong className="text-fg">{incline}°</strong>
            </span>
          )}
        </div>
      </div>

      <svg viewBox="0 0 600 210" className="w-full h-48 select-none touch-none">
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--border)" />
            <stop offset="100%" stopColor="var(--surface-2)" />
          </linearGradient>
          <pattern id="checkers" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#ffffff" />
            <rect x="4" width="4" height="4" fill="#000000" />
            <rect y="4" width="4" height="4" fill="#000000" />
            <rect x="4" y="4" height="4" fill="#ffffff" />
          </pattern>
        </defs>

        {/* Sky / Grid Background */}
        <line x1="0" y1="185" x2="600" y2="185" stroke="var(--border)" strokeWidth="1" strokeDasharray="6 6" />

        {/* Runway track base with incline angle */}
        <polygon
          points={`40,175 ${trackEndX + 30},${trackY + 15} ${trackEndX + 30},205 40,205`}
          fill="url(#trackGrad)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Runway asphalt strip */}
        <line
          x1={trackStartX - 10}
          y1={160}
          x2={trackEndX + 10}
          y2={trackY}
          stroke="var(--fg-subtle)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Distance interval markers */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const mx = trackStartX + pct * (trackEndX - trackStartX);
          const my = 160 - (mx - trackStartX) * Math.tan((incline * Math.PI) / 180);
          const dist = Math.round(pct * level.distance);
          return (
            <g key={idx}>
              <line x1={mx} y1={my - 4} x2={mx} y2={my + 8} stroke="var(--border)" strokeWidth="1.5" />
              <text x={mx} y={my + 22} fontSize="9" fontFamily="monospace" fill="var(--fg-subtle)" textAnchor="middle">
                {dist}m
              </text>
            </g>
          );
        })}

        {/* Start Line */}
        <line x1={trackStartX} y1={140} x2={trackStartX} y2={175} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />

        {/* Finish Line Checkered Banner */}
        <g transform={`translate(${trackEndX}, ${trackY - 35})`}>
          <rect x="-4" y="0" width="8" height="35" fill="url(#checkers)" stroke="var(--border)" strokeWidth="1" />
          <polygon points="4,0 18,6 4,12" fill="var(--accent)" />
          <text x="0" y="-4" fontSize="8" fontFamily="monospace" fill="var(--fg)" fontWeight="bold" textAnchor="middle">
            FINISH
          </text>
        </g>

        {/* Vehicle Sprite */}
        <g transform={`translate(${carX}, ${carY - 18}) rotate(${-incline})`}>
          {/* Tire traction slip smoke puff */}
          {isTractionLimited && isSimulating && (
            <g transform="translate(-24, 10)">
              <circle r="6" fill="var(--fg-muted)" opacity="0.4" className="animate-ping" />
              <circle r="4" fill="var(--fg-subtle)" opacity="0.6" />
            </g>
          )}

          {/* Engine Exhaust Pipe & Flame */}
          <rect x="-24" y="2" width="6" height="4" rx="1" fill="var(--fg-subtle)" />
          {isSimulating && (
            <polygon points="-24,3 -32,4 -24,5" fill="var(--accent)" className="animate-pulse" />
          )}

          {/* Vehicle Body Chassis */}
          <rect
            x="-20"
            y="-8"
            width="44"
            height="16"
            rx="4"
            fill={selectedChassisId.includes('heavy') ? 'var(--fg-subtle)' : 'var(--accent)'}
            stroke="var(--fg)"
            strokeWidth="1.5"
          />

          {/* Windshield / Cockpit */}
          <polygon
            points="0,-8 10,-8 18,0 -4,0"
            fill="var(--info)"
            opacity="0.8"
          />

          {/* Payload Crate */}
          {Boolean(level.payloadMass) && (
            <g transform="translate(-16, -18)">
              <rect width="16" height="10" rx="1.5" fill="#8d6e63" stroke="#5d4037" strokeWidth="1" />
              <line x1="0" y1="0" x2="16" y2="10" stroke="#5d4037" strokeWidth="0.8" />
              <text x="8" y="7" fontSize="5" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                {level.payloadMass}kg
              </text>
            </g>
          )}

          {/* Rear Wheel */}
          <g transform={`translate(-10, 8) rotate(${wheelRotation})`}>
            <circle r="6.5" fill="var(--surface-1)" stroke="var(--fg)" strokeWidth="1.5" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--fg-muted)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--fg-muted)" strokeWidth="1" />
          </g>

          {/* Front Wheel */}
          <g transform={`translate(16, 8) rotate(${wheelRotation})`}>
            <circle r="6.5" fill="var(--surface-1)" stroke="var(--fg)" strokeWidth="1.5" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--fg-muted)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--fg-muted)" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
