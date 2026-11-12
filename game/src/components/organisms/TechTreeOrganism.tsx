import React, { useState } from 'react';
import { useForgeEconomyStore, type TechNode } from '../../state/forgeEconomyStore';
import { soundFx } from '../../audio/soundFx';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export type TechBranch = TechNode['branch'];

export interface TechTreeOrganismProps {
  className?: string;
  onNodeSelect?: (node: TechNode) => void;
}

export const TechTreeOrganism: React.FC<TechTreeOrganismProps> = ({
  className = '',
  onNodeSelect,
}) => {
  const { wallet, techTree, unlockTechNode, canUnlockNode } = useForgeEconomyStore();
  const [selectedBranch, setSelectedBranch] = useState<'all' | TechBranch>('all');
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(techTree[0] || null);

  const filteredTree = techTree.filter(
    (n) => selectedBranch === 'all' || n.branch === selectedBranch
  );

  const handleSelect = (node: TechNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
    soundFx.playSubtleHover();
  };

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
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Wallet Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-1/90 border border-border p-3 rounded-xl font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          <Badge variant="asme" size="sm">
            RANK: {wallet.engineerRank}
          </Badge>
          <span className="text-fg-subtle">|</span>
          <div title="Créditos da Forja">
            <span className="text-fg-subtle">F$: </span>
            <span className="text-emerald-400 font-bold">{wallet.credits}</span>
          </div>
          <span className="text-fg-subtle">|</span>
          <div title="Pontos de Pesquisa (P&D)">
            <span className="text-fg-subtle">RP: </span>
            <span className="text-cyan-400 font-bold">{wallet.researchPoints}</span>
          </div>
          <span className="text-fg-subtle">|</span>
          <div title="Sucata de Aço">
            <span className="text-fg-subtle">Aço: </span>
            <span className="text-fg font-bold">{wallet.steelScrapKg} kg</span>
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {(['all', 'structures', 'electricity', 'machines'] as const).map((branch) => (
            <button
              key={branch}
              type="button"
              onClick={() => {
                setSelectedBranch(branch);
                soundFx.playTactileClick();
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-all cursor-pointer ${
                selectedBranch === branch
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-surface-2 text-fg-subtle hover:text-fg border border-border'
              }`}
            >
              {branch === 'all'
                ? 'Todas as Áreas'
                : branch === 'structures'
                ? 'Estruturas'
                : branch === 'electricity'
                ? 'Eletricidade'
                : 'Máquinas'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Tree View + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Node Matrix (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] pr-1">
          {filteredTree.map((node) => {
            const isUnlocked = node.unlocked;
            const canUnlock = canUnlockNode(node.id);
            const isSelected = selectedNode?.id === node.id;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleSelect(node)}
                className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : ''
                } ${
                  isUnlocked
                    ? 'bg-cyan-950/20 border-cyan-500/40 text-fg'
                    : canUnlock
                    ? 'bg-amber-950/20 border-amber-500/50 text-fg hover:border-amber-400'
                    : 'bg-surface-1/40 border-border/40 text-fg-subtle opacity-70 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-fg-subtle">
                      Tier {node.tier}
                    </span>
                    <Badge
                      variant={isUnlocked ? 'success' : canUnlock ? 'warning' : 'default'}
                      size="xs"
                    >
                      {isUnlocked ? 'DESBLOQUEADO' : canUnlock ? 'DISPONÍVEL' : 'BLOQUEADO'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-fg leading-tight mb-1">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-fg-muted line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-fg-subtle">{node.rpCost} RP</span>
                  <span className="text-fg-subtle">{node.creditsCost} F$</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="industrial-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="border-b border-border pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                    TIER {selectedNode.tier} • {selectedNode.branch.toUpperCase()}
                  </span>
                  <Badge
                    variant={selectedNode.unlocked ? 'success' : canUnlockNode(selectedNode.id) ? 'warning' : 'danger'}
                    size="xs"
                    dot
                  >
                    {selectedNode.unlocked ? 'ATIVO' : canUnlockNode(selectedNode.id) ? 'PESQUISÁVEL' : 'REQUISITO PENDENTE'}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-fg">{selectedNode.name}</h3>
              </div>

              <p className="text-xs text-fg-muted leading-relaxed">
                {selectedNode.description}
              </p>

              {/* Research Investment Costs */}
              <div className="bg-surface-2/60 p-2.5 rounded-lg border border-border space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-fg-subtle uppercase tracking-wider font-bold">
                  Custos de Pesquisa:
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Pontos de Pesquisa (RP):</span>
                  <span
                    className={`font-bold ${
                      wallet.researchPoints >= selectedNode.rpCost ? 'text-cyan-400' : 'text-red-400'
                    }`}
                  >
                    {selectedNode.rpCost} RP (Saldo: {wallet.researchPoints})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Créditos da Forja (F$):</span>
                  <span
                    className={`font-bold ${
                      wallet.credits >= selectedNode.creditsCost ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {selectedNode.creditsCost} F$ (Saldo: {wallet.credits})
                  </span>
                </div>
                <div className="pt-1 border-t border-border/40 text-[11px] text-cyan-300">
                  Desbloqueia: {selectedNode.unlockedFeatureLabel}
                </div>
              </div>

              {/* Prerequisite Tags */}
              {selectedNode.requiredNodeIds.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-fg-subtle uppercase">
                    Pré-requisitos Operacionais:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.requiredNodeIds.map((preId: string) => {
                      const pre = techTree.find((n) => n.id === preId);
                      const isPreUnlocked = pre?.unlocked;
                      return (
                        <span
                          key={preId}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isPreUnlocked
                              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-950/30 text-red-300 border-red-500/40'
                          }`}
                        >
                          {pre ? pre.name : preId} {isPreUnlocked ? '✓' : '✗'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-fg-subtle font-mono text-xs">
              Selecione um nó tecnológico para visualizar requisitos
            </div>
          )}

          {selectedNode && (
            <div className="pt-3 border-t border-border mt-3">
              {selectedNode.unlocked ? (
                <div className="w-full text-center py-2 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-emerald-400 font-mono text-xs font-bold">
                  ✓ NÓ ATIVO NA FORJA
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!canUnlockNode(selectedNode.id)}
                  onClick={() => handleUnlock(selectedNode.id)}
                >
                  {canUnlockNode(selectedNode.id)
                    ? 'Pesquisar & Desbloquear Nó'
                    : 'Requisitos Insuficientes'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
