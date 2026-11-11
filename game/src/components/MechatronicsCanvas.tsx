import { useMemo } from 'react';
import type { BasculeBridgeDeck, WinchMotor, LogicGate, LogicSignalMap } from '../physics/mechatronics';

interface MechatronicsCanvasProps {
  deck: BasculeBridgeDeck;
  winch: WinchMotor;
  bridgeAngleDeg: number;
  motorCurrentA: number;
  winchTensionKn: number;
  limitCutoffAngleDeg: number;
  limitSwitchTripped: boolean;
  relayClosed: boolean;
  isCableSnapped: boolean;
  isStalled: boolean;
  logicGates?: LogicGate[];
  logicSignals?: LogicSignalMap;
  onToggleInputSignal?: (signalId: string) => void;
  width?: number;
  height?: number;
}

export function MechatronicsCanvas({
  deck,
  winch,
  bridgeAngleDeg,
  motorCurrentA,
  winchTensionKn,
  limitCutoffAngleDeg,
  limitSwitchTripped,
  relayClosed,
  isCableSnapped,
  isStalled,
  logicGates = [],
  logicSignals = {},
  onToggleInputSignal,
  width = 800,
  height = 420,
}: MechatronicsCanvasProps) {
  // Geometry parameters
  const originX = 220;
  const originY = 320;
  const scale = 22; // pixels per meter
  const deckLengthPx = deck.lengthM * scale;
  const rad = (bridgeAngleDeg * Math.PI) / 180;

  // Deck tip coordinates
  const tipX = originX + deckLengthPx * Math.cos(rad);
  const tipY = originY - deckLengthPx * Math.sin(rad);

  // Counterweight position (opposite side of hinge)
  const cwArmPx = deck.lengthM * 0.25 * scale;
  const cwX = originX - cwArmPx * Math.cos(rad);
  const cwY = originY + cwArmPx * Math.sin(rad);

  // Winch tower pulley position
  const towerX = 140;
  const towerTopY = 80;

  // Tension color calculation
  const tensionRatio = Math.min(1, winchTensionKn / winch.maxCableTensionKn);
  const cableColor = isCableSnapped
    ? '#ef4444'
    : tensionRatio > 0.85
    ? '#ef4444'
    : tensionRatio > 0.5
    ? '#f59e0b'
    : '#10b981';

  // Truss web vertices along the deck
  const trussBays = 5;
  const trussHeight = 28;
  const trussMembers = useMemo(() => {
    const members: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const bayLen = deckLengthPx / trussBays;

    for (let i = 0; i <= trussBays; i++) {
      const bottomDist = i * bayLen;
      const bx = originX + bottomDist * Math.cos(rad);
      const by = originY - bottomDist * Math.sin(rad);

      // Normal vector perpendicular to deck
      const nx = -Math.sin(rad);
      const ny = -Math.cos(rad);

      const tx = bx + nx * trussHeight;
      const ty = by + ny * trussHeight;

      // Vertical member
      members.push({ x1: bx, y1: by, x2: tx, y2: ty });

      if (i > 0) {
        // Top chord
        const prevBottomDist = (i - 1) * bayLen;
        const prevBx = originX + prevBottomDist * Math.cos(rad);
        const prevBy = originY - prevBottomDist * Math.sin(rad);
        const prevTx = prevBx + nx * trussHeight;
        const prevTy = prevBy + ny * trussHeight;

        members.push({ x1: prevTx, y1: prevTy, x2: tx, y2: ty });
        // Diagonal
        members.push({ x1: prevBx, y1: prevBy, x2: tx, y2: ty });
      }
    }
    return members;
  }, [deckLengthPx, rad, originX, originY]);

  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 p-4 shadow-inner">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none rounded-lg bg-zinc-950 font-mono"
      >
        <defs>
          {/* Subtle grid */}
          <pattern id="mechaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" />
          </pattern>
          {/* Water gradient */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
          </linearGradient>
          {/* Winch drum glow */}
          <radialGradient id="winchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={relayClosed ? '#f97316' : '#52525b'} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="#09090b" />
        <rect width={width} height={height} fill="url(#mechaGrid)" />

        {/* Canal Water Area */}
        <rect x="220" y="325" width="480" height="95" fill="url(#waterGrad)" />
        <line x1="220" y1="325" x2="700" y2="325" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" />

        {/* Concrete Abutment Pier (Hinge Support) */}
        <polygon
          points={`180,${originY + 100} 180,${originY} 240,${originY} 260,${originY + 100}`}
          fill="#3f3f46"
          stroke="#71717a"
          strokeWidth="2"
        />
        {/* Right Canal Bank */}
        <polygon
          points={`680,${originY + 100} 680,${originY} ${width},${originY} ${width},${originY + 100}`}
          fill="#27272a"
          stroke="#52525b"
          strokeWidth="2"
        />

        {/* Winch Machinery Tower */}
        <line x1={towerX} y1={originY} x2={towerX} y2={towerTopY} stroke="#71717a" strokeWidth="6" />
        <line x1={towerX - 35} y1={originY} x2={towerX} y2={towerTopY} stroke="#52525b" strokeWidth="3" />
        <line x1={towerX + 25} y1={originY} x2={towerX} y2={towerTopY} stroke="#52525b" strokeWidth="3" />

        {/* Winch Motor Drum */}
        <circle cx={towerX} cy={towerTopY + 30} r="18" fill="url(#winchGlow)" stroke="#f97316" strokeWidth="2" />
        <circle cx={towerX} cy={towerTopY + 30} r="5" fill="#fafafa" />
        {relayClosed && (
          <circle
            cx={towerX}
            cy={towerTopY + 30}
            r="14"
            fill="none"
            stroke="#fb923c"
            strokeWidth="2"
            strokeDasharray="5 3"
            className="animate-spin"
            style={{ transformOrigin: `${towerX}px ${towerTopY + 30}px` }}
          />
        )}
        {/* Sheave Pulley at Top */}
        <circle cx={towerX} cy={towerTopY} r="10" fill="#27272a" stroke="#d4d4d8" strokeWidth="2" />
        <circle cx={towerX} cy={towerTopY} r="3" fill="#ffffff" />

        {/* Counterweight Block on Short Arm */}
        <line x1={originX} y1={originY} x2={cwX} y2={cwY} stroke="#71717a" strokeWidth="7" />
        <rect
          x={cwX - 22}
          y={cwY - 18}
          width="44"
          height="36"
          rx="4"
          fill="#18181b"
          stroke="#a1a1aa"
          strokeWidth="2"
        />
        <text
          x={cwX}
          y={cwY + 4}
          fill="#e4e4e7"
          fontSize="9"
          textAnchor="middle"
          fontWeight="bold"
        >
          {deck.counterweightKg}kg
        </text>

        {/* Target Angle Arc Guide */}
        <path
          d={`M ${originX + 160} ${originY} A 160 160 0 0 0 ${originX + 160 * Math.cos((deck.targetOpenAngleDeg * Math.PI) / 180)} ${originY - 160 * Math.sin((deck.targetOpenAngleDeg * Math.PI) / 180)}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={originX + 175 * Math.cos(((deck.targetOpenAngleDeg / 2) * Math.PI) / 180)}
          y={originY - 175 * Math.sin(((deck.targetOpenAngleDeg / 2) * Math.PI) / 180)}
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
        >
          Target: {deck.targetOpenAngleDeg}°
        </text>

        {/* Truss Deck Members */}
        {trussMembers.map((m, idx) => (
          <line
            key={`tm-${idx}`}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke="#f97316"
            strokeWidth="2.5"
          />
        ))}

        {/* Deck Roadway Slab */}
        <line
          x1={originX}
          y1={originY}
          x2={tipX}
          y2={tipY}
          stroke="#e4e4e7"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Winch Cable line from Pulley to Deck Tip */}
        {!isCableSnapped ? (
          <line
            x1={towerX}
            y1={towerTopY}
            x2={tipX}
            y2={tipY}
            stroke={cableColor}
            strokeWidth={tensionRatio > 0.85 ? '3' : '2'}
            strokeDasharray={relayClosed ? '8 3' : 'none'}
          />
        ) : (
          <g>
            <line
              x1={towerX}
              y1={towerTopY}
              x2={(towerX + tipX) / 2 - 10}
              y2={(towerTopY + tipY) / 2 + 30}
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            <text
              x={(towerX + tipX) / 2}
              y={(towerTopY + tipY) / 2 + 10}
              fill="#ef4444"
              fontSize="12"
              fontWeight="bold"
            >
              ⚡ CABLE SNAPPED!
            </text>
          </g>
        )}

        {/* Main Hinge Pin Bearing */}
        <circle cx={originX} cy={originY} r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx={originX} cy={originY} r="4" fill="#18181b" />

        {/* Limit Switch Indicator near Hinge */}
        <g transform={`translate(${originX - 35}, ${originY - 45})`}>
          <rect
            x="0"
            y="0"
            width="26"
            height="18"
            rx="3"
            fill={limitSwitchTripped ? '#ef4444' : '#10b981'}
            stroke="#ffffff"
            strokeWidth="1"
          />
          <text x="13" y="12" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">
            {limitSwitchTripped ? 'TRIP' : 'SW'}
          </text>
        </g>

        {/* Relay Unit Indicator */}
        <g transform={`translate(${towerX - 45}, ${originY - 35})`}>
          <rect
            x="0"
            y="0"
            width="32"
            height="22"
            rx="4"
            fill="#18181b"
            stroke={relayClosed ? '#10b981' : '#71717a'}
            strokeWidth="1.5"
          />
          <text
            x="16"
            y="14"
            fill={relayClosed ? '#10b981' : '#a1a1aa'}
            fontSize="8"
            textAnchor="middle"
            fontWeight="bold"
          >
            {relayClosed ? 'RELAY ON' : 'RELAY OFF'}
          </text>
        </g>

        {/* Digital Logic Gate Panel Overlay (when logic gates exist) */}
        {logicGates.length > 0 && (
          <g transform="translate(480, 25)">
            <rect
              x="0"
              y="0"
              width="300"
              height={Math.max(120, logicGates.length * 40 + 60)}
              rx="8"
              fill="#18181b"
              fillOpacity="0.92"
              stroke="#3f3f46"
              strokeWidth="1.5"
            />
            <text x="14" y="20" fill="#38bdf8" fontSize="11" fontWeight="bold">
              LOGIC INTERLOCK CONTROLLER
            </text>

            {/* Inputs */}
            {Object.entries(logicSignals).map(([sigId, val], idx) => (
              <g
                key={`sig-${sigId}`}
                transform={`translate(14, ${35 + idx * 24})`}
                className="cursor-pointer"
                onClick={() => onToggleInputSignal?.(sigId)}
              >
                <circle cx="8" cy="8" r="6" fill={val ? '#22c55e' : '#ef4444'} />
                <text x="20" y="11" fill="#e4e4e7" fontSize="10">
                  {sigId}: <tspan fontWeight="bold" fill={val ? '#86efac' : '#fca5a5'}>{val ? 'TRUE' : 'FALSE'}</tspan>
                </text>
              </g>
            ))}

            {/* Gates */}
            {logicGates.map((g, idx) => (
              <g key={g.id} transform={`translate(160, ${35 + idx * 30})`}>
                <rect
                  x="0"
                  y="0"
                  width="54"
                  height="22"
                  rx="4"
                  fill="#27272a"
                  stroke="#60a5fa"
                  strokeWidth="1"
                />
                <text x="27" y="15" fill="#93c5fd" fontSize="9" textAnchor="middle" fontWeight="bold">
                  {g.type}
                </text>
                <text x="62" y="15" fill="#a1a1aa" fontSize="9">
                  → {g.output}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Real-time Status Overlay HUD */}
        <g transform="translate(18, 20)">
          <rect
            x="0"
            y="0"
            width="200"
            height="115"
            rx="6"
            fill="#09090b"
            fillOpacity="0.85"
            stroke="#27272a"
            strokeWidth="1"
          />
          <text x="12" y="20" fill="#a1a1aa" fontSize="10" fontWeight="bold">
            TELEM // KINEMATICS
          </text>
          <text x="12" y="40" fill="#ffffff" fontSize="12" fontWeight="bold">
            Deck Angle: <tspan fill={bridgeAngleDeg >= deck.targetOpenAngleDeg ? '#4ade80' : '#f97316'}>{bridgeAngleDeg.toFixed(1)}°</tspan> / {deck.targetOpenAngleDeg}°
          </text>
          <text x="12" y="58" fill="#e4e4e7" fontSize="11">
            Cable Tension: <tspan fill={cableColor} fontWeight="bold">{winchTensionKn.toFixed(1)} kN</tspan> (max {winch.maxCableTensionKn}kN)
          </text>
          <text x="12" y="76" fill="#e4e4e7" fontSize="11">
            Motor Current: <tspan fill={motorCurrentA > 150 ? '#ef4444' : '#60a5fa'} fontWeight="bold">{motorCurrentA.toFixed(1)} A</tspan>
          </text>
          <text x="12" y="94" fill="#a1a1aa" fontSize="10">
            Cutoff Switch: <tspan fill={limitSwitchTripped ? '#ef4444' : '#10b981'}>{limitSwitchTripped ? 'TRIPPED (OPEN)' : `ARMED (<${limitCutoffAngleDeg}°)`}</tspan>
          </text>
          {isStalled && (
            <text x="12" y="110" fill="#ef4444" fontSize="10" fontWeight="bold">
              ⚠️ MOTOR STALLED (TORQUE DEFICIT)
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
