import React, { useState } from 'react';
import { usePatentExchangeStore, type PatentBlueprint } from '../../state/patentExchangeStore';
import { useForgeEconomyStore } from '../../state/forgeEconomyStore';
import { soundFx } from '../../audio/soundFx';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';

export interface PatentMarketplaceOrganismProps {
  className?: string;
  onPatentSelected?: (patent: PatentBlueprint) => void;
}

export const PatentMarketplaceOrganism: React.FC<PatentMarketplaceOrganismProps> = ({
  className = '',
  onPatentSelected,
}) => {
  const { registeredPatents, licensePatent } = usePatentExchangeStore();
  const wallet = useForgeEconomyStore((s) => s.wallet);

  const [activeTab, setActiveTab] = useState<'catalog' | 'register'>('catalog');
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | 'structures' | 'electricity' | 'machines'>('all');
  const [selectedPatent, setSelectedPatent] = useState<PatentBlueprint | null>(registeredPatents[0] || null);
  const [licenseFeedback, setLicenseFeedback] = useState<string | null>(null);

  // New Patent Registration Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDiscipline, setFormDiscipline] = useState<'structures' | 'electricity' | 'machines'>('structures');
  const [formAuthor, setFormAuthor] = useState('Engenheiro Guilda');
  const [formFee, setFormFee] = useState(150);
  const [formSafetyFactor, setFormSafetyFactor] = useState(1.6);
  const [formCost, setFormCost] = useState(1800);

  const filteredPatents = registeredPatents.filter(
    (p) => selectedDiscipline === 'all' || p.discipline === selectedDiscipline
  );

  const handleSelect = (patent: PatentBlueprint) => {
    setSelectedPatent(patent);
    onPatentSelected?.(patent);
    soundFx.playSubtleHover();
  };

  const handleLicense = (patentId: string) => {
    soundFx.playModeSwitch();
    const result = licensePatent(patentId, '0xCurrentPlayerWallet');
    if (result.success) {
      soundFx.playTactileClick();
      setLicenseFeedback('✓ Licença de Patente adquirida com sucesso! Blueprint liberado.');
      setTimeout(() => setLicenseFeedback(null), 3000);
    } else {
      setLicenseFeedback(`✕ Falha: ${result.reason}`);
      setTimeout(() => setLicenseFeedback(null), 3500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playTactileClick();
    if (!formTitle.trim()) return;

    usePatentExchangeStore.getState().registerNewPatent({
      title: formTitle,
      discipline: formDiscipline,
      authorName: formAuthor,
      authorWalletAddress: '0xPlayerCustomWallet999',
      licenseFeeCredits: formFee,
      blueprintPayloadJson: JSON.stringify({ title: formTitle, sf: formSafetyFactor }),
      technicalHighlights: {
        safetyFactor: formSafetyFactor,
        cost: formCost,
        partsCount: 14,
      },
    });

    setFormTitle('');
    setActiveTab('catalog');
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Top Bar: Tabs & Balance */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-1/90 border border-border p-3 rounded-xl font-mono text-xs shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('catalog');
              soundFx.playTactileClick();
            }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-surface-2 text-fg-subtle hover:text-fg border border-border'
            }`}
          >
            Catálogo de Patentes ({registeredPatents.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              soundFx.playTactileClick();
            }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-surface-2 text-fg-subtle hover:text-fg border border-border'
            }`}
          >
            + Registrar Nova Patente
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-fg-subtle">Saldo Disponível:</span>
          <span className="text-emerald-400 font-bold bg-surface-2 px-2.5 py-1 rounded border border-border">
            {wallet.credits} F$
          </span>
        </div>
      </div>

      {licenseFeedback && (
        <div
          className={`px-3 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
            licenseFeedback.startsWith('✓')
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}
        >
          {licenseFeedback}
        </div>
      )}

      {activeTab === 'catalog' ? (
        <div className="space-y-3">
          {/* Discipline Filters */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {(['all', 'structures', 'electricity', 'machines'] as const).map((disc) => (
              <button
                key={disc}
                type="button"
                onClick={() => {
                  setSelectedDiscipline(disc);
                  soundFx.playTactileClick();
                }}
                className={`px-2.5 py-1 rounded uppercase transition-all cursor-pointer ${
                  selectedDiscipline === disc
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                    : 'bg-surface-2 text-fg-subtle hover:text-fg border border-border'
                }`}
              >
                {disc === 'all'
                  ? 'Todas as Disciplinas'
                  : disc === 'structures'
                  ? 'Estruturas'
                  : disc === 'electricity'
                  ? 'Circuitos'
                  : 'Veículos & Máquinas'}
              </button>
            ))}
          </div>

          {/* Catalog & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Patents List */}
            <div className="lg:col-span-2 space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
              {filteredPatents.map((pat) => {
                const isSelected = selectedPatent?.id === pat.id;
                return (
                  <div
                    key={pat.id}
                    onClick={() => handleSelect(pat)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-400 bg-surface-2 ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'border-border bg-surface-1 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                            {pat.patentNumber}
                          </span>
                          <Badge variant="asme" size="xs">
                            {pat.discipline.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-fg-subtle">
                            por {pat.authorName}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-fg">{pat.title}</h4>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-emerald-400">
                          {pat.licenseFeeCredits} F$
                        </div>
                        <div className="text-[9px] text-fg-subtle">taxa de licença</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/40 font-mono text-[10px] text-fg-subtle">
                      <div>
                        Fator Segurança:{' '}
                        <span className="text-fg font-bold">
                          {pat.technicalHighlights.safetyFactor.toFixed(2)}x
                        </span>
                      </div>
                      <div>
                        Custo Estimado:{' '}
                        <span className="text-fg font-bold">
                          ${pat.technicalHighlights.cost}
                        </span>
                      </div>
                      <div className="text-right">
                        Downloads:{' '}
                        <span className="text-emerald-400 font-bold">
                          {pat.downloadsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Patent Detail Drawer */}
            <div className="industrial-panel p-4 rounded-xl border border-border flex flex-col justify-between">
              {selectedPatent ? (
                <div className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
                      ESPECIFICAÇÃO DE PATENTE
                    </span>
                    <h3 className="text-base font-bold text-fg mt-1">
                      {selectedPatent.title}
                    </h3>
                    <p className="text-xs text-fg-muted font-mono mt-0.5">
                      Número: {selectedPatent.patentNumber}
                    </p>
                  </div>

                  <div className="bg-surface-2/60 p-2.5 rounded-lg border border-border space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-fg-subtle">Autor / Titular:</span>
                      <span className="text-fg font-bold">{selectedPatent.authorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-subtle">Carteira Titular:</span>
                      <span className="text-fg-subtle text-[10px] truncate max-w-[140px]">
                        {selectedPatent.authorWalletAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-subtle">Taxa por Cópia:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedPatent.licenseFeeCredits} F$
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-subtle">Royalties Acumulados:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedPatent.totalRoyaltiesEarned} F$
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-fg-subtle uppercase">
                      Parâmetros Técnicos Homologados:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-surface-2 p-2 rounded border border-border">
                        <div className="text-[9px] text-fg-subtle">Fator de Segurança</div>
                        <div className="text-sm font-bold text-fg">
                          {selectedPatent.technicalHighlights.safetyFactor.toFixed(2)}x
                        </div>
                      </div>
                      <div className="bg-surface-2 p-2 rounded border border-border">
                        <div className="text-[9px] text-fg-subtle">Custo de Construção</div>
                        <div className="text-sm font-bold text-fg">
                          ${selectedPatent.technicalHighlights.cost}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-fg-subtle font-mono text-xs">
                  Selecione uma patente no catálogo
                </div>
              )}

              {selectedPatent && (
                <div className="pt-3 border-t border-border mt-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={wallet.credits < selectedPatent.licenseFeeCredits}
                    onClick={() => handleLicense(selectedPatent.id)}
                  >
                    {wallet.credits >= selectedPatent.licenseFeeCredits
                      ? `Licenciar por ${selectedPatent.licenseFeeCredits} F$`
                      : 'Saldo F$ Insuficiente'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Patent Registration Form */
        <form
          onSubmit={handleRegisterSubmit}
          className="industrial-panel p-5 rounded-xl border border-border space-y-4 max-w-2xl"
        >
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-bold text-fg uppercase font-mono">
              Registrar Novo Projeto na Bolsa de Patentes
            </h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Receba royalties de F$ sempre que outro engenheiro licenciar o seu blueprint.
            </p>
          </div>

          <div className="space-y-3">
            <Input
              label="Título do Projeto / Invenção"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Treliça Warren Super-Otimizada v3"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-fg-muted mb-1">
                  Disciplina
                </label>
                <select
                  value={formDiscipline}
                  onChange={(e) => setFormDiscipline(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-1 text-fg font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value="structures">Estruturas (Pontes/Treliças)</option>
                  <option value="electricity">Eletricidade (Circuitos)</option>
                  <option value="machines">Máquinas & Veículos</option>
                </select>
              </div>

              <Input
                label="Autor / Inventor"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Taxa de Licença"
                type="number"
                unit="F$"
                value={formFee}
                onChange={(e) => setFormFee(Number(e.target.value))}
                min={10}
                max={5000}
              />
              <Input
                label="Fator de Segurança"
                type="number"
                step="0.1"
                unit="x"
                value={formSafetyFactor}
                onChange={(e) => setFormSafetyFactor(Number(e.target.value))}
              />
              <Input
                label="Custo de Fabricação"
                type="number"
                unit="$"
                value={formCost}
                onChange={(e) => setFormCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActiveTab('catalog')}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Homologar & Registrar Patente
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
