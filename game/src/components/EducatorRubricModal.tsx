import React, { useState } from 'react';
import type { EducatorLevelDef } from '../educator/educatorTypes';
import {
  generatePrototypeTopologies,
  evaluateTrussTopology,
  type ParetoEvaluationResult,
} from '../educator/educatorSolver';

interface EducatorRubricModalProps {
  level: EducatorLevelDef;
  onClose: () => void;
}

export const EducatorRubricModal: React.FC<EducatorRubricModalProps> = ({ level, onClose }) => {
  const [prototypes] = useState(() =>
    generatePrototypeTopologies(level.geometry.spanWidthMeters, 4)
  );

  const [evaluations] = useState<ParetoEvaluationResult[]>(() =>
    prototypes.map((proto) => {
      const evalRes = evaluateTrussTopology(proto.nodes, proto.members, level);
      return {
        ...evalRes,
        topologyName: proto.name,
      };
    })
  );

  const [selectedEval, setSelectedEval] = useState<ParetoEvaluationResult>(
    evaluations[0] || null
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-amber-500/60 rounded-xl max-w-4xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-amber-300 uppercase">
                Gabarito Analítico & Fronteira de Pareto
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {level.title} • Vão: {level.geometry.spanWidthMeters}m • Carga:{' '}
              {level.geometry.targetLoadKn ?? 40} kN • SF Mínimo:{' '}
              {level.rubric.safetyFactorMinimum}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800/80 hover:bg-slate-700 rounded text-sm transition-colors"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 overflow-y-auto pr-2">
          {/* Topologies List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Topologias Teóricas de Referência
            </h3>
            {evaluations.map((ev, idx) => {
              const isSelected = selectedEval?.topologyName === ev.topologyName;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedEval(ev)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400/80 text-white shadow-md shadow-amber-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{ev.topologyName}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        ev.satisfiesRubric
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : 'bg-rose-950 border border-rose-500 text-rose-300'
                      }`}
                    >
                      {ev.satisfiesRubric ? 'APROVADO' : 'NÃO CONFORME'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
                    <span>SF: {ev.safetyFactor.toFixed(2)}</span>
                    <span>Custo: ${ev.totalCost}</span>
                    <span>Massa: {ev.totalMassKg} kg</span>
                  </div>
                </div>
              );
            })}

            {/* Rubric Constraints Box */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs space-y-2 mt-4 font-mono">
              <div className="text-amber-400/90 font-semibold border-b border-slate-800 pb-1">
                CRITÉRIOS DA RUBRICA
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fator de Segurança Mínimo:</span>
                <span className="text-slate-200">≥ {level.rubric.safetyFactorMinimum}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Orçamento Máximo:</span>
                <span className="text-slate-200">${level.inventory.budgetLimit}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Materiais Liberados:</span>
                <span className="text-slate-200">
                  {level.inventory.allowedMaterials?.join(', ') || 'Todos'}
                </span>
              </div>
            </div>
          </div>

          {/* Pareto Diagram & Analytical Breakdown */}
          <div className="md:col-span-2 space-y-4">
            {selectedEval && (
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300 font-mono">
                    ANÁLISE ESTRUTURAL COMPARATIVA
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Pontuação Didática:{' '}
                    <strong className="text-emerald-400">{selectedEval.score}/100</strong>
                  </span>
                </div>

                {/* Pareto Visual Bar Representation */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-3">
                  <div className="text-xs font-mono text-slate-400 flex justify-between">
                    <span>FATOR DE SEGURANÇA (SF)</span>
                    <span
                      className={
                        selectedEval.safetyFactor >= level.rubric.safetyFactorMinimum
                          ? 'text-emerald-400 font-bold'
                          : 'text-rose-400 font-bold'
                      }
                    >
                      {selectedEval.safetyFactor.toFixed(2)} (Mínimo:{' '}
                      {level.rubric.safetyFactorMinimum})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedEval.safetyFactor >= level.rubric.safetyFactorMinimum
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (selectedEval.safetyFactor / 2.5) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex justify-between mt-2">
                    <span>UTILIZAÇÃO ORÇAMENTÁRIA</span>
                    <span
                      className={
                        selectedEval.totalCost <= level.inventory.budgetLimit
                          ? 'text-emerald-400 font-bold'
                          : 'text-rose-400 font-bold'
                      }
                    >
                      ${selectedEval.totalCost} / ${level.inventory.budgetLimit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedEval.totalCost <= level.inventory.budgetLimit
                          ? 'bg-cyan-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedEval.totalCost / level.inventory.budgetLimit) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Pedagogical Commentary */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-xs font-mono uppercase text-slate-400 mb-1">
                    Comentário Pedagógico para o Professor:
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedEval.pedagogicalReview}
                  </p>
                </div>

                {/* Print/Copy Analytical Sheet */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      const text = `GABARITO DIDÁTICO - ${level.title}\nTopologia: ${selectedEval.topologyName}\nSF: ${selectedEval.safetyFactor}\nCusto: $${selectedEval.totalCost}\nMassa: ${selectedEval.totalMassKg} kg\nStatus: ${selectedEval.satisfiesRubric ? 'APROVADO' : 'NÃO CONFORME'}\nParecer: ${selectedEval.pedagogicalReview}`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded transition-colors flex items-center gap-1.5"
                  >
                    📋 Copiar Gabarito Didático
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
