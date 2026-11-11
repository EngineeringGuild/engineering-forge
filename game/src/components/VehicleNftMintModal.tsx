import React, { useState } from 'react';
import {
  issueProofOfEngineering,
  type VehicleTelemetryReport,
  type ProofOfEngineeringCertificate,
} from '../web3/proofOfEngineering';
import {
  createVehicleNftMetadata,
  generateVehicleSvgArtwork,
} from '../web3/metadataGenerator';
import { soundFx } from '../audio/soundFx';

interface VehicleNftMintModalProps {
  telemetry: VehicleTelemetryReport;
  onClose: () => void;
}

export const VehicleNftMintModal: React.FC<VehicleNftMintModalProps> = ({
  telemetry,
  onClose,
}) => {
  const [cert] = useState<ProofOfEngineeringCertificate>(() =>
    issueProofOfEngineering(telemetry)
  );

  const [metadata] = useState(() => createVehicleNftMetadata(cert));
  const [svgArtwork] = useState(() => generateVehicleSvgArtwork(cert));

  const [walletConnected, setWalletConnected] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);

  const handleConnectWallet = () => {
    soundFx.playTactileClick();
    setWalletConnected(true);
  };

  const handleMintNft = () => {
    soundFx.playModeSwitch();
    setIsMinting(true);

    setTimeout(() => {
      setIsMinting(false);
      setMintTxHash(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
      soundFx.playTactileClick();
    }, 1800);
  };

  const handleCopyJson = () => {
    soundFx.playTactileClick();
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b101b] border-2 border-amber-500/60 rounded-xl max-w-4xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xl font-bold font-mono tracking-wider text-amber-300 uppercase">
                Emissão Web3 • Certificado Digital Twin NFT
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Proof-of-Engineering Protocol • Padrão ERC-721 / Metaplex • Certificação On-Chain
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 overflow-y-auto pr-2">
          {/* Left: Dynamic Visual Badge Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div
              className="w-full max-w-[340px] aspect-square rounded-lg overflow-hidden shadow-2xl border border-slate-700"
              dangerouslySetInnerHTML={{ __html: svgArtwork }}
            />
            <div className="mt-3 text-[11px] font-mono text-slate-400 text-center">
              Arte SVG Dinâmica baseada em Telemetria Real
            </div>
          </div>

          {/* Right: Technical Specs & Mint Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">STATUS DA HOMOLOGAÇÃO:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    cert.mintEligible
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                      : 'bg-rose-950 text-rose-300 border border-rose-500'
                  }`}
                >
                  {cert.mintEligible ? `ELEGÍVEL (TIER ${cert.tier.toUpperCase()})` : 'REPROVADO'}
                </span>
              </div>

              {/* Physical Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">FATOR DE SEG. (SF)</span>
                  <span className="font-bold text-emerald-400">{telemetry.safetyFactorNominal.toFixed(2)}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">VELOCIDADE MÁX</span>
                  <span className="font-bold text-cyan-400">{telemetry.maxVelocityMs.toFixed(1)} m/s</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MASSA DO VEÍCULO</span>
                  <span className="font-bold text-slate-200">{telemetry.totalMassKg.toFixed(1)} kg</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ATRITO DOS PNEUS</span>
                  <span className="font-bold text-amber-400">μ = {telemetry.tireFrictionMu.toFixed(2)}</span>
                </div>
              </div>

              {/* Hash & Signature Details */}
              <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">
                  HASH DETERMINÍSTICO: <span className="text-slate-300 break-all">{cert.deterministicHash}</span>
                </div>
                <div className="text-slate-400">
                  ORÁCULO GUILD: <span className="text-amber-400/90">{cert.guildSignature}</span>
                </div>
              </div>
            </div>

            {/* Mint Action Panel */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {mintTxHash ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-center font-mono text-xs">
                  <span className="text-emerald-300 font-bold block mb-1">
                    ✓ VEÍCULO MINTADO COM SUCESSO!
                  </span>
                  <span className="text-[10px] text-slate-400 break-all">
                    Tx: {mintTxHash}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {!walletConnected ? (
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      CONECTAR WALLET WEB3 (METAMASK / PHANTOM)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMintNft}
                      disabled={isMinting || !cert.mintEligible}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono font-bold text-xs rounded transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {isMinting ? 'MINTANDO DIGITAL TWIN NA BLOCKCHAIN...' : 'MINTAR VEÍCULO NFT (PROOF-OF-ENGINEERING)'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 font-mono text-xs text-slate-300 rounded transition-colors"
                  >
                    📋 Copiar Metadados JSON (ERC-721)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
