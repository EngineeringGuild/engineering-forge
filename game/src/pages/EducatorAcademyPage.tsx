import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEducatorStore } from '../educator/educatorStore';
import {
  CURRICULUM_STANDARDS,
  type EducationalDiscipline,
  type DifficultyGrade,
  type EducatorTrack,
  type EducatorLevelDef,
} from '../educator/educatorTypes';
import {
  encodeTrackToUrlHash,
  exportToClassPackage,
} from '../educator/educatorPackaging';
import { soundFx } from '../audio/soundFx';
import { EducatorRubricModal } from '../components/EducatorRubricModal';
import { LiveClassroomComparator } from '../components/LiveClassroomComparator';

export function EducatorAcademyPage() {
  const { tracks, addTrack, deleteTrack, importTrack } = useEducatorStore();

  const [activeTab, setActiveTab] = useState<'tracks' | 'create' | 'import'>('tracks');
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [importInput, setImportInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rubricLevelModal, setRubricLevelModal] = useState<EducatorLevelDef | null>(null);
  const [comparatorLevelModal, setComparatorLevelModal] = useState<EducatorLevelDef | null>(null);

  // New Track form state
  const [title, setTitle] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [institution, setInstitution] = useState('');
  const [discipline, setDiscipline] = useState<EducationalDiscipline>('structures');
  const [gradeLevel, setGradeLevel] = useState<DifficultyGrade>('high-school');
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['EM13CNT102']);

  // Level 1 form state
  const [lvlTitle, setLvlTitle] = useState('Vão Livre Experimental');
  const [lvlDescription, setLvlDescription] = useState('Projete uma estrutura triangular para suportar carga pontual.');
  const [lvlBudget, setLvlBudget] = useState(150);
  const [lvlSafetyFactor, setLvlSafetyFactor] = useState(1.5);
  const [lvlHint, setLvlHint] = useState('Distribua os nós uniformemente sobre o vão para minimizar os momentos fletores.');

  const handleCopyDeepLink = (track: EducatorTrack) => {
    soundFx.playTactileClick();
    const hash = encodeTrackToUrlHash(track);
    const url = `${window.location.origin}/educator#track=${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedTrackId(track.id);
      setTimeout(() => setCopiedTrackId(null), 2500);
    });
  };

  const handleDownloadPackage = (track: EducatorTrack) => {
    soundFx.playTactileClick();
    const pkg = exportToClassPackage(track);
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.id}.forge-class`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playTactileClick();
    setImportFeedback(null);

    if (!importInput.trim()) {
      setImportFeedback({ type: 'error', message: 'Cole o link de sala de aula ou o conteúdo JSON do pacote.' });
      return;
    }

    // Extract hash from URL if full URL is pasted
    let payload = importInput.trim();
    if (payload.includes('#track=')) {
      payload = payload.split('#track=')[1];
    }

    const res = importTrack(payload);
    if (res.success) {
      setImportFeedback({ type: 'success', message: `Trilha "${res.track?.title}" importada com sucesso!` });
      setImportInput('');
      setTimeout(() => setActiveTab('tracks'), 1200);
    } else {
      setImportFeedback({ type: 'error', message: res.error || 'Erro ao importar pacote.' });
    }
  };

  const handleCreateTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playTactileClick();

    if (!title.trim() || !teacherName.trim()) {
      return;
    }

    const firstLevel: EducatorLevelDef = {
      id: `edu-lvl-${Date.now().toString(36)}`,
      schemaVersion: 'forge-educator/1.0',
      title: lvlTitle,
      discipline,
      description: lvlDescription,
      learningObjectives: ['Aplicar princípios de equilíbrio e dimensionamento sob restrição orçamentária'],
      curriculumCodes: selectedStandards,
      difficultyGrade: gradeLevel,
      inventory: {
        allowedMaterials: ['wood', 'steel', 'cable'],
        budgetLimit: lvlBudget,
      },
      rubric: {
        safetyFactorMinimum: lvlSafetyFactor,
        targetEfficiencyPercent: 80,
        revealHintAfterAttempts: 2,
        pedagogicalHint: lvlHint,
      },
      geometry: {
        spanWidthMeters: 16,
        fixedAnchorsCount: 1,
        rollerAnchorsCount: 1,
        targetLoadKn: 40,
      },
    };

    const newTrack: EducatorTrack = {
      id: `track-${Date.now().toString(36)}`,
      title,
      teacherName,
      institution: institution.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      discipline,
      gradeLevel,
      curriculumTags: selectedStandards,
      isPublished: true,
      levels: [firstLevel],
    };

    addTrack(newTrack);
    setActiveTab('tracks');
  };

  return (
    <div className="min-h-screen bg-bg text-fg py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            onMouseEnter={() => soundFx.playSubtleHover()}
            onClick={() => soundFx.playTactileClick()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-1.5 font-mono text-xs text-fg-muted hover:border-accent hover:text-fg transition-all active:scale-95"
          >
            <span className="text-accent">←</span>
            <span>VOLTAR À FORJA</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-[11px] text-fg-subtle">
            <span className="led-indicator led-cyan animate-pulse" />
            <span>MODO EDUCADOR: ATIVO (DOC-08)</span>
          </div>
        </div>

        {/* Hero Title Card */}
        <header className="industrial-panel rounded-xl p-6 mb-8 border border-border shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/15 border border-accent/40 text-accent text-3xl shadow-inner">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                    ACADEMIA DO EDUCADOR & TURMAS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-fg-subtle">
                    BNCC / NGSS / ABET
                  </span>
                </div>
                <h1 className="font-display text-3xl font-extrabold text-fg mt-1">
                  Gestor de Trilhas & Currículo de Engenharia
                </h1>
                <p className="mt-1 text-sm text-fg-muted max-w-2xl font-sans">
                  Monte sequências didáticas personalizadas, restrinja materiais disponíveis, estabeleça gabaritos analíticos por fator de segurança ($SF$) e gere links instantâneos para seus alunos sem necessidade de servidor externo.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-border/80 pb-3">
          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('tracks');
            }}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              activeTab === 'tracks'
                ? 'bg-accent text-accent-foreground shadow-[0_0_12px_rgba(255,106,44,0.3)]'
                : 'bg-surface-1 text-fg-muted hover:text-fg border border-border'
            }`}
          >
            <span>📚 Trilhas Curriculares</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-2 text-[10px] text-fg">
              {tracks.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('create');
            }}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-accent text-accent-foreground shadow-[0_0_12px_rgba(255,106,44,0.3)]'
                : 'bg-surface-1 text-fg-muted hover:text-fg border border-border'
            }`}
          >
            <span>➕ Criar Nova Trilha</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTactileClick();
              setActiveTab('import');
            }}
            onMouseEnter={() => soundFx.playSubtleHover()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-accent text-accent-foreground shadow-[0_0_12px_rgba(255,106,44,0.3)]'
                : 'bg-surface-1 text-fg-muted hover:text-fg border border-border'
            }`}
          >
            <span>📥 Importar Pacote</span>
          </button>
        </div>

        {/* Tab 1: Tracks List */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="industrial-panel rounded-xl p-5 border border-border hover:border-accent/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-accent font-semibold uppercase">
                        {track.discipline}
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-2 border border-border text-fg-subtle">
                        {track.gradeLevel}
                      </span>
                      <span className="font-mono text-[11px] text-fg-subtle">
                        {track.levels.length} {track.levels.length === 1 ? 'Desafio' : 'Desafios'}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-fg mt-2">{track.title}</h3>
                    <p className="text-xs text-fg-muted mt-0.5">
                      Autor: <strong className="text-fg">{track.teacherName}</strong>
                      {track.institution && <span> · {track.institution}</span>}
                    </p>

                    {/* Competency Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {track.curriculumTags.map((code) => {
                        const standard = CURRICULUM_STANDARDS[code];
                        return (
                          <span
                            key={code}
                            title={standard?.description || code}
                            className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-surface-2/80 border border-border text-info"
                          >
                            <span>🏷️</span>
                            <span>{code}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <button
                      onClick={() => handleCopyDeepLink(track)}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                        copiedTrackId === track.id
                          ? 'bg-success text-fg'
                          : 'bg-surface-2 hover:bg-accent hover:text-accent-foreground text-fg border border-border'
                      }`}
                    >
                      <span>🔗</span>
                      <span>{copiedTrackId === track.id ? 'Link Copiado!' : 'Link de Sala'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPackage(track)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded font-mono text-xs bg-surface-2 hover:border-accent text-fg-muted hover:text-fg border border-border flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>💾</span>
                      <span>Exportar .forge-class</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playTactileClick();
                        deleteTrack(track.id);
                      }}
                      className="text-[11px] font-mono text-danger/70 hover:text-danger mt-1"
                    >
                      Excluir Trilha
                    </button>
                  </div>
                </div>

                {/* Sub-Levels Preview */}
                <div className="mt-4 pt-3 border-t border-border/40">
                  <span className="font-mono text-[10px] uppercase text-fg-subtle tracking-wider font-semibold block mb-2">
                    Desafios Integrados nesta Trilha:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {track.levels.map((lvl, idx) => (
                      <div
                        key={lvl.id}
                        className="rounded-lg bg-surface-2/60 border border-border/60 p-2.5 text-xs font-mono"
                      >
                        <div className="flex justify-between items-center text-fg">
                          <span className="font-bold">0{idx + 1}. {lvl.title}</span>
                          <span className="text-warning">SF ≥ {lvl.rubric.safetyFactorMinimum}</span>
                        </div>
                        <div className="flex justify-between items-center text-fg-subtle text-[11px] mt-1">
                          <span>Orçamento: ${lvl.inventory.budgetLimit}</span>
                          <span>{lvl.geometry.spanWidthMeters}m Vão</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/40 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playTactileClick();
                              setComparatorLevelModal(lvl);
                            }}
                            className="px-2 py-1 bg-surface-1 hover:bg-cyan-950/60 hover:text-cyan-300 border border-border hover:border-cyan-500/50 rounded text-[11px] text-fg-subtle transition-all flex items-center gap-1"
                          >
                            <span>📺</span>
                            <span>Modo Projetor</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playTactileClick();
                              setRubricLevelModal(lvl);
                            }}
                            className="px-2 py-1 bg-surface-1 hover:bg-amber-950/60 hover:text-amber-300 border border-border hover:border-amber-500/50 rounded text-[11px] text-fg-subtle transition-all flex items-center gap-1"
                          >
                            <span>📊</span>
                            <span>Gabarito Analítico (Pareto)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rubric Modal */}
        {rubricLevelModal && (
          <EducatorRubricModal
            level={rubricLevelModal}
            onClose={() => setRubricLevelModal(null)}
          />
        )}

        {/* Classroom Comparator Modal */}
        {comparatorLevelModal && (
          <LiveClassroomComparator
            level={comparatorLevelModal}
            onClose={() => setComparatorLevelModal(null)}
          />
        )}

        {/* Tab 2: Create Track Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTrackSubmit} className="industrial-panel rounded-xl p-6 border border-border space-y-5">
            <h2 className="font-display text-xl font-bold text-fg">Cadastrar Nova Sequência Didática</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-fg-subtle mb-1">Título da Trilha *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Introdução à Estática e Fator de Segurança"
                  className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-fg-subtle mb-1">Nome do Professor / Instrutor *</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Ex: Prof. Carlos Eduardo"
                  className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-fg-subtle mb-1">Instituição / Escola</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Ex: Colégio Técnico Estadual"
                  className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Disciplina</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as EducationalDiscipline)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-2 py-2 text-sm text-fg focus:border-accent focus:outline-none font-mono"
                  >
                    <option value="structures">Estruturas</option>
                    <option value="circuits">Circuitos</option>
                    <option value="machines">Máquinas</option>
                    <option value="mechatronics">Mecatrônica</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Nível de Ensino</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as DifficultyGrade)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-2 py-2 text-sm text-fg focus:border-accent focus:outline-none font-mono"
                  >
                    <option value="middle-school">Fund. II (8º/9º)</option>
                    <option value="high-school">Ensino Médio</option>
                    <option value="undergraduate">Graduação</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Curriculum Standards Selector */}
            <div>
              <label className="block font-mono text-xs text-fg-subtle mb-2">
                Habilidades BNCC / NGSS Vinculadas:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(CURRICULUM_STANDARDS).map((std) => (
                  <label
                    key={std.code}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedStandards.includes(std.code)
                        ? 'border-accent bg-accent/10 text-fg'
                        : 'border-border bg-surface-2/60 text-fg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStandards.includes(std.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStandards([...selectedStandards, std.code]);
                        } else {
                          setSelectedStandards(selectedStandards.filter((c) => c !== std.code));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="font-mono text-accent">{std.code} ({std.framework})</strong>
                      <p className="text-[11px] text-fg-muted line-clamp-2 mt-0.5">{std.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Level 1 Scaffold */}
            <div className="border-t border-border pt-4">
              <h3 className="font-display font-bold text-fg text-base mb-3">Configuração do 1º Desafio da Trilha</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Título do Desafio</label>
                  <input
                    type="text"
                    value={lvlTitle}
                    onChange={(e) => setLvlTitle(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Enunciado / Objetivo</label>
                  <input
                    type="text"
                    value={lvlDescription}
                    onChange={(e) => setLvlDescription(e.target.value)}
                    placeholder="Instruções para o aluno"
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Orçamento Máximo ($)</label>
                  <input
                    type="number"
                    value={lvlBudget}
                    onChange={(e) => setLvlBudget(Number(e.target.value))}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Fator de Segurança Mínimo (SF)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={lvlSafetyFactor}
                    onChange={(e) => setLvlSafetyFactor(Number(e.target.value))}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-fg-subtle mb-1">Dica Pedagógica Contextual</label>
                  <input
                    type="text"
                    value={lvlHint}
                    onChange={(e) => setLvlHint(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm text-fg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('tracks')}
                className="px-4 py-2 rounded-lg font-mono text-xs text-fg-muted hover:text-fg border border-border"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg font-mono text-xs font-bold bg-accent text-accent-foreground hover:opacity-90 shadow-[0_0_12px_rgba(255,106,44,0.3)]"
              >
                Salvar & Publicar Trilha
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Import Package */}
        {activeTab === 'import' && (
          <form onSubmit={handleImportSubmit} className="industrial-panel rounded-xl p-6 border border-border space-y-4">
            <h2 className="font-display text-xl font-bold text-fg">Importar Pacote Didático (.forge-class ou Link)</h2>
            <p className="text-xs text-fg-muted">
              Cole abaixo o link recebido do professor (URL Hash) ou o código JSON do arquivo <code>.forge-class</code>.
            </p>

            <textarea
              rows={6}
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="Cole aqui o link https://forge.guildeng.com/educator#track=... ou o JSON do pacote"
              className="w-full rounded-lg bg-surface-2 border border-border p-3 font-mono text-xs text-fg focus:border-accent focus:outline-none"
            />

            {importFeedback && (
              <div
                className={`p-3 rounded-lg font-mono text-xs ${
                  importFeedback.type === 'success'
                    ? 'bg-success/20 text-success border border-success/40'
                    : 'bg-danger/20 text-danger border border-danger/40'
                }`}
              >
                {importFeedback.message}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg font-mono text-xs font-bold bg-accent text-accent-foreground hover:opacity-90 shadow"
              >
                Importar e Validar Trilha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
