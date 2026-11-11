import React, { useState, useMemo } from 'react';
import {
  calculateGarageVehicleMetrics,
  type CustomVehicleConfig,
} from '../physics/garageVehicle';
import { soundFx } from '../audio/soundFx';

interface GarageCustomizerModalProps {
  onClose: () => void;
}

export const GarageCustomizerModal: React.FC<GarageCustomizerModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState<CustomVehicleConfig>({
    id: 'veh-custom-spec',
    name: 'Protótipo Forja GT',
    chassisType: 'tubular',
    chassisMassKg: 950,
    wheelbaseMeters: 2.6,
    chassisLengthMeters: 4.1,
    engineId: 'engine-turbo',
    engineForceNewtons: 4500,
    cogOffsetRatio: 0.0,
    suspensionStiffnessNPerM: 38000,
    suspensionDampingRatio: 0.65,
    tireCompound: 'racing_slicks',
    tireFrictionMu: 1.05,
    payloadMassKg: 150,
  });

  const metrics = useMemo(() => calculateGarageVehicleMetrics(config), [config]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-amber-500/60 rounded-xl max-w-5xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-amber-300 uppercase">
                Garagem do Inventor & Bancada Dinâmica de Chassis
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calibração de Centro de Gravidade (CoG), Suspensão e Teto de Atrito de Coulomb (DOC-10)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800/80 hover:bg-slate-700 rounded text-sm transition-colors"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content Body: Tuner Sliders & Visual Chassis Blueprint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 overflow-y-auto pr-2">
          {/* Left Column: Interactive Parametric Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Parâmetros Construtivos & Calibração
            </h3>

            {/* CoG Offset Slider */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Distribuição de Centro de Massa (CoG)</span>
                <span className="text-amber-400 font-bold">
                  {config.cogOffsetRatio < 0
                    ? `${Math.abs(Math.round(config.cogOffsetRatio * 100))}% Traseiro`
                    : config.cogOffsetRatio > 0
                    ? `${Math.round(config.cogOffsetRatio * 100)}% Dianteiro`
                    : 'Neutro (50/50)'}
                </span>
              </div>
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.05"
                value={config.cogOffsetRatio}
                onChange={(e) => {
                  soundFx.playSubtleHover();
                  setConfig({ ...config, cogOffsetRatio: parseFloat(e.target.value) });
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Traseiro (-30%)</span>
                <span>Neutro (0)</span>
                <span>Dianteiro (+30%)</span>
              </div>
            </div>

            {/* Tire Friction Coefficient Slider */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Composto de Pneus (Atrito de Coulomb μ)</span>
                <span className="text-cyan-400 font-bold">μ = {config.tireFrictionMu.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.65"
                max="1.25"
                step="0.05"
                value={config.tireFrictionMu}
                onChange={(e) => {
                  soundFx.playSubtleHover();
                  setConfig({ ...config, tireFrictionMu: parseFloat(e.target.value) });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Urbano Standard (0.65)</span>
                <span>All-Terrain (0.90)</span>
                <span>Slicks Competição (1.25)</span>
              </div>
            </div>

            {/* Suspension Stiffness Slider */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Rigidez da Suspensão (k)</span>
                <span className="text-emerald-400 font-bold">
                  {(config.suspensionStiffnessNPerM / 1000).toFixed(1)} kN/m
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="75000"
                step="2500"
                value={config.suspensionStiffnessNPerM}
                onChange={(e) => {
                  soundFx.playSubtleHover();
                  setConfig({ ...config, suspensionStiffnessNPerM: parseFloat(e.target.value) });
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Engine Thrust Slider */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Empuxo Nominal do Motor (Thrust)</span>
                <span className="text-white font-bold">{config.engineForceNewtons} N</span>
              </div>
              <input
                type="range"
                min="1500"
                max="8000"
                step="250"
                value={config.engineForceNewtons}
                onChange={(e) => {
                  soundFx.playSubtleHover();
                  setConfig({ ...config, engineForceNewtons: parseFloat(e.target.value) });
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Dynamic Schematic & Physics Telemetry */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Esquema Biomecânico & Centro de Gravidade
            </h3>

            {/* SVG Visual Chassis Representation */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative h-52">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* Ground */}
                <line x1="10" y1="105" x2="290" y2="105" stroke="#334155" strokeWidth="2" />

                {/* Chassis body */}
                <rect x="40" y="55" width="220" height="24" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <polygon points="90,55 125,25 200,25 230,55" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />

                {/* Wheels (Rear at x=60, Front at x=240, Distance = 180px) */}
                <circle cx="60" cy="90" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
                <circle cx="240" cy="90" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />

                {/* CoG Crosshair Indicator (moves dynamically with cogOffsetRatio) */}
                {(() => {
                  const cogPixelX = 150 + config.cogOffsetRatio * 90;
                  return (
                    <g>
                      <circle cx={cogPixelX} cy="65" r="7" fill="#ef4444" opacity="0.85" />
                      <line x1={cogPixelX - 11} y1="65" x2={cogPixelX + 11} y2="65" stroke="#ffffff" strokeWidth="2" />
                      <line x1={cogPixelX} y1="54" x2={cogPixelX} y2="76" stroke="#ffffff" strokeWidth="2" />
                      <text x={cogPixelX} y="48" font-family="monospace" font-size="9" fill="#f87171" font-weight="bold" text-anchor="middle">
                        CoG
                      </text>
                    </g>
                  );
                })()}
              </svg>

              <div className="text-[10px] font-mono text-slate-400 mt-2">
                Eixo Traseiro: {metrics.normalForceRearN} N • Eixo Dianteiro: {metrics.normalForceFrontN} N
              </div>
            </div>

            {/* Calculated Performance Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Aceleração Máxima</span>
                <span className="text-base font-bold text-cyan-400">{metrics.accelerationMaxMs2} m/s²</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Rampa Máxima</span>
                <span className="text-base font-bold text-amber-400">{metrics.maxClimbableSlopeDeg}°</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Velocidade Final Est.</span>
                <span className="text-base font-bold text-emerald-400">{metrics.topSpeedEstimateMs} m/s</span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Freq. Natural Suspensão</span>
                <span className="text-base font-bold text-slate-200">{metrics.suspensionNaturalFrequencyHz} Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
