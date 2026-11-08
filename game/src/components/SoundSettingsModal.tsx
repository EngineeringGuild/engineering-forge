import { useState } from 'react';
import { soundFx } from '../audio/soundFx';

export interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettingsModal({ isOpen, onClose }: SoundSettingsModalProps) {
  const [isMuted, setIsMuted] = useState(() => soundFx.getMuted());
  const [volume, setVolume] = useState(() => Math.round(soundFx.getVolume() * 100));

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const next = !isMuted;
    soundFx.setMuted(next);
    setIsMuted(next);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundFx.setVolume(newVol / 100);
    if (isMuted && newVol > 0) {
      soundFx.setMuted(false);
      setIsMuted(false);
    }
  };

  const handleTestSound = (type: 'snap' | 'break' | 'hum' | 'spark' | 'rev' | 'victory') => {
    switch (type) {
      case 'snap':
        soundFx.playSnapNode();
        break;
      case 'break':
        soundFx.playBreak();
        break;
      case 'hum':
        soundFx.playElectricHum();
        break;
      case 'spark':
        soundFx.playSpark();
        break;
      case 'rev':
        soundFx.playEngineRev(0.8);
        break;
      case 'victory':
        soundFx.playVictory(3);
        break;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="relative flex w-full max-w-md flex-col rounded-2xl border border-accent/40 bg-surface-1 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/70 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent border border-accent/40 text-base">
              🔊
            </span>
            <div>
              <h2 id="audio-settings-title" className="font-display text-base font-bold text-fg">
                Audio & Sound Synthesizer
              </h2>
              <p className="text-[11px] text-fg-muted">
                Procedural Web Audio Engine (zero-asset synthesis)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-5">
          {/* Master Mute & Volume */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 p-3.5">
            <div>
              <span className="block font-mono text-xs font-semibold text-fg">
                Master Sound Effects
              </span>
              <span className="text-xs text-fg-muted">
                {isMuted ? 'Audio muted' : `Volume: ${volume}%`}
              </span>
            </div>
            <button
              onClick={handleToggleMute}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                isMuted
                  ? 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20'
                  : 'border border-success/40 bg-success/10 text-success hover:bg-success/20'
              }`}
            >
              {isMuted ? '🔇 Muted' : '🔊 Active'}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-fg-muted">
              <span>SFX Volume</span>
              <span className="text-fg font-bold">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={isMuted}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-3 accent-accent disabled:opacity-40"
            />
          </div>

          {/* Test Sound Bench */}
          <div>
            <span className="mb-2 block font-mono text-xs font-semibold text-fg-muted">
              Interactive Sound Synthesizer Test Bench
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTestSound('snap')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">📌</span>
                <span className="font-mono text-[11px]">Node Snap</span>
              </button>
              <button
                onClick={() => handleTestSound('break')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">💥</span>
                <span className="font-mono text-[11px]">Fracture</span>
              </button>
              <button
                onClick={() => handleTestSound('hum')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">⚡</span>
                <span className="font-mono text-[11px]">60Hz Hum</span>
              </button>
              <button
                onClick={() => handleTestSound('spark')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">✨</span>
                <span className="font-mono text-[11px]">Electric Spark</span>
              </button>
              <button
                onClick={() => handleTestSound('rev')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">🏎️</span>
                <span className="font-mono text-[11px]">Engine Roar</span>
              </button>
              <button
                onClick={() => handleTestSound('victory')}
                disabled={isMuted}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-base p-2 text-center text-xs text-fg-muted hover:border-accent hover:text-fg disabled:opacity-40 transition-colors"
              >
                <span className="text-base mb-1">🏆</span>
                <span className="font-mono text-[11px]">Victory Fanfare</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-surface-2/40 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-accent-fg hover:bg-accent/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
