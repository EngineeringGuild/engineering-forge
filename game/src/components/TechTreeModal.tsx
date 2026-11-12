import React from 'react';
import { TechTreeOrganism } from './organisms/TechTreeOrganism';

interface TechTreeModalProps {
  onClose: () => void;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-cyan-500/60 rounded-xl max-w-5xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-300 uppercase">
                Árvore Tecnológica & Pesquisa da Forja
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Patentes, Ligas Avançadas e Desbloqueios Operacionais (DOC-10)
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors font-mono cursor-pointer"
          >
            ✕ FECHAR
          </button>
        </div>

        {/* Organism Content */}
        <div className="overflow-y-auto flex-1 pr-1">
          <TechTreeOrganism />
        </div>
      </div>
    </div>
  );
};
