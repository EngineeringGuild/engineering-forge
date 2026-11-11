import React, { useState } from 'react';
import type { EducatorLevelDef } from '../educator/educatorTypes';
import {
  generatePrototypeTopologies,
  evaluateTrussTopology,
  type ParetoEvaluationResult,
} from '../educator/educatorSolver';
import { soundFx } from '../audio/soundFx';

interface LiveClassroomComparatorProps {
  level: EducatorLevelDef;
  onClose: () => void;
}

export const LiveClassroomComparator: React.FC<LiveClassroomComparatorProps> = ({
  level,
  onClose,
}) => {
  const [prototypes] = useState(() =>
    generatePrototypeTopologies(level.geometry.spanWidthMeters, 4)
  );

  const [evalA] = useState<ParetoEvaluationResult>(() =>
    evaluateTrussTopology(prototypes[0].nodes, prototypes[0].members, level)
  );

  const [evalB] = useState<ParetoEvaluationResult>(() =>
    evaluateTrussTopology(prototypes[1].nodes, prototypes[1].members, level)
  );

  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0 to 100%

  const handleRunSim = () => {
    soundFx.playModeSwitch();
    setIsSimulating(true);
    setSimStep(0);

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          soundFx.playTactileClick();
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060910] text-slate-100 flex flex-col p-6 overflow-hidden">
      {/* Top Bar for Projector */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
          <h1 className="text-2xl font-black font-mono tracking-widest text-cyan-300 uppercase">
            SALA AO VIVO • MODO PROJETOR COMPARATIVO
          </h1>
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-400 font-mono text-xs">
            {level.title} ({level.geometry.spanWidthMeters}m)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRunSim}
            disabled={isSimulating}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-950 disabled:text-cyan-800 text-black font-mono font-bold text-sm rounded shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>▶</span>
            <span>{isSimulating ? `SIMULANDO (${simStep}%)` : 'INICIAR TESTE SIMULTÂNEO'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-mono text-xs text-slate-300 rounded transition-colors"
          >
            ✕ Sair do Projetor
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 my-4 overflow-hidden">
        {/* Solution A */}
        <div className="bg-[#0b101d] border-2 border-emerald-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-start border-b border-emerald-500/30 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  SOLUÇÃO A (EQUIPE ALFA)
                </span>
                <h3 className="text-xl font-bold font-mono text-white mt-1">
                  {prototypes[0].name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold">
                {evalA.satisfiesRubric ? 'APROVADO' : 'NÃO CONFORME'}
              </span>
            </div>

            {/* Canvas Schematic Simulation Box */}
            <div className="relative mt-4 bg-slate-950/90 rounded-lg border border-emerald-500/30 h-64 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 160 80" className="w-full h-full p-4">
                {/* Abutments */}
                <rect x="0" y="60" width="20" height="20" fill="#1e293b" />
                <rect x="140" y="60" width="20" height="20" fill="#1e293b" />
                {/* Truss Members */}
                <line x1="10" y1="60" x2="80" y2="60" stroke="#b8825a" strokeWidth="3" />
                <line x1="80" y1="60" x2="150" y2="60" stroke="#b8825a" strokeWidth="3" />
                <line x1="10" y1="60" x2="45" y2="30" stroke="#b8825a" strokeWidth="2.5" />
                <line x1="45" y1="30" x2="80" y2="60" stroke="#b8825a" strokeWidth="2.5" />
                <line x1="80" y1="60" x2="115" y2="30" stroke="#b8825a" strokeWidth="2.5" />
                <line x1="115" y1="30" x2="150" y2="60" stroke="#b8825a" strokeWidth="2.5" />
                <line x1="45" y1="30" x2="115" y2="30" stroke="#9aa5b1" strokeWidth="3" />
                {/* Joints */}
                <circle cx="10" cy="60" r="3" fill="#38bdf8" />
                <circle cx="80" cy="60" r="3" fill="#38bdf8" />
                <circle cx="150" cy="60" r="3" fill="#38bdf8" />
                <circle cx="45" cy="30" r="3" fill="#38bdf8" />
                <circle cx="115" cy="30" r="3" fill="#38bdf8" />
              </svg>

              {isSimulating && (
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold px-3 py-1 bg-black/80 rounded border border-emerald-400 text-emerald-300 animate-pulse">
                    APLICANDO CARGA {level.geometry.targetLoadKn ?? 40} kN...
                  </span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center font-mono">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Fator Seg.</span>
                <span className="text-lg font-bold text-emerald-400">{evalA.safetyFactor.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Custo Total</span>
                <span className="text-lg font-bold text-white">${evalA.totalCost}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Massa Estimada</span>
                <span className="text-lg font-bold text-slate-300">{evalA.totalMassKg} kg</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 mt-4 bg-slate-900/60 p-3 rounded">
            <strong>Parecer Analítico:</strong> {evalA.pedagogicalReview}
          </div>
        </div>

        {/* Solution B */}
        <div className="bg-[#0b101d] border-2 border-cyan-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-start border-b border-cyan-500/30 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  SOLUÇÃO B (EQUIPE BETA)
                </span>
                <h3 className="text-xl font-bold font-mono text-white mt-1">
                  {prototypes[1].name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono text-xs font-bold">
                {evalB.satisfiesRubric ? 'APROVADO' : 'NÃO CONFORME'}
              </span>
            </div>

            {/* Canvas Schematic Simulation Box */}
            <div className="relative mt-4 bg-slate-950/90 rounded-lg border border-cyan-500/30 h-64 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 160 80" className="w-full h-full p-4">
                {/* Abutments */}
                <rect x="0" y="60" width="20" height="20" fill="#1e293b" />
                <rect x="140" y="60" width="20" height="20" fill="#1e293b" />
                {/* King Post Deck and Strut */}
                <line x1="10" y1="60" x2="80" y2="60" stroke="#b8825a" strokeWidth="3" />
                <line x1="80" y1="60" x2="150" y2="60" stroke="#b8825a" strokeWidth="3" />
                <line x1="80" y1="60" x2="80" y2="25" stroke="#9aa5b1" strokeWidth="3" />
                {/* Cables */}
                <line x1="10" y1="60" x2="80" y2="25" stroke="#4fb0c6" strokeWidth="2" strokeDasharray="3 1" />
                <line x1="150" y1="60" x2="80" y2="25" stroke="#4fb0c6" strokeWidth="2" strokeDasharray="3 1" />
                {/* Joints */}
                <circle cx="10" cy="60" r="3" fill="#38bdf8" />
                <circle cx="80" cy="60" r="3" fill="#38bdf8" />
                <circle cx="150" cy="60" r="3" fill="#38bdf8" />
                <circle cx="80" cy="25" r="3" fill="#38bdf8" />
              </svg>

              {isSimulating && (
                <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold px-3 py-1 bg-black/80 rounded border border-cyan-400 text-cyan-300 animate-pulse">
                    APLICANDO CARGA {level.geometry.targetLoadKn ?? 40} kN...
                  </span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center font-mono">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Fator Seg.</span>
                <span className="text-lg font-bold text-cyan-400">{evalB.safetyFactor.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Custo Total</span>
                <span className="text-lg font-bold text-white">${evalB.totalCost}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Massa Estimada</span>
                <span className="text-lg font-bold text-slate-300">{evalB.totalMassKg} kg</span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 mt-4 bg-slate-900/60 p-3 rounded">
            <strong>Parecer Analítico:</strong> {evalB.pedagogicalReview}
          </div>
        </div>
      </div>
    </div>
  );
};
