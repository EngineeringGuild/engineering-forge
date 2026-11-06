import { useState, useEffect, useMemo, useCallback } from 'react';
import { physicsMediator, type BeamTestBenchState } from '../physics/engine/PhysicsMediator';
import { getStressHeatmapRgb } from '../physics/heatmap';
import { calculatePacejkaTraction } from '../physics/vehicle';
import { PhysicsPerformanceMonitor } from './PhysicsPerformanceMonitor';

export function MaterialTestBench() {
  const [benchMode, setBenchMode] = useState<'beam_bending' | 'euler_buckling' | 'tire_pacejka'>('beam_bending');
  const [bucklingLoadKn, setBucklingLoadKn] = useState(50);
  const [bucklingLengthM, setBucklingLengthM] = useState(4.0);
  const [tireSlipRatio, setTireSlipRatio] = useState(0.15);
  const [tireNormalKn, setTireNormalKn] = useState(8.0);

  const [benchState, setBenchState] = useState<BeamTestBenchState>(
    physicsMediator.getTestBenchState(),
  );

  // Subscribe to mediator updates to guarantee reactivity
  useEffect(() => {
    const unsubscribe = physicsMediator.subscribe(() => {
      setBenchState(physicsMediator.getTestBenchState());
    });
    return unsubscribe;
  }, []);

  const registry = physicsMediator.getRegistry();
  const materialsList = useMemo(() => registry.getAllCertifiedSpecs(), [registry]);

  const evaluation = useMemo(() => {
    // Re-evaluate whenever benchState updates
    if (!benchState) return null;
    return physicsMediator.evaluateActiveBeam();
  }, [benchState]);

  const thermalDeltaL = useMemo(() => {
    if (!benchState) return null;
    return physicsMediator.evaluateActiveBeamThermalExpansion();
  }, [benchState]);

  // Phase 2 Euler Column Buckling Evaluation
  const bucklingEvaluation = useMemo(() => {
    return physicsMediator.evaluateColumnBuckling(
      benchState.selectedMaterialId === 'structural_steel_a36'
        ? 'steel'
        : benchState.selectedMaterialId === 'structural_timber_df'
        ? 'wood'
        : 'steel',
      bucklingLoadKn * 1000,
      bucklingLengthM,
    );
  }, [benchState.selectedMaterialId, bucklingLoadKn, bucklingLengthM]);

  const updateParam = useCallback((partial: Partial<BeamTestBenchState>) => {
    physicsMediator.updateTestBenchState(partial);
  }, []);

  // Preset quick selectors
  const handleMaterialSelect = (matId: string) => {
    updateParam({ selectedMaterialId: matId });
  };

  const selectedSpec = registry.getCertifiedSpec(benchState.selectedMaterialId);

  // Color for the beam based on utilization heatmap
  const beamHeatmapColor = evaluation
    ? getStressHeatmapRgb(evaluation.utilization, evaluation.isFailing)
    : '#10b981';

  // SVG dimensions for real-time beam deformation visualization
  const svgWidth = 700;
  const svgHeight = 260;
  const baselineY = 130;
  const leftSupportX = 90;
  const rightSupportX = 610;
  const centerX = (leftSupportX + rightSupportX) / 2;

  // Visual deflection scale: amplify true physical deflection (meters) so children can see it clearly
  const deflectionMm = evaluation ? evaluation.maxDeflectionM * 1000 : 0;
  // Scaled visual sag capped at 70px
  const visualSagPx = Math.min(75, deflectionMm * 1.8);

  const deformedCurvePath = `M ${leftSupportX} ${baselineY} Q ${centerX} ${baselineY + visualSagPx * 2} ${rightSupportX} ${baselineY}`;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-1 p-6 font-mono text-xs shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-xl border border-accent/30 text-accent">
            🔬
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-fg tracking-wide">
                Phase 2 Advanced Physics & Mechanics Bench
              </h2>
              <span className="rounded-md bg-accent/20 border border-accent/40 px-2 py-0.5 text-[10px] text-accent font-semibold">
                PHASE 2 CONTINUUM & STABILITY
              </span>
            </div>
            <p className="text-xs text-fg-muted font-sans">
              Real-time validation for Euler-Bernoulli beam flexure, Euler compressive column buckling, and Pacejka Magic Formula tire slip.
            </p>
          </div>
        </div>

        {/* Phase 2 Test Mode Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl bg-surface-2 p-1 border border-border">
          <button
            onClick={() => setBenchMode('beam_bending')}
            className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
              benchMode === 'beam_bending'
                ? 'bg-accent text-accent-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            1. Beam Flexure
          </button>
          <button
            onClick={() => setBenchMode('euler_buckling')}
            className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
              benchMode === 'euler_buckling'
                ? 'bg-accent text-accent-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            2. Euler Buckling
          </button>
          <button
            onClick={() => setBenchMode('tire_pacejka')}
            className={`rounded-lg px-3 py-1.5 font-bold text-xs transition-colors ${
              benchMode === 'tire_pacejka'
                ? 'bg-accent text-accent-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            3. Pacejka Tire Slip
          </button>
        </div>

        {/* Material Presets Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {materialsList.map((spec) => (
            <button
              key={spec.id}
              onClick={() => handleMaterialSelect(spec.id)}
              className={`rounded-lg px-2.5 py-1.5 font-semibold text-[11px] transition-colors border ${
                benchState.selectedMaterialId === spec.id
                  ? 'border-accent bg-accent text-accent-fg shadow-sm'
                  : 'border-border bg-surface-2 text-fg hover:border-accent/60 hover:text-accent'
              }`}
              title={`${spec.name} (${spec.standardCitation})`}
            >
              {spec.id === 'structural_steel_a36'
                ? 'Steel A36'
                : spec.id === 'aluminum_6061_t6'
                ? 'Aluminum 6061'
                : spec.id === 'structural_concrete_c30'
                ? 'Concrete C30'
                : spec.id === 'titanium_ti6al4v'
                ? 'Titanium Gr5'
                : spec.id === 'stainless_steel_304'
                ? 'Stainless 304'
                : spec.id === 'copper_c11000'
                ? 'Copper ETP'
                : spec.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Beam Flexure (Euler-Bernoulli) */}
      {benchMode === 'beam_bending' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Control Column (Sliders & Parameters) */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-base/60 p-4 rounded-xl border border-border/80">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-fg uppercase tracking-wider text-[11px]">
                Active Spec: {selectedSpec?.name ?? benchState.selectedMaterialId}
              </span>
              <span className="text-[10px] text-accent font-semibold">
                {selectedSpec?.standardCitation.split(';')[0]}
              </span>
            </div>

            {/* Elastic Modulus E (GPa) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Young's Modulus ($E$):</span>
                <span className="text-accent font-bold">{benchState.customModulusGPa.toFixed(1)} GPa</span>
              </div>
              <input
                type="range"
                min={5}
                max={400}
                step={1}
                value={benchState.customModulusGPa}
                onChange={(e) => updateParam({ customModulusGPa: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
              <span className="text-[10px] text-fg-subtle">
                Higher $E$ = Stiffer beam (less sag). Steel ~200 GPa, Concrete ~33 GPa, Timber ~13 GPa.
              </span>
            </div>

            {/* Mass Density rho (kg/m3) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Mass Density ($\rho$):</span>
                <span className="text-accent font-bold">{benchState.customDensityKgM3.toFixed(0)} kg/m³</span>
              </div>
              <input
                type="range"
                min={400}
                max={9500}
                step={50}
                value={benchState.customDensityKgM3}
                onChange={(e) => updateParam({ customDensityKgM3: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
              <span className="text-[10px] text-fg-subtle">
                Increases beam deadweight load. Aluminum 2700, Steel 7850, Copper 8940 kg/m³.
              </span>
            </div>

            {/* Thermal Expansion alpha (ppm/K) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Thermal Expansion ($\alpha$):</span>
                <span className="text-accent font-bold">{benchState.customThermalExpansionPpmK.toFixed(1)} × 10⁻⁶ / K</span>
              </div>
              <input
                type="range"
                min={1}
                max={35}
                step={0.5}
                value={benchState.customThermalExpansionPpmK}
                onChange={(e) => updateParam({ customThermalExpansionPpmK: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
            </div>

            {/* Applied Center Load (kN) */}
            <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Applied Center Load ($P$):</span>
                <span className="text-amber-400 font-bold">{(benchState.appliedLoadN / 1000).toFixed(1)} kN</span>
              </div>
              <input
                type="range"
                min={0}
                max={150_000}
                step={1000}
                value={benchState.appliedLoadN}
                onChange={(e) => updateParam({ appliedLoadN: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-amber-400"
              />
            </div>

            {/* Span Length L (m) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Span Length ($L$):</span>
                <span className="text-fg font-bold">{benchState.spanLengthM.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={0.5}
                value={benchState.spanLengthM}
                onChange={(e) => updateParam({ spanLengthM: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
              <span className="text-[10px] text-fg-subtle">
                Deflection scales cubically with length: $\delta \propto L^3$.
              </span>
            </div>

            {/* Temperature Delta (K) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Temperature Change ($\Delta T$):</span>
                <span className="text-red-400 font-bold">+{benchState.deltaTemperatureK}°C / K</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={benchState.deltaTemperatureK}
                onChange={(e) => updateParam({ deltaTemperatureK: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-red-400"
              />
            </div>
          </div>

          {/* Right Interactive Visualization & Live Telemetry HUD */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Animated SVG Beam View */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface-base/90 p-3 shadow-inner">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none">
                <defs>
                  <marker id="load-arrow" markerWidth="8" markerHeight="8" refX="4" refY="7" orient="auto">
                    <path d="M0,0 L8,0 L4,7 z" fill="#f59e0b" />
                  </marker>
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--border)" />
                    <stop offset="50%" stopColor={beamHeatmapColor} />
                    <stop offset="100%" stopColor="var(--border)" />
                  </linearGradient>
                </defs>

                {/* Grid Reference Line (Unloaded Datum) */}
                <line
                  x1={leftSupportX}
                  y1={baselineY}
                  x2={rightSupportX}
                  y2={baselineY}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />

                {/* Pin Support Left (Triangle) */}
                <polygon
                  points={`${leftSupportX},${baselineY} ${leftSupportX - 14},${baselineY + 28} ${leftSupportX + 14},${baselineY + 28}`}
                  fill="var(--surface-3)"
                  stroke="var(--fg)"
                  strokeWidth="1.5"
                />
                <circle cx={leftSupportX} cy={baselineY} r="4" fill="var(--accent)" />
                <line x1={leftSupportX - 20} y1={baselineY + 28} x2={leftSupportX + 20} y2={baselineY + 28} stroke="var(--fg-muted)" strokeWidth="2" />

                {/* Roller Support Right (Triangle + Rollers) */}
                <polygon
                  points={`${rightSupportX},${baselineY} ${rightSupportX - 14},${baselineY + 24} ${rightSupportX + 14},${baselineY + 24}`}
                  fill="var(--surface-3)"
                  stroke="var(--fg)"
                  strokeWidth="1.5"
                />
                <circle cx={rightSupportX} cy={baselineY} r="4" fill="var(--accent)" />
                <circle cx={rightSupportX - 7} cy={baselineY + 28} r="3" fill="var(--fg-muted)" />
                <circle cx={rightSupportX + 7} cy={baselineY + 28} r="3" fill="var(--fg-muted)" />
                <line x1={rightSupportX - 20} y1={baselineY + 32} x2={rightSupportX + 20} y2={baselineY + 32} stroke="var(--fg-muted)" strokeWidth="2" />

                {/* Deformed Beam Solid Shape */}
                <path
                  d={deformedCurvePath}
                  fill="none"
                  stroke="url(#beamGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  style={{ transition: 'd 0.08s ease-out, stroke 0.15s ease-out' }}
                />

                {/* Applied Load Arrow Vector */}
                {benchState.appliedLoadN > 0 && (
                  <g>
                    <line
                      x1={centerX}
                      y1={baselineY + visualSagPx - 45}
                      x2={centerX}
                      y2={baselineY + visualSagPx - 4}
                      stroke="#f59e0b"
                      strokeWidth="3"
                      markerEnd="url(#load-arrow)"
                    />
                    <rect
                      x={centerX - 42}
                      y={baselineY + visualSagPx - 68}
                      width="84"
                      height="18"
                      rx="4"
                      fill="#020617"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x={centerX}
                      y={baselineY + visualSagPx - 56}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#f59e0b"
                    >
                      P = {(benchState.appliedLoadN / 1000).toFixed(1)} kN
                    </text>
                  </g>
                )}

                {/* Deflection Dimension Callout */}
                {deflectionMm > 0.05 && (
                  <g>
                    <line
                      x1={centerX + 65}
                      y1={baselineY}
                      x2={centerX + 65}
                      y2={baselineY + visualSagPx}
                      stroke="var(--accent)"
                      strokeWidth="1.2"
                    />
                    <line x1={centerX + 58} y1={baselineY} x2={centerX + 72} y2={baselineY} stroke="var(--accent)" strokeWidth="1" />
                    <line x1={centerX + 58} y1={baselineY + visualSagPx} x2={centerX + 72} y2={baselineY + visualSagPx} stroke="var(--accent)" strokeWidth="1" />
                    <text
                      x={centerX + 76}
                      y={baselineY + visualSagPx / 2 + 3}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="var(--accent)"
                    >
                      Δy = {deflectionMm.toFixed(2)} mm
                    </text>
                  </g>
                )}

                {/* Span Length Label */}
                <text x={centerX} y={baselineY + 44} textAnchor="middle" fontSize="9" fill="var(--fg-muted)">
                  Span L = {benchState.spanLengthM.toFixed(1)} m
                </text>
              </svg>
            </div>

            {/* Real-Time Mechanical Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Deflection */}
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Max Sag (δ)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-accent">{deflectionMm.toFixed(2)}</span>
                  <span className="text-[10px] text-fg-subtle">mm</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">
                  Span/δ: {deflectionMm > 0 ? (benchState.spanLengthM * 1000 / deflectionMm).toFixed(0) : '∞'}
                </span>
              </div>

              {/* Bending Stress */}
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Bending Stress (σ)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-base font-bold ${evaluation?.isFailing ? 'text-red-400' : 'text-fg'}`}>
                    {evaluation ? (evaluation.maxBendingStressPa / 1e6).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[10px] text-fg-subtle">MPa</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">
                  Allow: {evaluation ? (evaluation.allowableStressPa / 1e6).toFixed(0) : 0} MPa
                </span>
              </div>

              {/* ASME Safety Factor */}
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Safety Factor (SF)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-base font-bold ${
                      !evaluation
                        ? 'text-fg'
                        : evaluation.isFailing
                        ? 'text-red-400'
                        : evaluation.safetyFactor >= 1.5
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {evaluation ? evaluation.safetyFactor.toFixed(2) : '∞'}
                  </span>
                  <span className="text-[10px] text-fg-subtle">ASME</span>
                </div>
                <span
                  className={`text-[9px] font-semibold mt-auto pt-1 ${
                    evaluation?.isFailing ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {evaluation?.isFailing ? 'FAILING (Overstress)' : 'PASS (Stable)'}
                </span>
              </div>

              {/* Thermal Elongation */}
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Thermal Growth (ΔL)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-red-400">
                    {thermalDeltaL !== null ? (thermalDeltaL * 1000).toFixed(2) : '0.00'}
                  </span>
                  <span className="text-[10px] text-fg-subtle">mm</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">
                  Deadweight: {evaluation ? (evaluation.weightN / 1000).toFixed(2) : 0} kN
                </span>
              </div>
            </div>

            {/* Engineering Formula Reference Card */}
            <div className="rounded-xl border border-border/80 bg-surface-2/30 p-3 text-[11px] text-fg-muted flex flex-col gap-1.5 font-sans">
              <div className="flex items-center gap-2 font-mono font-bold text-fg text-xs">
                <span>📐</span>
                <span>Euler-Bernoulli Elastic Formulation (ASTM E111 / ISO 80000-4)</span>
              </div>
              <p>
                Max Center Deflection: <code className="text-accent font-mono">δ_max = (P · L³) / (48 · E · I)</code>
                <span className="mx-2">·</span>
                Moment of Inertia: <code className="text-accent font-mono">I = (b · h³) / 12</code>
              </p>
              <p>
                Peak Bending Stress: <code className="text-accent font-mono">σ_max = (M_max · c) / I</code> where <code className="text-accent font-mono">M_max = (P · L) / 4</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Euler Column Buckling Instability (AISC 360-16 / ASME III) */}
      {benchMode === 'euler_buckling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-base/60 p-4 rounded-xl border border-border/80">
            <div className="border-b border-border/60 pb-2">
              <span className="font-bold text-fg uppercase tracking-wider text-[11px]">
                Euler Column Parameters (AISC 360-16)
              </span>
              <p className="text-[10px] text-fg-muted mt-0.5 font-sans">
                A slender column subjected to axial compression can buckle laterally at loads far below its material yield strength.
              </p>
            </div>

            {/* Compressive Load P (kN) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Compressive Load (P_axial):</span>
                <span className="text-orange-400 font-bold">{bucklingLoadKn} kN</span>
              </div>
              <input
                type="range"
                min={5}
                max={250}
                step={5}
                value={bucklingLoadKn}
                onChange={(e) => setBucklingLoadKn(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-orange-400"
              />
            </div>

            {/* Column Length L (m) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Column Unbraced Length (L):</span>
                <span className="text-fg font-bold">{bucklingLengthM.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={bucklingLengthM}
                onChange={(e) => setBucklingLengthM(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
              <span className="text-[10px] text-fg-subtle">
                Critical load drops with length squared: P_cr ∝ 1 / L².
              </span>
            </div>

            <div className="rounded-lg bg-surface-2/60 p-3 border border-border/60 text-[11px] flex flex-col gap-1">
              <span className="text-fg-muted font-semibold">Column Section Specs:</span>
              <span>Cross-section: <b className="text-fg">100 mm × 100 mm</b> (Wood/Steel)</span>
              <span>Radius of Gyration: <b className="text-fg">r = 28.9 mm</b></span>
              <span>Slenderness Ratio: <b className="text-accent">λ = {bucklingEvaluation?.slendernessRatio?.toFixed(1) ?? '138.6'}</b></span>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* SVG Column Lateral Buckling Curve */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface-base/90 p-4 flex items-center justify-center">
              <svg viewBox="0 0 500 240" className="w-full h-56 select-none">
                <marker id="buckle-arrow" markerWidth="8" markerHeight="8" refX="4" refY="7" orient="auto">
                  <path d="M0,0 L8,0 L4,7 z" fill={bucklingEvaluation?.isBuckled ? '#ef4444' : '#10b981'} />
                </marker>

                {/* Column Base and Top Plates */}
                <rect x="220" y="200" width="60" height="12" rx="2" fill="var(--surface-3)" stroke="var(--fg)" strokeWidth="1.5" />
                <rect x="220" y="28" width="60" height="12" rx="2" fill="var(--surface-3)" stroke="var(--fg)" strokeWidth="1.5" />

                {/* Unbuckled Reference Axis */}
                <line x1="250" y1="40" x2="250" y2="200" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* Buckled Sine Curve: y from 40 to 200, lateral amplitude based on overload */}
                {(() => {
                  const amp = bucklingEvaluation?.isBuckled
                    ? Math.min(65, 20 + ((bucklingLoadKn * 1000) / (bucklingEvaluation.eulerCriticalLoadN ?? 50000)) * 25)
                    : 0;
                  const curve = `M 250 40 Q ${250 + amp * 1.5} 120 250 200`;
                  return (
                    <path
                      d={curve}
                      fill="none"
                      stroke={bucklingEvaluation?.isBuckled ? '#ef4444' : '#10b981'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      style={{ transition: 'd 0.1s ease-out, stroke 0.15s ease-out' }}
                    />
                  );
                })()}

                {/* Top Compressive Arrow */}
                <line x1="250" y1="6" x2="250" y2="24" stroke={bucklingEvaluation?.isBuckled ? '#ef4444' : '#10b981'} strokeWidth="3" markerEnd="url(#buckle-arrow)" />

                {/* Callout */}
                <text x="350" y="100" fill="var(--fg)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {bucklingEvaluation?.isBuckled ? '⚡ EULER BUCKLED' : '✓ ELASTIC STABLE'}
                </text>
                <text x="350" y="120" fill="var(--fg-muted)" fontSize="9.5" fontFamily="monospace">
                  P_cr = {((bucklingEvaluation?.eulerCriticalLoadN ?? 56500) / 1000).toFixed(1)} kN
                </text>
                <text x="350" y="136" fill="var(--fg-muted)" fontSize="9.5" fontFamily="monospace">
                  P_applied = {bucklingLoadKn.toFixed(1)} kN
                </text>
              </svg>
            </div>

            {/* Telemetry Cards for Buckling */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Critical Load (P_cr)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-accent">
                    {((bucklingEvaluation?.eulerCriticalLoadN ?? 0) / 1000).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-fg-subtle">kN</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">Euler Limit (π²EI/L²)</span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Slenderness (λ)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-fg">
                    {bucklingEvaluation?.slendernessRatio?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">λ = L / r</span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Stability Verdict</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-sm font-bold ${bucklingEvaluation?.isBuckled ? 'text-red-400' : 'text-emerald-400'}`}>
                    {bucklingEvaluation?.isBuckled ? 'BUCKLED' : 'STABLE'}
                  </span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">AISC 360-16 Design Check</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Pacejka Magic Formula Tire Dynamics */}
      {benchMode === 'tire_pacejka' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-base/60 p-4 rounded-xl border border-border/80">
            <div className="border-b border-border/60 pb-2">
              <span className="font-bold text-fg uppercase tracking-wider text-[11px]">
                Pacejka Magic Formula Tire Slip Model
              </span>
              <p className="text-[10px] text-fg-muted mt-0.5 font-sans">
                Real rubber tires develop peak grip around 12-18% longitudinal slip (κ). Beyond that, grip drops as wheelspin increases.
              </p>
            </div>

            {/* Slip Ratio Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Wheel Slip Ratio (κ):</span>
                <span className="text-accent font-bold">{(tireSlipRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(tireSlipRatio * 100)}
                onChange={(e) => setTireSlipRatio(Number(e.target.value) / 100)}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent"
              />
              <span className="text-[10px] text-fg-subtle">
                0% = Pure rolling (no force); 15% = Peak grip; 100% = Full wheelspin burn.
              </span>
            </div>

            {/* Tire Normal Load (kN) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-fg-muted font-medium">Wheel Normal Force (F_N):</span>
                <span className="text-emerald-400 font-bold">{tireNormalKn.toFixed(1)} kN</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={tireNormalKn}
                onChange={(e) => setTireNormalKn(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-emerald-400"
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Real-Time Pacejka Curve SVG Plot */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface-base/90 p-4">
              <svg viewBox="0 0 500 220" className="w-full h-56 select-none font-mono">
                {/* Axes */}
                <line x1="50" y1="180" x2="470" y2="180" stroke="var(--border)" strokeWidth="1.5" />
                <line x1="50" y1="30" x2="50" y2="180" stroke="var(--border)" strokeWidth="1.5" />

                <text x="470" y="200" fill="var(--fg-muted)" fontSize="9" textAnchor="end">Slip Ratio (κ)</text>
                <text x="35" y="30" fill="var(--fg-muted)" fontSize="9" textAnchor="end">Traction Force (Fx)</text>

                {/* Plot the full Pacejka curve */}
                {(() => {
                  const points: string[] = [];
                  const normalN = tireNormalKn * 1000;
                  const peakEstimated = 0.85 * normalN;
                  for (let s = 0; s <= 1.0; s += 0.02) {
                    const f = calculatePacejkaTraction(normalN, s);
                    const px = 50 + s * 400;
                    const py = 180 - (f / peakEstimated) * 130;
                    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                  }
                  return (
                    <polyline
                      points={points.join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                  );
                })()}

                {/* Current Operating Point Marker */}
                {(() => {
                  const normalN = tireNormalKn * 1000;
                  const currentF = calculatePacejkaTraction(normalN, tireSlipRatio);
                  const peakEstimated = 0.85 * normalN;
                  const px = 50 + tireSlipRatio * 400;
                  const py = 180 - (currentF / peakEstimated) * 130;
                  return (
                    <g>
                      <circle cx={px} cy={py} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      <line x1={px} y1={py} x2={px} y2={180} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1" />
                      <text x={px + 8} y={py - 8} fill="#f59e0b" fontSize="10" fontWeight="bold">
                        {(currentF / 1000).toFixed(2)} kN
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Pacejka Output Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Traction Force (F_x)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-amber-400">
                    {(calculatePacejkaTraction(tireNormalKn * 1000, tireSlipRatio) / 1000).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-fg-subtle">kN</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">Effective Longitudinal Force</span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Grip State</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-sm font-bold ${
                      tireSlipRatio <= 0.2 ? 'text-emerald-400' : tireSlipRatio <= 0.4 ? 'text-amber-400' : 'text-red-400'
                    }`}
                  >
                    {tireSlipRatio <= 0.2 ? 'OPTIMAL GRIP' : tireSlipRatio <= 0.4 ? 'SLIPPING' : 'WHEELSPIN'}
                  </span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">Pacejka Magic Formula</span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col">
                <span className="text-[10px] text-fg-muted font-semibold uppercase">Peak Coefficient</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-fg">μ = 0.85</span>
                </div>
                <span className="text-[9px] text-fg-muted mt-auto pt-1">Asphalt Standard Tire</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Physics Engine Performance Monitor */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted font-mono">
            Physics Engine Computation Telemetry
          </span>
          <span className="text-[10px] text-fg-subtle font-mono">
            Target Budget: 16.67ms (60 FPS)
          </span>
        </div>
        <PhysicsPerformanceMonitor isSimulating={true} />
      </div>
    </div>
  );
}
