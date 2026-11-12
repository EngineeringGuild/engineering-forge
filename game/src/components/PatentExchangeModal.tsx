import React, { useState } from 'react';
import { usePatentExchangeStore, type PatentBlueprint } from '../state/patentExchangeStore';
import { useForgeEconomyStore } from '../state/forgeEconomyStore';
import { soundFx } from '../audio/soundFx';

interface PatentExchangeModalProps {
  onClose: () => void;
}

export const PatentExchangeModal: React.FC<PatentExchangeModalProps> = ({ onClose }) => {
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-emerald-500/60 rounded-xl max-w-5xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-500/30 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-emerald-300 uppercase">
                Bolsa de Patentes & Royalties de Blueprints
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mercado Comunitário de Projetos Homologados com Receita de Royalties (DOC-10)
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs">
            <span className="text-slate-400">Saldo Disponível:</span>
            <span className="text-emerald-400 font-bold">{wallet.credits} F$</span>
            <button
              onClick={onClose}
              className="ml-2 text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setActiveTab('catalog');
              }}
              className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              📚 Catálogo de Patentes
            </button>
            <button
              onClick={() => {
                soundFx.playTactileClick();
                setActiveTab('register');
              }}
              className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ➕ Registrar Minha Patente
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-1.5">
              {(['all', 'structures', 'electricity', 'machines'] as const).map((disc) => (
                <button
                  key={disc}
                  onClick={() => {
                    soundFx.playTactileClick();
                    setSelectedDiscipline(disc);
                  }}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                    selectedDiscipline === disc
                      ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {disc.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feedback alert */}
        {licenseFeedback && (
          <div className="p-2 mb-3 bg-slate-900 border border-emerald-500/60 rounded text-xs font-mono text-center text-emerald-300">
            {licenseFeedback}
          </div>
        )}

        {/* Content Body */}
        {activeTab === 'catalog' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2 overflow-y-auto flex-1 pr-1">
            {/* Patents List */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPatents.map((patent) => {
                  const isSelected = selectedPatent?.id === patent.id;
                  return (
                    <div
                      key={patent.id}
                      onClick={() => {
                        soundFx.playTactileClick();
                        setSelectedPatent(patent);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg shadow-emerald-950/50'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">{patent.patentNumber}</span>
                        <span className="text-slate-400 uppercase">{patent.discipline}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{patent.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Autor: {patent.authorName}</p>

                      <div className="flex justify-between items-center text-xs font-mono mt-3 pt-2 border-t border-slate-800">
                        <span className="text-amber-400">SF: {patent.technicalHighlights.safetyFactor.toFixed(2)}</span>
                        <span className="text-emerald-300 font-bold">{patent.licenseFeeCredits} F$</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Patent Details */}
            {selectedPatent && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest block mb-1">
                      REGISTRO DE PATENTE OFICIAL
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedPatent.title}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      {selectedPatent.patentNumber} • Criado por {selectedPatent.authorName}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">FATOR DE SEG. (SF)</span>
                      <span className="font-bold text-emerald-400">{selectedPatent.technicalHighlights.safetyFactor.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">CUSTO DO PROJETO</span>
                      <span className="font-bold text-white">${selectedPatent.technicalHighlights.cost}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">LICENÇAS CEDIDAS</span>
                      <span className="font-bold text-cyan-400">{selectedPatent.downloadsCount}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">ROYALTIES GERADOS</span>
                      <span className="font-bold text-amber-400">{selectedPatent.totalRoyaltiesEarned} F$</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleLicense(selectedPatent.id)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    LICENCIAR PROJETO ({selectedPatent.licenseFeeCredits} F$)
                  </button>
                  <div className="text-[10px] text-slate-500 text-center font-mono">
                    80% do valor é repassado diretamente ao inventor original.
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-xl mx-auto p-4 bg-slate-900/60 border border-slate-800 rounded-xl my-4">
            <h3 className="font-mono text-sm uppercase text-emerald-400 font-bold">
              Formulário de Depósito de Patente na Guilda
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Título do Projeto *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Treliça Espacial Warren Hiper-Rígida"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Disciplina</label>
                <select
                  value={formDiscipline}
                  onChange={(e) => setFormDiscipline(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="structures">Estruturas</option>
                  <option value="electricity">Circuitos</option>
                  <option value="machines">Máquinas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Nome do Inventor</label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Taxa de Royalty (F$)</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={formFee}
                  onChange={(e) => setFormFee(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Fator de Seg. (SF)</label>
                <input
                  type="number"
                  step="0.05"
                  value={formSafetyFactor}
                  onChange={(e) => setFormSafetyFactor(parseFloat(e.target.value) || 1.5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Custo Estimado ($)</label>
                <input
                  type="number"
                  value={formCost}
                  onChange={(e) => setFormCost(parseInt(e.target.value) || 1000)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded transition-all shadow-lg shadow-emerald-500/20 active:scale-95 mt-4"
            >
              HOMOLOGAR E PUBLICAR PATENTE NA BOLSA
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
