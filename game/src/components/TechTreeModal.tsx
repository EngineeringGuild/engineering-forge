import React, { useState } from 'react';
import { useForgeEconomyStore, type TechNode } from '../state/forgeEconomyStore';
import { soundFx } from '../audio/soundFx';

interface TechTreeModalProps {
  onClose: () => void;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({ onClose }) => {
  const { wallet, techTree, unlockTechNode, canUnlockNode } = useForgeEconomyStore();
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'structures' | 'electricity' | 'machines'>('all');
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(techTree[0] || null);

  const filteredTree = techTree.filter(
    (n) => selectedBranch === 'all' || n.branch === selectedBranch
  );

  const handleUnlock = (nodeId: string) => {
    soundFx.playModeSwitch();
    const success = unlockTechNode(nodeId);
    if (success) {
      soundFx.playTactileClick();
      const updated = useForgeEconomyStore.getState().techTree.find((n) => n.id === nodeId);
      if (updated) setSelectedNode(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-cyan-500/60 rounded-xl max-w-5xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/30 gap-4">
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

          {/* Wallet Bar */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs">
            <div title="Créditos da Forja">
              <span className="text-slate-400">F$: </span>
              <span className="text-emerald-400 font-bold">{wallet.credits}</span>
            </div>
            <div className="text-slate-600">|</div>
            <div title="Pontos de Pesquisa (P&D)">
              <span className="text-slate-400">RP: </span>
              <span className="text-cyan-400 font-bold">{wallet.researchPoints}</span>
            </div>
            <div className="text-slate-600">|</div>
            <div title="Sucata de Aço">
              <span className="text-slate-400">Aço: </span>
              <span className="text-slate-300 font-bold">{wallet.steelScrapKg} kg</span>
            </div>
            <div className="text-slate-600">|</div>
            <div title="Nível de Engenheiro">
              <span className="text-amber-400 font-bold uppercase">{wallet.engineerRank}</span>
            </div>

            <button
              onClick={onClose}
              className="ml-2 text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-2 my-3">
          {(['all', 'structures', 'electricity', 'machines'] as const).map((branch) => (
            <button
              key={branch}
              onClick={() => {
                soundFx.playTactileClick();
                setSelectedBranch(branch);
              }}
              className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                selectedBranch === branch
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {branch === 'all'
                ? 'Todas as Disciplinas'
                : branch === 'structures'
                ? 'Estruturas'
                : branch === 'electricity'
                ? 'Circuitos'
                : 'Máquinas'}
            </button>
          ))}
        </div>

        {/* Content Body: Tech Graph & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2 overflow-y-auto flex-1 pr-1">
          {/* Tech Nodes List */}
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTree.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const check = canUnlockNode(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      soundFx.playTactileClick();
                      setSelectedNode(node);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                        : node.unlocked
                        ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-500/80 text-slate-300'
                        : check.canUnlock
                        ? 'bg-slate-900/60 border-amber-500/40 hover:border-amber-400 text-slate-300'
                        : 'bg-slate-950 border-slate-800/80 opacity-60 text-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                        {node.branch} • TIER {node.tier}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          node.unlocked
                            ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                            : check.canUnlock
                            ? 'bg-amber-950 border border-amber-500 text-amber-300 animate-pulse'
                            : 'bg-slate-900 border border-slate-700 text-slate-500'
                        }`}
                      >
                        {node.unlocked ? 'DESBLOQUEADO' : check.canUnlock ? 'PESQUISÁVEL' : 'BLOQUEADO'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mt-1">{node.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{node.description}</p>

                    <div className="flex justify-between items-center text-xs font-mono mt-3 pt-2 border-t border-slate-800">
                      <span className="text-cyan-400">{node.rpCost} RP</span>
                      <span className="text-emerald-400">${node.creditsCost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Tech Inspector & Unlock Action */}
          {selectedNode && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    ESPECIFICAÇÃO DE PATENTE
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedNode.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-300">
                      Tier {selectedNode.tier}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-300 uppercase">
                      {selectedNode.branch}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-400 font-mono">DESCRIÇÃO TÉCNICA:</div>
                  <p className="text-slate-200 leading-relaxed">{selectedNode.description}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="text-cyan-400 font-bold uppercase">RECURSO LIBERADO:</div>
                  <div className="text-slate-200">{selectedNode.unlockedFeatureLabel}</div>
                </div>

                {/* Cost Breakdown */}
                {!selectedNode.unlocked && (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="text-slate-400 font-bold">CUSTO DE DESBLOQUEIO:</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pontos de P&D (RP):</span>
                      <span className={wallet.researchPoints >= selectedNode.rpCost ? 'text-cyan-400' : 'text-rose-400'}>
                        {wallet.researchPoints} / {selectedNode.rpCost} RP
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Créditos da Forja:</span>
                      <span className={wallet.credits >= selectedNode.creditsCost ? 'text-emerald-400' : 'text-rose-400'}>
                        ${wallet.credits} / ${selectedNode.creditsCost}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800">
                {selectedNode.unlocked ? (
                  <div className="w-full py-2.5 bg-emerald-950/60 border border-emerald-500/80 rounded-lg text-emerald-300 font-mono text-xs font-bold text-center">
                    ✓ TECNOLOGIA JÁ ATIVA NA FORJA
                  </div>
                ) : (
                  (() => {
                    const check = canUnlockNode(selectedNode.id);
                    return (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleUnlock(selectedNode.id)}
                          disabled={!check.canUnlock}
                          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono font-bold text-xs rounded transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                        >
                          PESQUISAR E HOMOLOGAR PATENTE
                        </button>
                        {!check.canUnlock && (
                          <div className="text-[11px] text-rose-400 text-center font-mono">
                            {check.reason}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
