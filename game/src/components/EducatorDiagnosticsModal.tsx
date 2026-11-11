import React, { useState } from 'react';
import type { EducatorLevelDef } from '../educator/educatorTypes';
import {
  analyzeClassroomDiagnostics,
  getAnonymousStudentAlias,
  type StudentFailureRecord,
} from '../educator/educatorDiagnostics';
import { soundFx } from '../audio/soundFx';

interface EducatorDiagnosticsModalProps {
  level: EducatorLevelDef;
  onClose: () => void;
}

export const EducatorDiagnosticsModal: React.FC<EducatorDiagnosticsModalProps> = ({
  level,
  onClose,
}) => {
  // Mock generated class records based on level geometry
  const [mockRecords] = useState<StudentFailureRecord[]>(() => {
    const midX = level.geometry.spanWidthMeters / 2;
    return [
      {
        submissionId: 'sub-01',
        studentAnonymousAlias: getAnonymousStudentAlias(0),
        discipline: 'structures',
        failureType: 'euler_buckling',
        safetyFactorAchieved: 0.74,
        cost: Math.round(level.inventory.budgetLimit * 0.8),
        timeSpentSeconds: 110,
        failedNodeCoords: [{ x: midX, y: 0 }, { x: midX, y: -3 }],
        timestamp: 1731320000000,
      },
      {
        submissionId: 'sub-02',
        studentAnonymousAlias: getAnonymousStudentAlias(1),
        discipline: 'structures',
        failureType: 'euler_buckling',
        safetyFactorAchieved: 0.88,
        cost: Math.round(level.inventory.budgetLimit * 0.9),
        timeSpentSeconds: 95,
        failedNodeCoords: [{ x: midX, y: -3 }],
        timestamp: 1731320000000,
      },
      {
        submissionId: 'sub-03',
        studentAnonymousAlias: getAnonymousStudentAlias(2),
        discipline: 'structures',
        failureType: 'cable_slack',
        safetyFactorAchieved: 0.91,
        cost: Math.round(level.inventory.budgetLimit * 0.75),
        timeSpentSeconds: 140,
        failedNodeCoords: [{ x: midX / 2, y: 0 }],
        timestamp: 1731320000000,
      },
      {
        submissionId: 'sub-04',
        studentAnonymousAlias: getAnonymousStudentAlias(3),
        discipline: 'structures',
        failureType: 'budget_exceeded',
        safetyFactorAchieved: 1.85,
        cost: Math.round(level.inventory.budgetLimit * 1.3),
        timeSpentSeconds: 210,
        timestamp: 1731320000000,
      },
      {
        submissionId: 'sub-05',
        studentAnonymousAlias: getAnonymousStudentAlias(4),
        discipline: 'structures',
        failureType: 'unstable_mechanism',
        safetyFactorAchieved: 1.45,
        cost: Math.round(level.inventory.budgetLimit * 0.82),
        timeSpentSeconds: 75,
        timestamp: 1731320000000,
      },
      {
        submissionId: 'sub-06',
        studentAnonymousAlias: getAnonymousStudentAlias(5),
        discipline: 'structures',
        failureType: 'euler_buckling',
        safetyFactorAchieved: 1.55,
        cost: Math.round(level.inventory.budgetLimit * 0.72),
        timeSpentSeconds: 130,
        timestamp: 1731320000000,
      },
    ];
  });

  const [diagnostics] = useState(() => analyzeClassroomDiagnostics(mockRecords));
  const [selectedCause, setSelectedCause] = useState<string | null>(
    diagnostics.topFailureCauses[0]?.type ?? null
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-rose-500/60 rounded-xl max-w-4xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-rose-300 uppercase">
                Diagnóstico Conceitual da Turma & Heatmap de Colapso
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {level.title} • Análise Estatística Agregada • {mockRecords.length} Submissões Avaliadas
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
          {/* Left Column: Top Failure Causes */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Causas de Falha Recorrentes
            </h3>
            {diagnostics.topFailureCauses.map((cause) => {
              const isSelected = selectedCause === cause.type;
              return (
                <div
                  key={cause.type}
                  onClick={() => {
                    soundFx.playTactileClick();
                    setSelectedCause(cause.type);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-400/80 text-white shadow-md shadow-rose-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs">{cause.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">
                      {cause.percentage}% ({cause.count})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${cause.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Class Aggregated KPIs */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs space-y-2 mt-4 font-mono">
              <div className="text-rose-400 font-semibold border-b border-slate-800 pb-1 uppercase tracking-wider">
                Métricas da Turma
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa de Aprovação:</span>
                <span className="text-emerald-400 font-bold">{diagnostics.passRatePercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fator de Seg. Médio:</span>
                <span className="text-cyan-400 font-bold">{diagnostics.averageSafetyFactor}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Custo Médio Utilizado:</span>
                <span className="text-amber-300 font-bold">${diagnostics.averageCost}</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Heatmap & Pedagogical Advice */}
          <div className="md:col-span-2 space-y-4">
            {/* Visual Heatmap Canvas Mock */}
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 uppercase font-bold tracking-wider">
                  HEATMAP ESPACIAL DE RUPTURAS COLETIVAS
                </span>
                <span className="text-slate-400">
                  {diagnostics.nodeFailureHeatmap.length} Pontos de Concentração
                </span>
              </div>

              {/* Schematic Canvas with Glowing Failure Hotspots */}
              <div className="relative bg-slate-900/70 border border-slate-800 rounded-lg h-56 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 160 80" className="w-full h-full p-4">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="160" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="160" y2="40" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="160" y2="60" stroke="#1e293b" strokeWidth="0.5" />

                  {/* Nominal Deck */}
                  <line x1="10" y1="60" x2="150" y2="60" stroke="#334155" strokeWidth="3" />
                  <line x1="10" y1="60" x2="80" y2="25" stroke="#334155" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="150" y1="60" x2="80" y2="25" stroke="#334155" strokeWidth="2" strokeDasharray="3 2" />

                  {/* Heatmap Overlay Circles */}
                  {diagnostics.nodeFailureHeatmap.map((point, idx) => {
                    const cx = 10 + (point.x / level.geometry.spanWidthMeters) * 140;
                    const cy = 60 + point.y * 6;
                    return (
                      <g key={idx}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={14 * point.intensity}
                          fill="#f43f5e"
                          opacity={0.35 * point.intensity}
                          className="animate-ping"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={7 * point.intensity + 3}
                          fill="#f43f5e"
                          opacity={0.8}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                  🔴 Pontos Críticos de Flambagem/Ruptura Coletiva
                </div>
              </div>
            </div>

            {/* Pedagogical Intervention Card */}
            {selectedCause && (
              <div className="p-4 bg-slate-900/90 border border-rose-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                  <span>💡</span>
                  <span>Intervenção Pedagógica Recomendada para o Professor:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {diagnostics.topFailureCauses.find((c) => c.type === selectedCause)
                    ?.pedagogicalIntervention}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
